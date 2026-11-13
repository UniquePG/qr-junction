"use client";

import PlanContactModal, { type PlanContactTarget } from "@/components/billing/PlanContactModal";
import PlanGrid, { type FeatureRecord, type PlanRecord } from "@/components/billing/PlanGrid";
import { IntervalToggle } from "@/components/billing/PricingBoard";
import { billingService } from "@/lib/api";
import { formatRupees } from "@/lib/billing/money";
import { presentFeature, usageLabel } from "@/lib/billing/present";
import { CalendarDays, CheckCircle2, Loader2, Shield } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type Feature = {
  key: string;
  label: string;
  suite: string;
  kind: string;
  shipped: boolean;
  enabled: boolean;
  quota: number;
  allowlist: string[];
  used: number | null;
  overridden: boolean;
};

type BillingResponse = {
  checkout: boolean;
  plans: PlanRecord[];
  features: FeatureRecord[];
  billing: {
    plan: { code: string; name: string; monthlyPricePaise: number; yearlyPricePaise: number; lockedPricePaise: number | null } | null;
    subscription: {
      status: string;
      access: string;
      interval?: string | null;
      currentPeriodEnd: string | null;
      graceDays?: number;
      graceEndsAt?: string | null;
    } | null;
    features: Feature[];
  };
};

