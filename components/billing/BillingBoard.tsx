"use client";

import PlanContactModal, { type PlanContactTarget } from "@/components/billing/PlanContactModal";
import PlanGrid, { type FeatureRecord, type PlanRecord } from "@/components/billing/PlanGrid";
import { IntervalToggle } from "@/components/billing/PricingBoard";
import { billingService } from "@/lib/api";
import { formatRupees } from "@/lib/billing/money";
import { presentFeature, usageLabel } from "@/lib/billing/present";
import { Loader2 } from "lucide-react";
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

export default function BillingBoard({ tone }: { tone: "suite" | "platform" }) {
  const [data, setData] = useState<BillingResponse | null>(null);
  const [error, setError] = useState("");
  const [contactPlan, setContactPlan] = useState<PlanContactTarget | null>(null);
  const [interval, setInterval] = useState<"MONTH" | "YEAR">("MONTH");
  const suite = tone === "suite";

  useEffect(() => {
    billingService.current<BillingResponse>()
      .then(setData)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Plan did not load."));
  }, []);

  const usage = useMemo(() => {
    return (data?.billing.features || [])
      .map((feature) => presentFeature(feature))
      .filter((feature) => feature.shipped && feature.used != null);
  }, [data]);

  if (!data && !error) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className={`h-8 w-8 animate-spin ${suite ? "text-[#C4622D]" : "text-[#001B50]"}`} /></div>;
  }

  const title = suite ? "text-[#1C1410]" : "text-[#001B50]";
  const muted = suite ? "text-[#6B5A50]" : "text-slate-500";
  const plan = data?.billing.plan;
  const subscription = data?.billing.subscription;
  const inGrace = Boolean(subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date() && subscription.graceEndsAt && new Date(subscription.graceEndsAt) > new Date());

  return (
    <div className="space-y-6">
      <div className={`rounded-3xl border p-6 ${suite ? "border-[#E7DDD2] bg-white" : "border-slate-200 bg-white"}`}>
        <p className={`text-xs font-bold uppercase tracking-[0.16em] ${muted}`}>Your plan</p>
        <h1 className={`mt-2 text-3xl font-bold ${title}`}>{plan?.name || "Free"}</h1>
        <p className={`mt-2 text-sm ${muted}`}>
          {subscription?.status || "ACTIVE"}
          {subscription?.access === "read_only" ? " · Read only" : ""}
          {plan?.lockedPricePaise != null ? ` · Locked at ${formatRupees(plan.lockedPricePaise)}` : ""}
          {subscription?.currentPeriodEnd ? ` · Period ends ${dateLabel(subscription.currentPeriodEnd)}` : " · No end date"}
          {inGrace ? ` · Grace through ${dateLabel(subscription?.graceEndsAt)}` : ""}
        </p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={`text-lg font-bold ${title}`}>Plans</h2>
            <p className={`mt-1 text-sm ${muted}`}>Switch monthly or yearly. The lines on each card are the public description.</p>
          </div>
          <IntervalToggle interval={interval} onChange={setInterval} suite={suite} />
        </div>
        <PlanGrid
          plans={data?.plans || []}
          tone={suite ? "suite" : "public"}
          interval={interval}
          currentCode={plan?.code}
          audience="public"
          renderAction={(card) => {
            const current = card.code === plan?.code;
            const paid = (interval === "YEAR" ? card.yearlyPricePaise : card.monthlyPricePaise) > 0;
            if (current || !paid) {
              return (
                <div className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold ${suite ? "bg-[#F6F1EA] text-[#6B5A50]" : "bg-slate-50 text-slate-500"}`}>
                  {current ? "Current plan" : "Included"}
                </div>
              );
            }
            return (
              <button
                type="button"
                onClick={() => setContactPlan(card)}
                className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white ${suite ? "bg-[#C4622D]" : "bg-[#001B50]"}`}
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
