import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

const DEMO_RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

export async function GET() {
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, restaurant_id, category, item_name, description, price, image_url, is_available, is_popular, is_special, created_at"
    )
    .eq("restaurant_id", DEMO_RESTAURANT_ID)
    .eq("is_available", true)
    .order("created_at", { ascending: true });

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
    menuItems: data ?? [],
  });
}