function dateLabel(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function statusLabel(status?: string | null) {
  if (!status) return "Active";
  const map: Record<string, string> = {
    ACTIVE: "Active",
    TRIALING: "Trialing",
    PAST_DUE: "Past due",
    CANCELED: "Canceled",
  };
  return map[status] || status;
}

export default function BillingBoard({ tone }: { tone: "suite" | "platform" }) {
  const [data, setData] = useState<BillingResponse | null>(null);
  const [error, setError] = useState("");
  const [contactPlan, setContactPlan] = useState<PlanContactTarget | null>(null);
  const [interval, setInterval] = useState<"MONTH" | "YEAR">("MONTH");
  const [intervalReady, setIntervalReady] = useState(false);
  const suite = tone === "suite";

  useEffect(() => {
    billingService.current<BillingResponse>()
      .then((payload) => {
        setData(payload);
        const billed = payload.billing.subscription?.interval;
        if (billed === "MONTH" || billed === "YEAR") {
          setInterval(billed);
        }
        setIntervalReady(true);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Plan did not load.");
        setIntervalReady(true);
      });
  }, []);

  const usage = useMemo(() => {
    return (data?.billing.features || [])
      .map((feature) => presentFeature(feature))
      .filter((feature) => feature.shipped && feature.used != null);
  }, [data]);

  if ((!data && !error) || !intervalReady) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className={`h-8 w-8 animate-spin ${suite ? "text-[#C4622D]" : "text-[#001B50]"}`} /></div>;
  }

  const title = suite ? "text-[#1C1410]" : "text-[#001B50]";
  const muted = suite ? "text-[#6B5A50]" : "text-slate-500";
  const plan = data?.billing.plan;
  const subscription = data?.billing.subscription;
  const billedInterval = subscription?.interval === "YEAR" || subscription?.interval === "MONTH" ? subscription.interval : null;
  const inGrace = Boolean(subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date() && subscription.graceEndsAt && new Date(subscription.graceEndsAt) > new Date());
  const status = statusLabel(subscription?.status);
  const isActive = !subscription?.status || subscription.status === "ACTIVE" || subscription.status === "TRIALING";
  const billingPeriodLabel = billedInterval === "YEAR" ? "Yearly" : billedInterval === "MONTH" ? "Monthly" : null;

  return (
    <div className="space-y-6">
      <section
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${
          suite
            ? "border-[#E7DDD2] bg-gradient-to-br from-white via-white to-[#FFF7F1]"
            : "border-slate-200 bg-gradient-to-br from-white via-white to-[#F3F7FD]"
        }`}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${
            suite ? "bg-[#C4622D]/10" : "bg-[#0046a1]/10"
          }`}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className={`text-xs font-bold uppercase tracking-[0.16em] ${muted}`}>Your plan</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl ${title}`}>{plan?.name || "Free"}</h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                  isActive
                    ? suite
                      ? "bg-[#FFF4EC] text-[#C4622D]"
                      : "bg-[#E8F0FE] text-[#0046a1]"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                {status}
              </span>
            </div>
            <p className={`mt-2 max-w-xl text-sm ${muted}`}>
              {subscription?.access === "read_only"
                ? "This account is read only until the plan is renewed."
                : billingPeriodLabel
                  ? `You are on ${plan?.name || "Free"} · ${billingPeriodLabel.toLowerCase()} billing.`
                  : "This is the package currently applied to your account."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {billingPeriodLabel ? (
              <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-semibold ${suite ? "border-[#E7DDD2] bg-white text-[#1C1410]" : "border-slate-200 bg-white text-[#001B50]"}`}>
                Billed {billingPeriodLabel.toLowerCase()}
              </span>
            ) : null}
            {plan?.lockedPricePaise != null ? (
              <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-semibold ${suite ? "border-[#E7DDD2] bg-white text-[#1C1410]" : "border-slate-200 bg-white text-[#001B50]"}`}>
                <Shield className={`h-3.5 w-3.5 ${suite ? "text-[#C4622D]" : "text-[#0046a1]"}`} aria-hidden />
                Locked at {formatRupees(plan.lockedPricePaise)}
              </span>
            ) : null}
            <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-semibold ${suite ? "border-[#E7DDD2] bg-white text-[#1C1410]" : "border-slate-200 bg-white text-[#001B50]"}`}>
              <CalendarDays className={`h-3.5 w-3.5 ${suite ? "text-[#C4622D]" : "text-[#0046a1]"}`} aria-hidden />
              {subscription?.currentPeriodEnd
                ? `Period ends ${dateLabel(subscription.currentPeriodEnd)}`
                : "No end date"}
            </span>
            {inGrace ? (
              <span className="inline-flex items-center rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                Grace through {dateLabel(subscription?.graceEndsAt)}
              </span>
            ) : null}
          </div>
        </div>
        {error ? <p className="relative mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={`text-lg font-bold ${title}`}>Compare plans</h2>
            <p className={`mt-1 text-sm ${muted}`}>
              Active only matches your plan and billing period. Switch monthly/yearly to compare the other price.
            </p>
          </div>
          <IntervalToggle interval={interval} onChange={setInterval} suite={suite} />
        </div>
        <PlanGrid
          plans={data?.plans || []}
          tone={suite ? "suite" : "public"}
          interval={interval}
          currentCode={plan?.code}
          currentInterval={billedInterval}
          audience="public"
          renderAction={(card) => {
            const samePlan = card.code === plan?.code;
            const planIsFree = card.monthlyPricePaise <= 0 && card.yearlyPricePaise <= 0;
            const effectiveBilled = planIsFree ? null : billedInterval || "MONTH";
            const activeNow = samePlan && (planIsFree || effectiveBilled === interval);
            const otherPeriod = samePlan && !planIsFree && Boolean(effectiveBilled) && effectiveBilled !== interval;
            const paid = (interval === "YEAR" ? card.yearlyPricePaise : card.monthlyPricePaise) > 0;
            if (activeNow) {
              return (
                <div
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                    suite
                      ? "bg-[#FFF4EC] text-[#C4622D] ring-1 ring-[#C4622D]/25"
                      : "bg-[#E8F0FE] text-[#001B50] ring-1 ring-[#001B50]/15"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Active now
                </div>
              );
            }
            if (otherPeriod) {
              return (
                <button
                  type="button"
                  onClick={() => setContactPlan(card)}
                  className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition ${
                    suite
                      ? "border border-[#C4622D]/35 bg-white text-[#C4622D] hover:bg-[#FFF4EC]"
                      : "border border-[#001B50]/20 bg-white text-[#001B50] hover:bg-[#F7F9FC]"
                  }`}
                >
                  Switch to {interval === "YEAR" ? "yearly" : "monthly"}
                </button>
              );
            }
            if (!paid) {
              return (
                <div className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold ${suite ? "bg-[#F6F1EA] text-[#6B5A50]" : "bg-slate-50 text-slate-500"}`}>
                  Included
                </div>
              );
            }
            return (
              <button
                type="button"
                onClick={() => setContactPlan(card)}
                className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition ${
                  suite
                    ? "bg-[#C4622D] hover:bg-[#A34E22]"
                    : "bg-[#001B50] hover:bg-[#002866]"
                }`}
              >
                Activate {card.name}
              </button>
            );
          }}
        />
      </section>
      {contactPlan ? (
        <PlanContactModal plan={contactPlan} interval={interval} onClose={() => setContactPlan(null)} />
      ) : null}

      <section className={`rounded-3xl border bg-white p-5 ${suite ? "border-[#E7DDD2]" : "border-slate-200"}`}>
        <h2 className={`text-lg font-bold ${title}`}>Usage</h2>
        <p className={`mt-1 text-sm ${muted}`}>How much of this account is in use. Plan wording above is separate from these meters.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {usage.map((feature) => (
            <div key={feature.key} className={`rounded-2xl px-4 py-3 ${suite ? "bg-[#F6F1EA]" : "bg-slate-50"}`}>
              <p className={`text-sm font-medium ${title}`}>{feature.label}</p>
              <p className={`mt-1 text-sm font-semibold ${muted}`}>
                {usageLabel(feature)}
                {feature.overridden ? " · Custom" : ""}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
