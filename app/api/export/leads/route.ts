import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const ADMIN_EMAIL = "mubassirnasar@gmail.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized. Missing admin token.",
      },
      { status: 401 }
    );
  }

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized admin access.",
      },
      { status: 403 }
    );
  }

  return null;
}

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";

  const text = String(value).replace(/\r?\n|\r/g, " ");

  if (/[",]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function buildCsv(headers: string[], rows: Record<string, unknown>[]) {
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(",")
    ),
  ];

  return `\uFEFF${csvRows.join("\r\n")}`;
}

export async function GET(request: Request) {
  const adminError = await requireAdmin(request);

  if (adminError) {
    return adminError;
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .select(
      "id, session_id, customer_name, customer_phone, customer_email, interest, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }

  const headers = [
    "id",
    "session_id",
    "customer_name",
    "customer_phone",
    "customer_email",
    "interest",
    "status",
    "created_at",
  ];

  const csv = buildCsv(headers, data ?? []);
  const fileName = `kitchbot-leads-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}