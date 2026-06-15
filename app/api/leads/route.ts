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

type LeadStatus = "new" | "contacted" | "closed";

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

  return NextResponse.json({
    success: true,
    leads: data ?? [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customerName =
      typeof body.customerName === "string" ? body.customerName.trim() : "";

    const customerPhone =
      typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";

    const customerEmail =
      typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";

    const interest =
      typeof body.interest === "string" ? body.interest.trim() : "";

    const sessionId =
      typeof body.sessionId === "string" && body.sessionId.trim()
        ? body.sessionId.trim()
        : null;

    if (!customerName || !customerPhone || !interest) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, phone, and interest are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        session_id: sessionId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        interest,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully.",
      lead: data,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while submitting lead.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const adminError = await requireAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const body = await request.json();

    const leadId = typeof body.leadId === "string" ? body.leadId.trim() : "";
    const status = body.status as LeadStatus | undefined;

    const allowedStatuses: LeadStatus[] = ["new", "contacted", "closed"];

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead ID is required.",
        },
        { status: 400 }
      );
    }

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead status.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .update({ status })
      .eq("id", leadId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Lead marked as ${status}.`,
      lead: data,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating lead.",
      },
      { status: 500 }
    );
  }
}