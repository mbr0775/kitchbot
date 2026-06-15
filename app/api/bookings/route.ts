import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

type BookingStatus = "pending" | "confirmed" | "cancelled";

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
    .from("bookings")
    .select(
      "id, session_id, customer_name, customer_phone, booking_date, booking_time, guests_count, special_request, status, created_at"
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
    bookings: data ?? [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
      guestsCount,
      specialRequest,
    } = body;

    if (!customerName || !customerPhone || !bookingDate || !bookingTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, phone, date, and time are required.",
        },
        { status: 400 }
      );
    }

    if (!guestsCount || Number(guestsCount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Guests count must be at least 1.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        session_id: null,
        customer_name: customerName,
        customer_phone: customerPhone,
        booking_date: bookingDate,
        booking_time: bookingTime,
        guests_count: Number(guestsCount),
        special_request: specialRequest || null,
        status: "pending",
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
      message: "Booking request submitted successfully.",
      booking: data,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating booking.",
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

    const bookingId = body.bookingId as string | undefined;
    const status = body.status as BookingStatus | undefined;

    const allowedStatuses: BookingStatus[] = [
      "pending",
      "confirmed",
      "cancelled",
    ];

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking status.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
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
      message: `Booking marked as ${status}.`,
      booking: data,
    });
  } catch (error) {
    console.error("Update booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating booking.",
      },
      { status: 500 }
    );
  }
}