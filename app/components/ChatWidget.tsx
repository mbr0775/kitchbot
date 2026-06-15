"use client";

import { useEffect, useRef, useState } from "react";
import BookingForm from "./BookingForm";
import LeadForm from "./LeadForm";
import MenuGrid from "./MenuGrid";
import QuickReplies from "./QuickReplies";

type ChatWidgetProps = {
  isDarkMode: boolean;
  onClose: () => void;
};

type OpeningHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

type RestaurantInfo = {
  id: string;
  restaurant_name: string;
  address: string | null;
  phone: string | null;
  opening_hours: OpeningHours | null;
  special_offers: string | null;
  delivery_info: string | null;
};

type Message = {
  role: "bot" | "user";
  text?: string;
  type?: "text" | "menu" | "booking" | "lead";
  sessionId?: string;
};

type ChatApiResponse = {
  success: boolean;
  sessionId?: string;
  reply?: string;
  message?: string;
};

export default function ChatWidget({ isDarkMode, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      type: "text",
      text: "Hi 👋 I’m KitchBot. I can help you with menu, opening hours, bookings, and restaurant information.",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(
    null
  );
  const [isBotTyping, setIsBotTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string>("");

  const getOrCreateSessionId = () => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    if (typeof window === "undefined") {
      return "";
    }

    const existingSessionId = localStorage.getItem("kitchbot_session_id");

    if (existingSessionId) {
      sessionIdRef.current = existingSessionId;
      return existingSessionId;
    }

    const newSessionId = crypto.randomUUID();
    localStorage.setItem("kitchbot_session_id", newSessionId);
    sessionIdRef.current = newSessionId;

    return newSessionId;
  };

  useEffect(() => {
    const loadRestaurantInfo = async () => {
      try {
        const response = await fetch("/api/restaurant");
        const result = await response.json();

        if (result.success) {
          setRestaurantInfo(result.restaurant);
        }
      } catch (error) {
        console.error("Failed to load restaurant info:", error);
      }
    };

    loadRestaurantInfo();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  const shouldShowMenu = (text: string) => {
    const message = text.toLowerCase();

    return (
      message.includes("show menu") ||
      message.includes("menu") ||
      message.includes("food") ||
      message.includes("items") ||
      message.includes("dish") ||
      message.includes("dishes")
    );
  };

  const shouldShowBookingForm = (text: string) => {
    const message = text.toLowerCase();

    return (
      message.includes("book") ||
      message.includes("table") ||
      message.includes("reservation") ||
      message.includes("reserve")
    );
  };

  const shouldShowLeadForm = (text: string) => {
    const message = text.toLowerCase();

    return (
      message === "contact" ||
      message.includes("contact me") ||
      message.includes("call me") ||
      message.includes("team contact") ||
      message.includes("talk to staff") ||
      message.includes("talk to team") ||
      message.includes("support") ||
      message.includes("catering") ||
      message.includes("party order") ||
      message.includes("event order") ||
      message.includes("bulk order") ||
      message.includes("whatsapp") ||
      message.includes("inquiry") ||
      message.includes("enquiry")
    );
  };

  const addUserMessage = (text: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        type: "text",
        text,
      },
    ]);
  };

  const addBotMessage = (message: Message) => {
    setMessages((currentMessages) => [...currentMessages, message]);
  };

  const sendToGemini = async (userText: string) => {
    try {
      setIsBotTyping(true);

      const currentSessionId = getOrCreateSessionId();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          sessionId: currentSessionId,
        }),
      });

      const result = (await response.json()) as ChatApiResponse;

      if (!response.ok || !result.success) {
        addBotMessage({
          role: "bot",
          type: "text",
          text:
            result.message ||
            "Sorry, I could not process that message right now.",
        });
        return;
      }

      if (result.sessionId) {
        sessionIdRef.current = result.sessionId;
        localStorage.setItem("kitchbot_session_id", result.sessionId);
      }

      addBotMessage({
        role: "bot",
        type: "text",
        text:
          result.reply ||
          "Sorry, I could not generate a reply right now. Please try again.",
      });
    } catch (error) {
      console.error("Chat request error:", error);

      addBotMessage({
        role: "bot",
        type: "text",
        text: "Something went wrong while contacting KitchBot AI. Please try again.",
      });
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleUserMessage = async (userText: string) => {
    const trimmedText = userText.trim();

    if (!trimmedText || isBotTyping) return;

    addUserMessage(trimmedText);

    if (shouldShowMenu(trimmedText)) {
      addBotMessage({
        role: "bot",
        type: "menu",
      });
      return;
    }

    if (shouldShowBookingForm(trimmedText)) {
      addBotMessage({
        role: "bot",
        type: "booking",
        text: `Of course 😊 Please fill this quick booking form for ${
          restaurantInfo?.restaurant_name ?? "the restaurant"
        }.`,
      });
      return;
    }

    if (shouldShowLeadForm(trimmedText)) {
      const currentSessionId = getOrCreateSessionId();

      addBotMessage({
        role: "bot",
        type: "lead",
        sessionId: currentSessionId,
        text: `Sure 😊 Please leave your contact details and ${
          restaurantInfo?.restaurant_name ?? "our restaurant"
        } team will get back to you.`,
      });
      return;
    }

    await sendToGemini(trimmedText);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageToSend = inputValue;
    setInputValue("");
    await handleUserMessage(messageToSend);
  };

  const handleQuickReply = async (reply: string) => {
    await handleUserMessage(reply);
  };

  const handleBookingSuccess = (successMessage: string) => {
    addBotMessage({
      role: "bot",
      type: "text",
      text: successMessage,
    });
  };

  const handleLeadSuccess = (successMessage: string) => {
    addBotMessage({
      role: "bot",
      type: "text",
      text: successMessage,
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${
        isDarkMode
          ? "bg-slate-950 text-white"
          : "bg-[#fff7fa] text-slate-950"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between bg-[#FF0052] px-5 py-4 text-white shadow-lg">
        <div>
          <h2 className="text-xl font-black">KitchBot</h2>
          <p className="text-xs text-white/80">
            Online •{" "}
            {restaurantInfo?.restaurant_name ?? "AI Restaurant Assistant"}
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold transition hover:bg-white/30"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
        <div
          className={`min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-6 ${
            isDarkMode ? "bg-slate-950" : "bg-[#fff7fa]"
          }`}
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${message.type}-${index}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "menu" ? (
                <div
                  className={`w-full rounded-3xl border p-4 shadow-sm ${
                    isDarkMode
                      ? "border-white/10 bg-slate-900"
                      : "border-pink-100 bg-white"
                  }`}
                >
                  <MenuGrid isDarkMode={isDarkMode} />
                </div>
              ) : message.type === "booking" ? (
                <div
                  className={`w-full max-w-2xl rounded-3xl border p-5 shadow-sm ${
                    isDarkMode
                      ? "border-white/10 bg-slate-900 text-white"
                      : "border-pink-100 bg-white text-slate-950"
                  }`}
                >
                  <p
                    className={`text-sm leading-6 md:text-base ${
                      isDarkMode ? "text-slate-100" : "text-slate-700"
                    }`}
                  >
                    {message.text}
                  </p>

                  <BookingForm
                    isDarkMode={isDarkMode}
                    onSuccess={handleBookingSuccess}
                  />
                </div>
              ) : message.type === "lead" ? (
                <div
                  className={`w-full max-w-2xl rounded-3xl border p-5 shadow-sm ${
                    isDarkMode
                      ? "border-white/10 bg-slate-900 text-white"
                      : "border-pink-100 bg-white text-slate-950"
                  }`}
                >
                  <p
                    className={`text-sm leading-6 md:text-base ${
                      isDarkMode ? "text-slate-100" : "text-slate-700"
                    }`}
                  >
                    {message.text}
                  </p>

                  <LeadForm
                    isDarkMode={isDarkMode}
                    sessionId={message.sessionId}
                    onSuccess={handleLeadSuccess}
                  />
                </div>
              ) : (
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-3xl px-5 py-4 text-sm leading-6 md:max-w-[65%] md:text-base ${
                    message.role === "user"
                      ? "bg-[#FF0052] text-white"
                      : isDarkMode
                        ? "bg-slate-800 text-slate-100"
                        : "bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          ))}

          {isBotTyping && (
            <div className="flex justify-start">
              <div
                className={`rounded-3xl px-5 py-4 text-sm font-semibold ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-100"
                    : "bg-white text-slate-700 shadow-sm"
                }`}
              >
                KitchBot is typing...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <QuickReplies onSelect={handleQuickReply} isDarkMode={isDarkMode} />

        <div
          className={`flex shrink-0 gap-2 border-t p-3 md:p-4 ${
            isDarkMode
              ? "border-white/10 bg-slate-900"
              : "border-pink-100 bg-white"
          }`}
        >
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            disabled={isBotTyping}
            className={`min-w-0 flex-1 rounded-full border px-5 py-4 text-sm outline-none md:text-base ${
              isDarkMode
                ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-400"
                : "border-pink-100 bg-[#fff7fa] text-slate-950 placeholder:text-slate-400"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          />

          <button
            onClick={sendMessage}
            disabled={isBotTyping}
            className="rounded-full bg-[#FF0052] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60 md:px-8 md:text-base"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}