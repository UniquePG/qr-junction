"use client";

import PlanHighlightsContent from "@/components/billing/PlanHighlightsContent";
import { formatRupees } from "@/lib/billing/money";
import { parsePlanHighlights } from "@/lib/billing/present";
import { CheckCircle2 } from "lucide-react";
import React from "react";

export type PlanLimitRow = {
  featureKey: string;
  enabled: boolean;
  quota: number;
  allowlist: string[] | null;
  config?: unknown;
};

export type PlanRecord = {
  id?: string;
  code: string;
  name: string;
  monthlyPricePaise: number;
  yearlyPricePaise: number;
  graceDays?: number;
  isPublic?: boolean;
  active?: boolean;
  accounts?: number;
  highlights?: unknown;
  limits: PlanLimitRow[];
};

export type FeatureRecord = {
  key: string;
  label: string;
  suite: string;
  kind: string;
  shipped: boolean;
};

function savedMonths(plan: PlanRecord) {
  if (plan.monthlyPricePaise <= 0 || plan.yearlyPricePaise <= 0) return 0;
  return Math.max(0, Math.round((plan.monthlyPricePaise * 12 - plan.yearlyPricePaise) / plan.monthlyPricePaise));
}

function normalizeBillingInterval(value?: string | null): "MONTH" | "YEAR" | null {
  if (value === "MONTH" || value === "YEAR") return value;
  return null;
}

