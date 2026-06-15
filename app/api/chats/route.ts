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

export async function GET(request: Request) {
  const adminError = await requireAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (sessionId) {
      const { data, error } = await supabaseAdmin
        .from("chat_messages")
        .select("id, session_id, role, message, timestamp")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

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
        messages: data ?? [],
      });
    }

    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .select(
        "id, session_id, visitor_name, visitor_phone, visitor_email, started_at, ended_at, total_messages"
      )
      .order("started_at", { ascending: false });

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
      sessions: data ?? [],
    });
  } catch (error) {
    console.error("Load chats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while loading chat history.",
      },
      { status: 500 }
    );
  }
}