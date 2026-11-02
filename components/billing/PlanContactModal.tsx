"use client";

import { formatRupees } from "@/lib/billing/money";
import { MessageCircle, Phone, X } from "lucide-react";
import React, { useEffect } from "react";

export const PLAN_CONTACT_PHONE = "+91 7746007731";
const PLAN_CONTACT_TEL = "+917746007731";
const PLAN_CONTACT_WHATSAPP = "917746007731";

export type PlanContactTarget = {
  name: string;
  monthlyPricePaise: number;
  yearlyPricePaise: number;
};

export default function PlanContactModal({
  plan,
  interval,
  onClose,
}: {
  plan: PlanContactTarget;
  interval: "MONTH" | "YEAR";
  onClose: () => void;
}) {
  const yearly = interval === "YEAR";
  const price = formatRupees(yearly ? plan.yearlyPricePaise : plan.monthlyPricePaise);
  const period = yearly ? "year" : "month";
  const message = `Hi, I want to activate the ${plan.name} plan on QR Junction (${price}/${period}). Please turn this plan on for my account.`;
  const whatsapp = `https://wa.me/${PLAN_CONTACT_WHATSAPP}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001B50]/50 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-contact-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Activate {plan.name}</p>
            <h2 id="plan-contact-title" className="mt-1 text-xl font-bold text-[#001B50]">Contact admin to turn this plan on</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Online payment is not available yet. Message or call and this plan will be activated on your account.
        </p>
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-[#001B50]">
          <span className="font-semibold">{plan.name}</span>
          <span className="text-slate-500"> · {price} / {period}</span>
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#128C7E] text-sm font-semibold text-white no-underline"
          >
            <MessageCircle className="h-4 w-4" />
            Contact on WhatsApp
          </a>
          <a
            href={`tel:${PLAN_CONTACT_TEL}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-[#001B50] no-underline"
          >
            <Phone className="h-4 w-4" />
            {PLAN_CONTACT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
}
