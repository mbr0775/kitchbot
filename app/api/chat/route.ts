import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateKitchBotReply } from "@/lib/gemini";
import { buildKitchBotPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

const DEMO_RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userMessage =
      typeof body.message === "string" ? body.message.trim() : "";

    const sessionId =
      typeof body.sessionId === "string" && body.sessionId.trim()
        ? body.sessionId.trim()
        : crypto.randomUUID();

    if (!userMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    const [{ data: restaurant, error: restaurantError }, { data: menuItems, error: menuError }] =
      await Promise.all([
        supabaseAdmin
          .from("restaurant_info")
          .select(
            "restaurant_name, address, phone, opening_hours, special_offers, delivery_info"
          )
          .eq("id", DEMO_RESTAURANT_ID)
          .single(),

        supabaseAdmin
          .from("menu_items")
          .select(
            "category, item_name, description, price, is_popular, is_special"
          )
          .eq("restaurant_id", DEMO_RESTAURANT_ID)
          .eq("is_available", true)
          .order("created_at", { ascending: true }),
      ]);

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        {
          success: false,
          message:
            restaurantError?.message || "Restaurant information not found.",
        },
        { status: 500 }
      );
    }

    if (menuError) {
      return NextResponse.json(
        {
          success: false,
          message: menuError.message,
        },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("chat_sessions").upsert(
      {
        session_id: sessionId,
      },
      {
        onConflict: "session_id",
      }
    );

    await supabaseAdmin.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      message: userMessage,
    });

    const prompt = buildKitchBotPrompt({
      restaurant,
      menuItems: menuItems ?? [],
      userMessage,
    });

    const botReply = await generateKitchBotReply(prompt);

    await supabaseAdmin.from("chat_messages").insert({
      session_id: sessionId,
      role: "bot",
      message: botReply,
    });

    const { count } = await supabaseAdmin
      .from("chat_messages")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("session_id", sessionId);

    await supabaseAdmin
      .from("chat_sessions")
      .update({
        total_messages: count ?? 0,
      })
      .eq("session_id", sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      reply: botReply,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while generating chat reply.",
      },
      { status: 500 }
    );
  }
}