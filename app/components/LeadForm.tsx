"use client";

import { useState } from "react";

type LeadFormProps = {
  isDarkMode: boolean;
  sessionId?: string;
  onSuccess: (message: string) => void;
};

type LeadApiResponse = {
  success: boolean;
  message: string;
};

export default function LeadForm({
  isDarkMode,
  sessionId,
  onSuccess,
}: LeadFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [interest, setInterest] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
    isDarkMode
      ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-400 focus:border-[#FF0052]"
      : "border-pink-100 bg-[#fff7fa] text-slate-950 placeholder:text-slate-400 focus:border-[#FF0052]"
  }`;

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

    if (!interest.trim()) {
      setFormMessage("Please tell us what you are interested in.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId || null,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          interest: interest.trim(),
        }),
      });

      const result = (await response.json()) as LeadApiResponse;

      if (!response.ok || !result.success) {
        setFormMessage(result.message || "Failed to submit lead.");
        return;
      }

      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setInterest("");

      onSuccess(
        "Thank you ✅ Your details have been sent to our team. They will contact you soon."
      );
    } catch (error) {
      console.error("Lead submit error:", error);
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

        <input
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          placeholder="Email optional"
          className={inputClass}
        />

        <input
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
          placeholder="Interested in e.g. catering, delivery, party order"
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
        className="w-full rounded-2xl bg-[#FF0052] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Contact Details"}
      </button>
    </form>
  );
}