import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ADMIN_EMAIL = "mubassirnasar@gmail.com";
const DEMO_RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

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

export async function GET() {
  const { data, error } = await supabase
    .from("restaurant_info")
    .select(
      "id, restaurant_name, address, phone, opening_hours, special_offers, delivery_info, created_at"
    )
    .eq("id", DEMO_RESTAURANT_ID)
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
    restaurant: data,
  });
}

export async function PATCH(request: Request) {
  const adminError = await requireAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const body = await request.json();

    const {
      restaurantName,
      address,
      phone,
      openingHours,
      specialOffers,
      deliveryInfo,
    } = body;

    if (!restaurantName || !String(restaurantName).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("restaurant_info")
      .update({
        restaurant_name: String(restaurantName).trim(),
        address: address ? String(address).trim() : null,
        phone: phone ? String(phone).trim() : null,
        opening_hours: openingHours ?? {},
        special_offers: specialOffers ? String(specialOffers).trim() : null,
        delivery_info: deliveryInfo ? String(deliveryInfo).trim() : null,
      })
      .eq("id", DEMO_RESTAURANT_ID)
      .select(
        "id, restaurant_name, address, phone, opening_hours, special_offers, delivery_info, created_at"
      )
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
      message: "Restaurant settings updated successfully.",
      restaurant: data,
    });
  } catch (error) {
    console.error("Update restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating restaurant settings.",
      },
      { status: 500 }
    );
  }
}