export default function PlanGrid({
  plans,
  tone,
  interval,
  currentCode,
  currentInterval,
  audience,
  headerAction,
  renderAction,
}: {
  plans: PlanRecord[];
  tone: "public" | "suite";
  interval: "MONTH" | "YEAR";
  currentCode?: string | null;
  /** When set, Active only applies if this matches the compare toggle (paid plans). */
  currentInterval?: string | null;
  audience: "public" | "admin";
  headerAction?: (plan: PlanRecord) => React.ReactNode;
  renderAction?: (plan: PlanRecord) => React.ReactNode;
}) {
  const suite = tone === "suite";
  const columns = audience === "admin" ? "md:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3";
  const billedInterval = normalizeBillingInterval(currentInterval);

  return (
    <div className={`grid items-stretch gap-4 ${columns}`}>
      {plans.map((plan) => {
        const content = parsePlanHighlights(plan.highlights);
        const price = interval === "YEAR" ? plan.yearlyPricePaise : plan.monthlyPricePaise;
        const other = interval === "YEAR" ? plan.monthlyPricePaise : plan.yearlyPricePaise;
        const samePlan = currentCode === plan.code;
        const planIsFree = plan.monthlyPricePaise <= 0 && plan.yearlyPricePaise <= 0;
        // Paid plans without a stored interval default to monthly (common SaaS assumption).
        const effectiveBilled = planIsFree ? null : billedInterval || "MONTH";
        // Free: tier match is enough. Paid: Active only when compare toggle matches billing period.
        const current = samePlan && (planIsFree || effectiveBilled === interval);
        const otherPeriodSamePlan = samePlan && !planIsFree && Boolean(effectiveBilled) && effectiveBilled !== interval;
        const recommended = plan.code === "growth" && !current;
        const months = savedMonths(plan);
        const billedLabel = effectiveBilled === "YEAR" ? "yearly" : "monthly";

        return (
          <article
            key={plan.code}
            className={`relative flex flex-col overflow-hidden rounded-3xl bg-white transition duration-300 ${
              current
                ? suite
                  ? "z-[1] shadow-[0_28px_56px_rgba(196,98,45,0.22)] ring-2 ring-[#C4622D] lg:-translate-y-1"
                  : "z-[1] shadow-[0_28px_56px_rgba(0,27,80,0.2)] ring-2 ring-[#001B50] lg:-translate-y-1"
                : recommended
                  ? suite
                    ? "border border-[#C4622D]/35 shadow-[0_16px_36px_rgba(196,98,45,0.1)]"
                    : "border border-[#001B50]/20 shadow-[0_16px_36px_rgba(0,27,80,0.06)]"
                  : suite
                    ? "border border-[#E7DDD2]"
                    : "border border-slate-200"
            }`}
          >
            {current ? (
              <div
                className={`flex items-center justify-between gap-3 px-5 py-3 text-white ${
                  suite
                    ? "bg-gradient-to-r from-[#C4622D] to-[#A34E22]"
                    : "bg-gradient-to-r from-[#001B50] via-[#002866] to-[#0046a1]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Active plan</p>
                </div>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
                  {effectiveBilled ? (effectiveBilled === "YEAR" ? "Yearly" : "Monthly") : "Current"}
                </span>
              </div>
            ) : otherPeriodSamePlan ? (
              <div
                className={`flex items-center justify-between gap-3 border-b px-5 py-2.5 ${
                  suite ? "border-[#E7DDD2] bg-[#FFF7F1]" : "border-slate-200 bg-[#F7F9FC]"
                }`}
              >
                <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${suite ? "text-[#C4622D]" : "text-[#0046a1]"}`}>
                  Your plan · billed {billedLabel}
                </p>
                <span className={`text-[11px] font-semibold ${suite ? "text-[#6B5A50]" : "text-slate-500"}`}>
                  Viewing {interval === "YEAR" ? "yearly" : "monthly"} price
                </span>
              </div>
            ) : null}

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`text-lg font-bold ${suite ? "text-[#1C1410]" : "text-[#001B50]"}`}>{plan.name}</h2>
                    {recommended ? (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white ${suite ? "bg-[#1C1410]" : "bg-[#001B50]"}`}>
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  {audience === "admin" ? (
                    <p className="mt-1 text-xs text-slate-400">
                      {plan.accounts ?? 0} accounts
                      {plan.isPublic === false ? " · Hidden" : ""}
                      {plan.active === false ? " · Inactive" : ""}
                    </p>
                  ) : (
                    <p className={`mt-1 text-xs ${suite ? "text-[#6B5A50]" : "text-slate-500"}`}>
                      {current
                        ? "You are on this billing period"
                        : otherPeriodSamePlan
                          ? `Same package, different billing period`
                          : price === 0
                            ? "No charge"
                            : "Billed in INR"}
                    </p>
                  )}
                </div>
                {headerAction ? headerAction(plan) : null}
              </div>

              {content.section ? (
                <span
                  className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    current
                      ? suite
                        ? "bg-[#FFF4EC] text-[#C4622D]"
                        : "bg-[#E8F0FE] text-[#0046a1]"
                      : suite
                        ? "bg-[#FFF4EC] text-[#C4622D]"
                        : "bg-[#E8F0FE] text-[#0046a1]"
                  }`}
                >
                  {content.section}
                </span>
              ) : null}

              <p className={`mt-4 text-4xl font-black tracking-tight ${suite ? "text-[#1C1410]" : "text-[#001B50]"}`}>
                {formatRupees(price)}
                <span className={`ml-1 text-sm font-semibold ${suite ? "text-[#6B5A50]" : "text-slate-400"}`}>
                  / {interval === "YEAR" ? "year" : "month"}
                </span>
              </p>
              <p className={`mt-1 text-sm ${suite ? "text-[#6B5A50]" : "text-slate-500"}`}>
                {other > 0 ? `${formatRupees(other)} a ${interval === "YEAR" ? "month" : "year"}` : "\u00a0"}
                {months > 0 && interval === "MONTH" ? ` · save ${months} ${months === 1 ? "month" : "months"}` : ""}
              </p>

              {content.subtitle ? (
                <p
                  className={`mt-3 border-l-2 pl-3 text-[15px] italic leading-relaxed ${
                    suite ? "border-[#C4622D]/40 text-[#4A3B32]" : "border-[#0046a1]/35 text-slate-700"
                  }`}
                >
                  {content.subtitle}
                </p>
              ) : null}

              {content.description || content.features.length || content.bestFor ? (
                <div className="mt-5">
                  <PlanHighlightsContent
                    value={content}
                    tone={suite ? "suite" : "public"}
                    hideSection
                    hideSubtitle
                  />
                </div>
              ) : !content.section && !content.subtitle ? (
                <p className={`mt-5 text-sm ${suite ? "text-[#6B5A50]" : "text-slate-400"}`}>
                  {audience === "admin" ? "Write the plan story customers should see." : "Details coming soon."}
                </p>
              ) : null}

              {renderAction ? <div className="mt-auto pt-5">{renderAction(plan)}</div> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
