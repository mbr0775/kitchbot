"use client";

import { useState } from "react";

type BookingFormProps = {
  isDarkMode: boolean;
  onSuccess: (message: string) => void;
};

type BookingApiResponse = {
  success: boolean;
  message?: string;
};

export default function BookingForm({
  isDarkMode,
  onSuccess,
}: BookingFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestsCount, setGuestsCount] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const inputClass = `w-full rounded-2xl border px-4 py-4 text-sm outline-none transition ${
    isDarkMode
      ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-400 focus:border-[#FF0052]"
      : "border-pink-100 bg-[#fff7fa] text-slate-950 placeholder:text-slate-400 focus:border-[#FF0052]"
  }`;

  const labelClass = `mb-2 block text-xs font-black uppercase tracking-[0.12em] ${
    isDarkMode ? "text-slate-400" : "text-slate-500"
  }`;

  const fieldWrapperClass = `rounded-2xl border px-4 py-3 ${
    isDarkMode
      ? "border-white/10 bg-slate-800"
      : "border-pink-100 bg-[#fff7fa]"
  }`;

  const dateTimeInputClass = `w-full bg-transparent text-sm outline-none ${
    isDarkMode ? "text-white" : "text-slate-950"
  } ${!bookingDate ? "text-slate-400" : ""}`;

  const timeInputClass = `w-full bg-transparent text-sm outline-none ${
    isDarkMode ? "text-white" : "text-slate-950"
  } ${!bookingTime ? "text-slate-400" : ""}`;

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setBookingDate("");
    setBookingTime("");
    setGuestsCount("");
    setSpecialRequest("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("");

    if (!customerName.trim()) {
      setFormMessage("Please enter your name.");
      return;
    }

    if (!customerPhone.trim()) {
      setFormMessage("Please enter your phone number.");
      return;
    }

    if (!bookingDate) {
      setFormMessage("Please select booking date.");
      return;
    }

    if (!bookingTime) {
      setFormMessage("Please select booking time.");
      return;
    }

    if (!guestsCount || Number(guestsCount) < 1) {
      setFormMessage("Please enter guests count.");
      return;
    }

    try {
      setIsSubmitting(true);

      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("kitchbot_session_id")
          : null;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          bookingDate,
          bookingTime,
          guestsCount: Number(guestsCount),
          specialRequest: specialRequest.trim(),
        }),
      });

      const result = (await response.json()) as BookingApiResponse;

      if (!response.ok || !result.success) {
        setFormMessage(result.message || "Failed to submit booking.");
        return;
      }

      resetForm();

      onSuccess(
        "Your booking request has been submitted successfully ✅ Our team will confirm it soon."
      );
    } catch (error) {
      console.error("Booking submit error:", error);
      setFormMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Your name"
          className={inputClass}
        />

        <input
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          placeholder="Phone number"
          className={inputClass}
        />

        <div className={fieldWrapperClass}>
          <label className={labelClass}>Booking Date</label>
          <input
            type="date"
            value={bookingDate}
            min={today}
            onChange={(event) => setBookingDate(event.target.value)}
            className={dateTimeInputClass}
          />
        </div>

        <div className={fieldWrapperClass}>
          <label className={labelClass}>Booking Time</label>
          <input
            type="time"
            value={bookingTime}
            onChange={(event) => setBookingTime(event.target.value)}
            className={timeInputClass}
          />
        </div>

        <input
          type="number"
          min="1"
          value={guestsCount}
          onChange={(event) => setGuestsCount(event.target.value)}
          placeholder="Guests count"
          className={inputClass}
        />

        <input
          value={specialRequest}
          onChange={(event) => setSpecialRequest(event.target.value)}
          placeholder="Special request optional"
          className={inputClass}
        />
      </div>

      {formMessage && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            isDarkMode
              ? "bg-red-500/10 text-red-300"
              : "bg-red-50 text-red-600"
          }`}
        >
          {formMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-[#FF0052] px-5 py-4 text-sm font-black text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Booking"}
      </button>
    </form>
  );
}