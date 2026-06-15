import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "mubassirnasar@gmail.com";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing Supabase server key. Please check SUPABASE_SERVICE_ROLE_KEY in .env.local and restart npm run dev.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json();
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    if (!password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Password and re-enter password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return NextResponse.json(
        {
          success: false,
          message: listError.message,
        },
        { status: 500 }
      );
    }

    const existingAdmin = users.find(
      (user) => user.email?.toLowerCase() === ADMIN_EMAIL
    );

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin account already exists. Please use Login or Change Password.",
        },
        { status: 409 }
      );
    }

    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
      },
    });

    if (createError) {
      return NextResponse.json(
        {
          success: false,
          message: createError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin password created successfully.",
    });
  } catch (error) {
    console.error("Create password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating admin password.",
      },
      { status: 500 }
    );
  }
}