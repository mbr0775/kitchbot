"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ChatSession = {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  started_at: string;
  ended_at: string | null;
  total_messages: number;
};

type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "bot";
  message: string;
  timestamp: string;
};

type ChatSessionsResponse = {
  success: boolean;
  message?: string;
  sessions?: ChatSession[];
};

type ChatMessagesResponse = {
  success: boolean;
  message?: string;
  messages?: ChatMessage[];
};

async function readJsonSafely<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `API returned non-JSON response. Status: ${response.status}. First part: ${text.slice(
        0,
        80
      )}`
    );
  }

  return JSON.parse(text) as T;
}

export default function AdminChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const getAdminToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? "";
  };

  const loadSessions = useCallback(async () => {
    setChatMessage("");
    setIsLoadingSessions(true);

    try {
      const token = await getAdminToken();

      if (!token) {
        setChatMessage("Admin session expired. Please log in again.");
        return;
      }

      const response = await fetch("/api/chats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await readJsonSafely<ChatSessionsResponse>(response);

      if (!response.ok || !result.success) {
        setChatMessage(result.message || "Failed to load chat sessions.");
        return;
      }

      setSessions(result.sessions ?? []);
    } catch (error) {
      console.error("Load chat sessions error:", error);

      if (error instanceof Error) {
        setChatMessage(error.message);
      } else {
        setChatMessage("Something went wrong while loading chat sessions.");
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const loadMessages = async (sessionId: string) => {
    setChatMessage("");
    setSelectedSessionId(sessionId);
    setIsLoadingMessages(true);

    try {
      const token = await getAdminToken();

      if (!token) {
        setChatMessage("Admin session expired. Please log in again.");
        return;
      }

      const response = await fetch(
        `/api/chats?sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await readJsonSafely<ChatMessagesResponse>(response);

      if (!response.ok || !result.success) {
        setChatMessage(result.message || "Failed to load chat messages.");
        return;
      }

      setMessages(result.messages ?? []);
    } catch (error) {
      console.error("Load chat messages error:", error);

      if (error instanceof Error) {
        setChatMessage(error.message);
      } else {
        setChatMessage("Something went wrong while loading chat messages.");
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSessions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSessions]);

  const selectedSession = sessions.find(
    (session) => session.session_id === selectedSessionId
  );

  return (
    <section className="mb-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black">Customer Chat History</h2>
          <p className="mt-1 text-sm text-slate-500">
            View customer conversations saved from KitchBot AI.
          </p>
        </div>

        <button
          onClick={loadSessions}
          className="rounded-full border border-pink-200 px-5 py-3 text-sm font-bold text-[#FF0052] transition hover:bg-pink-50"
        >
          Refresh Chats
        </button>
      </div>

      {chatMessage && (
        <div className="mb-5 rounded-2xl bg-[#fff7fa] px-5 py-4 text-sm font-semibold text-slate-700">
          {chatMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-slate-400">
            Sessions
          </h3>

          {isLoadingSessions ? (
            <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
              Loading chat sessions...
            </p>
          ) : sessions.length === 0 ? (
            <p className="rounded-2xl bg-[#fff7fa] p-5 text-sm font-semibold text-slate-500">
              No chat sessions yet. Send a normal AI message first, not only
              Show Menu or Book Table.
            </p>
          ) : (
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadMessages(session.session_id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedSessionId === session.session_id
                      ? "border-[#FF0052] bg-pink-50"
                      : "border-pink-100 bg-[#fff7fa] hover:border-[#FF0052]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">
                        {session.session_id}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Started:{" "}
                        {new Date(session.started_at).toLocaleString()}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#FF0052]">
                      {session.total_messages} msgs
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-slate-400">
            Conversation
          </h3>

          {!selectedSessionId ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl bg-[#fff7fa] p-5 text-center">
              <p className="text-sm font-semibold text-slate-500">
                Select a chat session to view messages.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#fff7fa] p-4">
              {selectedSession && (
                <div className="mb-4 rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-slate-950">
                    Session ID
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {selectedSession.session_id}
                  </p>
                </div>
              )}

              {isLoadingMessages ? (
                <p className="rounded-2xl bg-white p-5 text-sm font-semibold text-slate-500">
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="rounded-2xl bg-white p-5 text-sm font-semibold text-slate-500">
                  No messages found for this session.
                </p>
              ) : (
                <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
                  {messages.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex ${
                        chat.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] whitespace-pre-line rounded-3xl px-5 py-4 text-sm leading-6 ${
                          chat.role === "user"
                            ? "bg-[#FF0052] text-white"
                            : "bg-white text-slate-700 shadow-sm"
                        }`}
                      >
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] opacity-70">
                          {chat.role === "user" ? "Customer" : "KitchBot"}
                        </p>

                        <p>{chat.message}</p>

                        <p className="mt-3 text-[11px] font-medium opacity-60">
                          {new Date(chat.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}