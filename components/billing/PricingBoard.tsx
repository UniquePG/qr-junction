"use client";

import { useAuth } from "@/components/AuthContext";
import PlanContactModal, { type PlanContactTarget } from "@/components/billing/PlanContactModal";
import { type PlanRecord } from "@/components/billing/PlanGrid";
import { formatRupees } from "@/lib/billing/money";
import { asHighlights } from "@/lib/billing/present";
import { Check } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

function savedMonths(plan: PlanRecord) {
  if (plan.monthlyPricePaise <= 0 || plan.yearlyPricePaise <= 0) return 0;
  return Math.max(0, Math.round((plan.monthlyPricePaise * 12 - plan.yearlyPricePaise) / plan.monthlyPricePaise));
}

export default function PricingBoard({ plans }: { plans: PlanRecord[] }) {
  const { user } = useAuth();
  const [interval, setInterval] = useState<"MONTH" | "YEAR">("MONTH");
  const [contactPlan, setContactPlan] = useState<PlanContactTarget | null>(null);
  const destination = user ? "/dashboard/billing" : "/register";
  const yearly = interval === "YEAR";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-2 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] bg-[#001B50] px-6 py-8 text-white shadow-[0_24px_60px_rgba(0,27,80,0.18)] sm:px-10 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Pricing</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              One account plan for QR codes, menus, and reviews
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
              Compare the plans, then start an account. Prices are in rupees.
            </p>
          </div>
          <div className="lg:pb-1 lg:text-right">
            <IntervalToggle interval={interval} onChange={setInterval} suite={false} onDark />
            <p className="mt-3 max-w-xs text-sm leading-5 text-white/70 lg:ml-auto">
              {yearly ? "One payment for the year." : "Yearly billing costs less than twelve months."}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid items-stretch gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const lines = asHighlights(plan.highlights);
          const price = yearly ? plan.yearlyPricePaise : plan.monthlyPricePaise;
          const other = yearly ? plan.monthlyPricePaise : plan.yearlyPricePaise;
          const months = savedMonths(plan);
          const recommended = plan.code === "growth";
          const paid = price > 0;
          const perMonth = yearly && price > 0 ? Math.round(price / 1200) * 100 : 0;
          return (
            <article
              key={plan.code}
              className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
                recommended ? "ring-2 ring-[#001B50]" : "ring-1 ring-slate-200"
              }`}
            >
              <div className={`flex items-center justify-between gap-3 px-5 py-3 ${recommended ? "bg-[#001B50] text-white" : "bg-[#F4F7FB] text-[#001B50]"}`}>
                <h2 className="text-base font-bold">{plan.name}</h2>
                {recommended ? (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]">Recommended</span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                <p className="text-4xl font-black tracking-tight text-[#001B50]">
                  {formatRupees(price)}
                  <span className="ml-1 text-sm font-semibold text-slate-400">/ {yearly ? "year" : "month"}</span>
                </p>
                <p className="mt-1 min-h-5 text-sm text-slate-500">
                  {perMonth > 0 ? `${formatRupees(perMonth)} a month, billed yearly` : null}
                  {!yearly && other > 0 ? `${formatRupees(other)} a year` : null}
                  {!yearly && months > 0 ? ` · save ${months} ${months === 1 ? "month" : "months"}` : ""}
                  {price === 0 ? "No charge" : ""}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {lines.length === 0 ? (
                    <li className="text-sm text-slate-400">Details coming soon.</li>
                  ) : lines.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm leading-snug text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0046a1]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {paid ? (
                    <button
                      type="button"
                      onClick={() => setContactPlan(plan)}
                      className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0046a1] ${
                        recommended ? "bg-[#001B50] text-white" : "border border-slate-200 bg-white text-[#001B50]"
                      }`}
                    >
                      Contact to activate
                    </button>
                  ) : (
                    <Link
                      href={destination}
                      className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-[#001B50] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0046a1]"
                    >
                      Start free
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Note title="One account" text="QR codes, the restaurant menu, and reviews sit on the same plan." />
        <Note title="Rupees" text="Monthly or yearly. The price on the card is the price you pay." />
        <Note title="Activation" text="Free starts when you create an account. Paid plans turn on after you message us." />
      </div>

      {contactPlan ? (
        <PlanContactModal plan={contactPlan} interval={interval} onClose={() => setContactPlan(null)} />
      ) : null}
    </div>
  );
}

function Note({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-sm font-bold text-[#001B50]">{title}</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
    </div>
  );
}

export function IntervalToggle({
  interval,
  onChange,
  suite,
  onDark = false,
}: {
  interval: "MONTH" | "YEAR";
  onChange: (interval: "MONTH" | "YEAR") => void;
  suite: boolean;
  onDark?: boolean;
}) {
  return (
    <div className={`inline-flex rounded-full border p-1 ${onDark ? "border-white/20 bg-white/10" : suite ? "border-[#E7DDD2] bg-white" : "border-slate-200 bg-white"}`} role="group" aria-label="Billing period">
      {(["MONTH", "YEAR"] as const).map((value) => {
        const selected = interval === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(value)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0046a1] ${
              selected
                ? onDark
                  ? "bg-white text-[#001B50]"
                  : suite
                    ? "bg-[#1C1410] text-white"
                    : "bg-[#001B50] text-white"
                : onDark
                  ? "text-white/80"
                  : suite
                    ? "text-[#6B5A50]"
                    : "text-slate-600"
            }`}
          >
            {value === "MONTH" ? "Monthly" : "Yearly"}
          </button>
        );
      })}
    </div>
  );
}
