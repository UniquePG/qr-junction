"use client";

import { useAuth } from "@/components/AuthContext";
import PlanContactModal, { type PlanContactTarget } from "@/components/billing/PlanContactModal";
import PlanHighlightsContent from "@/components/billing/PlanHighlightsContent";
import { type PlanRecord } from "@/components/billing/PlanGrid";
import { formatRupees } from "@/lib/billing/money";
import { parsePlanHighlights, planHighlightsHasContent } from "@/lib/billing/present";
import { Sparkles } from "lucide-react";
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
    <div className="relative mx-auto max-w-6xl overflow-x-clip px-4 pb-20 pt-2 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(0,70,161,0.12),_transparent_60%)]"
      />

      <section className="relative overflow-hidden rounded-[2rem] bg-[#001B50] px-6 py-9 text-white shadow-[0_28px_70px_rgba(0,27,80,0.22)] sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#0046a1]/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Pricing
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl sm:leading-tight">
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

      <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const content = parsePlanHighlights(plan.highlights);
          const hasStory = planHighlightsHasContent(content);
          const price = yearly ? plan.yearlyPricePaise : plan.monthlyPricePaise;
          const other = yearly ? plan.monthlyPricePaise : plan.yearlyPricePaise;
          const months = savedMonths(plan);
          const recommended = plan.code === "growth";
          const paid = price > 0;
          const perMonth = yearly && price > 0 ? Math.round(price / 1200) * 100 : 0;
          const billingNote = [
            perMonth > 0 ? `${formatRupees(perMonth)} a month, billed yearly` : "",
            !yearly && other > 0 ? `${formatRupees(other)} a year` : "",
            !yearly && months > 0 ? `save ${months} ${months === 1 ? "month" : "months"}` : "",
            price === 0 ? "No charge" : "",
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <article
              key={plan.code}
              className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white transition duration-300 ease-out ${
                recommended
                  ? "z-[1] shadow-[0_28px_60px_rgba(0,27,80,0.18)] ring-2 ring-[#001B50] lg:-translate-y-1 lg:hover:-translate-y-2"
                  : "shadow-[0_16px_40px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/90 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)]"
              }`}
            >
              <div
                className={`relative flex items-center justify-between gap-3 px-5 py-3.5 ${
                  recommended
                    ? "bg-gradient-to-r from-[#001B50] via-[#002866] to-[#0046a1] text-white"
                    : "bg-gradient-to-r from-[#F4F7FB] to-[#EEF3FA] text-[#001B50]"
                }`}
              >
                <h2 className="text-lg font-bold tracking-tight">{plan.name}</h2>
                {recommended ? (
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                    Recommended
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
                {content.section ? (
                  <span
                    className={`mb-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      recommended
                        ? "bg-[#001B50]/08 text-[#001B50]"
                        : "bg-[#E8F0FE] text-[#0046a1]"
                    }`}
                  >
                    {content.section}
                  </span>
                ) : (
                  <div className="mb-3 h-[26px]" aria-hidden />
                )}

                <p className="text-[2.5rem] font-black leading-none tracking-tight text-[#001B50]">
                  {formatRupees(price)}
                  <span className="ml-1.5 text-sm font-semibold text-slate-400">
                    / {yearly ? "year" : "month"}
                  </span>
                </p>
                <p className="mt-2 min-h-5 text-sm text-slate-500">{billingNote || "\u00a0"}</p>

                {content.subtitle ? (
                  <p className="mt-4 border-l-2 border-[#0046a1]/35 pl-3 text-[15px] italic leading-relaxed text-slate-700">
                    {content.subtitle}
                  </p>
                ) : null}

                {hasStory ? (
                  <div className="mt-5 flex-1">
                    <PlanHighlightsContent
                      value={content}
                      hideSection
                      hideSubtitle
                    />
                  </div>
                ) : (
                  <p className="mt-5 flex-1 text-sm text-slate-400">Details coming soon.</p>
                )}

                <div className="mt-auto pt-6">
                  {paid ? (
                    <button
                      type="button"
                      onClick={() => setContactPlan(plan)}
                      className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0046a1] ${
                        recommended
                          ? "bg-[#001B50] text-white shadow-[0_10px_24px_rgba(0,27,80,0.25)] hover:bg-[#002866]"
                          : "border border-slate-200 bg-white text-[#001B50] hover:border-[#001B50]/30 hover:bg-[#F7F9FC]"
                      }`}
                    >
                      Contact to activate
                    </button>
                  ) : (
                    <Link
                      href={destination}
                      className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#001B50] no-underline transition hover:border-[#001B50]/30 hover:bg-[#F7F9FC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0046a1]"
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

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
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
    <div className="rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm">
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
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0046a1] ${
              selected
                ? onDark
                  ? "bg-white text-[#001B50]"
                  : suite
                    ? "bg-[#1C1410] text-white"
                    : "bg-[#001B50] text-white"
                : onDark
                  ? "text-white/80 hover:text-white"
                  : suite
                    ? "text-[#6B5A50]"
                    : "text-slate-600 hover:text-[#001B50]"
            }`}
          >
            {value === "MONTH" ? "Monthly" : "Yearly"}
          </button>
        );
      })}
    </div>
  );
}
