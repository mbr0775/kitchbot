"use client";

import Link from "next/link";
import { useState } from "react";
import ChatWidget from "./components/ChatWidget";

const features = [
  {
    title: "AI Restaurant Chat",
    description:
      "Answer customer questions about menu, offers, delivery, opening hours, and restaurant details.",
    icon: "🤖",
  },
  {
    title: "Live Menu Cards",
    description:
      "Show beautiful food cards with photos, categories, prices, popular labels, and chef specials.",
    icon: "🍽️",
  },
  {
    title: "Table Bookings",
    description:
      "Collect customer booking requests and manage pending, confirmed, or cancelled reservations.",
    icon: "📅",
  },
  {
    title: "Lead Capture",
    description:
      "Capture catering, party order, bulk order, and customer contact inquiries directly from chat.",
    icon: "📞",
  },
  {
    title: "Admin Dashboard",
    description:
      "Update restaurant settings, manage menu items, view chats, leads, bookings, and export CSV files.",
    icon: "📊",
  },
  {
    title: "CSV Exports",
    description:
      "Download bookings, leads, and chat messages as clean CSV files for follow-up and reporting.",
    icon: "📥",
  },
];

const stats = [
  {
    label: "Customer Support",
    value: "24/7",
  },
  {
    label: "Admin Control",
    value: "100%",
  },
  {
    label: "Restaurant Ready",
    value: "Food Biz",
  },
];

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleViewFeatures = () => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main
      className={`min-h-screen overflow-hidden transition ${
        isDarkMode
          ? "bg-slate-950 text-white"
          : "bg-[#fff7fa] text-slate-950"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -left-32 top-10 h-96 w-96 rounded-full blur-3xl ${
            isDarkMode ? "bg-[#FF0052]/20" : "bg-[#FF0052]/15"
          }`}
        />

        <div
          className={`absolute right-[-120px] top-44 h-[460px] w-[460px] rounded-full blur-3xl ${
            isDarkMode ? "bg-purple-500/20" : "bg-pink-300/30"
          }`}
        />

        <div
          className={`absolute bottom-[-200px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl ${
            isDarkMode ? "bg-cyan-500/10" : "bg-white"
          }`}
        />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-5 md:px-8">
        <button
          onClick={() => setIsChatOpen(true)}
          className={`group flex min-w-0 items-center gap-3 rounded-full border px-3 py-2 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 sm:px-4 ${
            isDarkMode
              ? "border-white/10 bg-white/5 hover:bg-white/10"
              : "border-pink-100 bg-white/80 hover:bg-white"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF0052] text-sm font-black text-white shadow-lg shadow-[#FF0052]/30">
            K
          </span>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-black leading-none">
              KitchBot
            </p>

            <p
              className={`mt-1 truncate text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              AI Restaurant Assistant
            </p>
          </div>
        </button>

        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/admin/login"
            className={`rounded-full border px-4 py-3 text-xs font-black transition hover:-translate-y-0.5 sm:px-5 sm:text-sm ${
              isDarkMode
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-pink-100 bg-white/80 text-[#FF0052] shadow-sm hover:bg-white"
            }`}
          >
            Admin
          </Link>

          <button
            onClick={() => setIsDarkMode((current) => !current)}
            className={`rounded-full border px-4 py-3 text-xs font-black transition hover:-translate-y-0.5 sm:px-5 sm:text-sm ${
              isDarkMode
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-pink-100 bg-white/80 text-slate-950 shadow-sm hover:bg-white"
            }`}
          >
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-12 px-4 pb-20 pt-8 sm:px-5 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pt-10">
        <div className="min-w-0">
          <div
            className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-black sm:text-sm ${
              isDarkMode
                ? "border-[#FF0052]/30 bg-[#FF0052]/10 text-pink-200"
                : "border-[#FF0052]/20 bg-white/70 text-[#FF0052]"
            }`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">
              TokiloTech Product • AI Restaurant Assistant
            </span>
          </div>

          <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl">
            Turn your restaurant into a{" "}
            <span className="bg-gradient-to-r from-[#FF0052] via-pink-500 to-orange-400 bg-clip-text text-transparent">
              smart AI experience.
            </span>
          </h1>

          <p
            className={`mt-7 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 md:text-xl ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            KitchBot helps restaurants answer customer questions, display live
            menus, collect bookings, capture leads, and manage everything from
            one clean admin dashboard.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => setIsChatOpen(true)}
              className="group rounded-full bg-[#FF0052] px-8 py-4 text-base font-black text-white shadow-2xl shadow-[#FF0052]/30 transition hover:-translate-y-1 hover:bg-[#e60049]"
            >
              Launch Demo Chat
              <span className="ml-2 inline-block transition group-hover:translate-x-1">
                →
              </span>
            </button>

            <button
              onClick={handleViewFeatures}
              className={`rounded-full border px-8 py-4 text-base font-black transition hover:-translate-y-1 ${
                isDarkMode
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-200 bg-white/70 text-slate-950 shadow-sm hover:bg-white"
              }`}
            >
              View Features
            </button>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className={`min-w-0 rounded-3xl border p-5 text-center backdrop-blur-xl ${
                  isDarkMode
                    ? "border-white/10 bg-white/5"
                    : "border-pink-100 bg-white/70 shadow-sm"
                }`}
              >
                <p className="break-words text-2xl font-black leading-tight text-[#FF0052] sm:text-xl md:text-2xl">
                  {item.value}
                </p>

                <p
                  className={`mt-2 break-words text-xs font-bold leading-4 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0">
          <div
            className={`absolute -inset-4 rounded-[2.5rem] blur-2xl ${
              isDarkMode ? "bg-[#FF0052]/20" : "bg-[#FF0052]/10"
            }`}
          />

          <div
            className={`relative overflow-hidden rounded-[2rem] border p-4 shadow-2xl backdrop-blur-xl ${
              isDarkMode
                ? "border-white/10 bg-white/5"
                : "border-pink-100 bg-white/80"
            }`}
          >
            <div className="rounded-[1.5rem] bg-[#FF0052] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white/70">Live Demo</p>

                  <h2 className="mt-1 truncate text-2xl font-black">
                    Spice Garden Chat
                  </h2>
                </div>

                <div className="flex shrink-0 gap-2">
                  <span className="h-3 w-3 rounded-full bg-white/40" />
                  <span className="h-3 w-3 rounded-full bg-white/40" />
                  <span className="h-3 w-3 rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div
                className={`max-w-[88%] rounded-3xl px-5 py-4 text-sm leading-6 ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-100"
                    : "bg-[#fff7fa] text-slate-700"
                }`}
              >
                Hi 👋 I can show menu, take bookings, and collect customer
                inquiries.
              </div>

              <div className="ml-auto max-w-[80%] rounded-3xl bg-[#FF0052] px-5 py-4 text-sm font-bold leading-6 text-white">
                Do you have any offers today?
              </div>

              <div
                className={`max-w-[90%] rounded-3xl px-5 py-4 text-sm leading-6 ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-100"
                    : "bg-[#fff7fa] text-slate-700"
                }`}
              >
                Yes 😊 Today&apos;s special is Chicken Kottu for Rs. 600. Would
                you like to book a table?
              </div>

              <div
                className={`grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 ${
                  isDarkMode ? "text-white" : "text-slate-950"
                }`}
              >
                <div
                  className={`rounded-3xl border p-4 ${
                    isDarkMode
                      ? "border-white/10 bg-white/5"
                      : "border-pink-100 bg-white"
                  }`}
                >
                  <p className="text-3xl">🍛</p>
                  <p className="mt-3 text-sm font-black">Live Menu</p>
                  <p
                    className={`mt-1 text-xs ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Food cards from Supabase
                  </p>
                </div>

                <div
                  className={`rounded-3xl border p-4 ${
                    isDarkMode
                      ? "border-white/10 bg-white/5"
                      : "border-pink-100 bg-white"
                  }`}
                >
                  <p className="text-3xl">📩</p>
                  <p className="mt-3 text-sm font-black">Lead Capture</p>
                  <p
                    className={`mt-1 text-xs ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Save customer inquiries
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(true)}
              className="m-4 mt-0 w-[calc(100%-2rem)] rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#FF0052] sm:m-5 sm:mt-0 sm:w-[calc(100%-2.5rem)]"
            >
              Open Real Demo Chat
            </button>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-5 md:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FF0052]">
            Features
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Everything a restaurant needs in one AI assistant.
          </h2>

          <p
            className={`mt-5 text-lg leading-8 ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            KitchBot is built for real restaurant workflows: chat, menu,
            bookings, leads, admin control, and exports.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-[2rem] border p-7 transition hover:-translate-y-1 ${
                isDarkMode
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-pink-100 bg-white/80 shadow-sm hover:bg-white hover:shadow-xl"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF0052]/10 text-3xl">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-xl font-black">{feature.title}</h3>

              <p
                className={`mt-3 text-sm leading-7 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-5 md:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#FF0052] p-8 text-white shadow-2xl shadow-[#FF0052]/20 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">
                Ready Demo
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
                Show clients a working AI restaurant assistant today.
              </h2>
            </div>

            <button
              onClick={() => setIsChatOpen(true)}
              className="rounded-full bg-white px-8 py-4 text-base font-black text-[#FF0052] transition hover:-translate-y-1 hover:bg-slate-950 hover:text-white"
            >
              Try KitchBot Now
            </button>
          </div>
        </div>
      </section>

      {isChatOpen && (
        <ChatWidget
          isDarkMode={isDarkMode}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </main>
  );
}