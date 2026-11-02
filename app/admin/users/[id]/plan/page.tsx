"use client";

import { FeatureLimitEditor, type LimitDraft } from "@/components/admin/FeatureLimitEditor";
import { AdminLink, AdminLoading } from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import { allowlistLabel } from "@/lib/billing/allowlists";
import { FEATURE_CONFIGS, asConfig } from "@/lib/billing/config";
import { formatRupees, rupeeInputValue } from "@/lib/billing/money";
import { SUITE_LABELS, presentFeature, usageLabel } from "@/lib/billing/present";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type Feature = {
  key: string;
  label: string;
  suite: string;
  kind: string;
  shipped: boolean;
  enabled: boolean;
  quota: number;
  allowlist: string[];
  config?: Record<string, number> | null;
  used: number | null;
  overridden: boolean;
};

type Plan = { code: string; name: string; graceDays?: number; monthlyPricePaise: number; yearlyPricePaise: number };
type Override = {
  id: string;
  featureKey: string;
  enabled: boolean | null;
  quota: number | null;
  allowlist: string[] | null;
  config?: unknown;
  endsAt: string | null;
  note: string | null;
};

type Payload = {
  plans: Plan[];
  billing: {
    plan: { code: string; name: string; lockedPricePaise: number | null } | null;
    subscription: {
      status: string;
      access: string;
      interval: string | null;
      currentPeriodEnd: string | null;
      graceDays: number;
      graceEndsAt: string | null;
    } | null;
    features: Feature[];
  };
  subscription: { overrides: Override[] } | null;
};

const STATUSES = [
  { value: "TRIALING", label: "Trialing" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAST_DUE", label: "Past due" },
  { value: "CANCELED", label: "Canceled" },
];

export default function AdminUserPlanPage() {
  const params = useParams<{ id: string }>();
  const [userName, setUserName] = useState("");
  const [data, setData] = useState<Payload | null>(null);
  const [planCode, setPlanCode] = useState("free");
  const [status, setStatus] = useState("ACTIVE");
  const [interval, setInterval] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [graceDays, setGraceDays] = useState("7");
  const [lockedPrice, setLockedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [overrideKey, setOverrideKey] = useState("");
  const [overrideLimit, setOverrideLimit] = useState<LimitDraft>({ enabled: true, quota: 0, allowlist: [], config: null });
  const [endsAt, setEndsAt] = useState("");
  const [note, setNote] = useState("");

  const load = () => {
    adminService.userSubscription<Payload>(params.id).then((payload) => {
      setData(payload);
      const subscription = payload.billing.subscription;
      setPlanCode(payload.billing.plan?.code || "free");
      setStatus(subscription?.status || "ACTIVE");
      setInterval(subscription?.interval || "");
      setPeriodEnd(subscription?.currentPeriodEnd ? subscription.currentPeriodEnd.slice(0, 16) : "");
      setGraceDays(String(subscription?.graceDays ?? 7));
      setLockedPrice(payload.billing.plan?.lockedPricePaise != null ? rupeeInputValue(payload.billing.plan.lockedPricePaise) : "");
      const first = payload.billing.features[0];
      setOverrideKey((current) => current || first?.key || "");
      if (first && !overrideKey) {
        setOverrideLimit({ enabled: first.enabled, quota: first.quota, allowlist: first.allowlist || [], config: asConfig(first.config) });
      }
    }).catch(() => setMessage("Subscription did not load."));
  };

  useEffect(() => {
    adminService.user<{ user?: { name?: string; email?: string } }>(params.id)
      .then((result) => setUserName(result.user?.name || result.user?.email || "Account"))
      .catch(() => setUserName("Account"));
    load();
  }, [params.id]);

  const choosePlan = (code: string) => {
    setPlanCode(code);
    const plan = data?.plans.find((item) => item.code === code);
    if (plan?.graceDays != null) setGraceDays(String(plan.graceDays));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await adminService.saveUserSubscription(params.id, {
        planCode,
        status,
        interval: interval || null,
        currentPeriodEnd: periodEnd ? new Date(periodEnd).toISOString() : undefined,
        clearPeriodEnd: !periodEnd,
        graceDays: Number(graceDays),
        lockedPriceRupees: lockedPrice === "" ? undefined : Number(lockedPrice),
        clearLockedPrice: lockedPrice === "",
      });
      setMessage("Subscription saved.");
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const selectedFeature = data?.billing.features.find((feature) => feature.key === overrideKey);

  const addOverride = async () => {
    if (!selectedFeature) return;
    setSaving(true);
    setMessage("");
    try {
      await adminService.addOverride(params.id, {
        featureKey: overrideKey,
        enabled: overrideLimit.enabled,
        quota: selectedFeature.kind === "BOOLEAN" ? undefined : overrideLimit.quota,
        allowlist: selectedFeature.kind === "ALLOWLIST" ? overrideLimit.allowlist : undefined,
        config: overrideLimit.config,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        note,
      });
      setNote("");
      setEndsAt("");
      setMessage("Override added.");
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add the override.");
    } finally {
      setSaving(false);
    }
  };

  const removeOverride = async (overrideId: string) => {
    setMessage("");
    try {
      await adminService.removeOverride(params.id, overrideId);
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove the override.");
    }
  };

  if (!data) return message ? <p className="text-sm text-slate-500">{message}</p> : <AdminLoading />;

  const groups = ["platform", "restaurant", "reviews"].map((suite) => ({
    suite,
    label: SUITE_LABELS[suite] || suite,
    features: data.billing.features.filter((feature) => feature.suite === suite).map((feature) => presentFeature(feature)),
  })).filter((group) => group.features.length > 0);
  const subscription = data.billing.subscription;

  return (
    <div className="space-y-6">
      <div>
        <AdminLink href={`/admin/users/${params.id}`}>Back to {userName}</AdminLink>
        <h1 className="mt-2 text-2xl font-black text-[#001B50]">Plan for {userName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data.billing.plan?.name || "Free"} · {subscription?.access === "read_only" ? "Read only" : "Can make changes"}
          {subscription?.graceEndsAt && subscription.currentPeriodEnd ? ` · Grace through ${new Date(subscription.graceEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
        </p>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">Subscription</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-xs font-semibold text-slate-500">Plan
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={planCode} onChange={(event) => choosePlan(event.target.value)}>
              {data.plans.map((plan) => (
                <option key={plan.code} value={plan.code}>
                  {plan.name} · {formatRupees(plan.monthlyPricePaise)}/mo
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">Status
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">Billing interval
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={interval} onChange={(event) => setInterval(event.target.value)}>
              <option value="">Not set</option>
              <option value="MONTH">Monthly</option>
              <option value="YEAR">Yearly</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">Period end
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="datetime-local" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
          </label>
          <label className="text-xs font-semibold text-slate-500">Grace days
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="number" min={0} max={60} value={graceDays} onChange={(event) => setGraceDays(event.target.value)} />
          </label>
          <label className="text-xs font-semibold text-slate-500">Locked price (₹)
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={lockedPrice} onChange={(event) => setLockedPrice(event.target.value)} placeholder="Plan price" />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[7, 10].map((days) => (
            <button key={days} type="button" onClick={() => setGraceDays(String(days))} className={`rounded-full px-3 py-1 text-xs font-bold ${graceDays === String(days) ? "bg-[#001B50] text-white" : "bg-slate-100 text-slate-600"}`}>
              {days} day grace
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">After the period ends, this account keeps full access for the grace days so they can pay. Leave the locked price blank to follow the plan price. Switching the plan fills grace from that plan before you save.</p>
        <button type="button" disabled={saving} onClick={save} className="mt-4 rounded-xl bg-[#001B50] px-4 py-2 text-sm font-semibold text-white">Save subscription</button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">Current limits</h2>
        <div className="mt-4 space-y-5">
          {groups.map((group) => (
            <div key={group.suite}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{group.label}</p>
              <div className="mt-2 divide-y divide-slate-100">
                {group.features.map((feature) => (
                  <div key={feature.key} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#001B50]">{feature.label}</p>
                      {feature.overridden ? <p className="text-xs text-primary">Override is active</p> : null}
                    </div>
                    <p className="text-sm font-semibold text-slate-600">{usageLabel(feature)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">Overrides</h2>
        <p className="mt-2 text-sm text-slate-500">An override replaces one feature for this account until it ends. The plan itself stays the same for everyone else.</p>
        <div className="mt-4 space-y-3">
          {(data.subscription?.overrides || []).map((override) => {
            const feature = data.billing.features.find((item) => item.key === override.featureKey);
            const values = Array.isArray(override.allowlist) ? override.allowlist.map((value) => allowlistLabel(override.featureKey, value)).join(", ") : "";
            const savedConfig = asConfig(override.config);
            const configText = (FEATURE_CONFIGS[override.featureKey] || [])
              .map((field) => (savedConfig?.[field.key] == null ? "" : `${field.label}: ${savedConfig[field.key]}`))
              .filter(Boolean)
              .join(" · ");
            return (
              <div key={override.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#001B50]">{feature?.label || override.featureKey}</p>
                  <p className="text-xs text-slate-500">
                    {override.enabled == null ? "" : override.enabled ? "Included" : "Off"}
                    {override.quota != null ? ` · ${override.quota < 0 ? "Unlimited" : override.quota}` : ""}
                    {values ? ` · ${values}` : ""}
                    {configText ? ` · ${configText}` : ""}
                    {override.endsAt ? ` · until ${new Date(override.endsAt).toLocaleString("en-IN")}` : " · no end"}
                    {override.note ? ` · ${override.note}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => removeOverride(override.id)} className="text-sm font-semibold text-red-600">Remove</button>
              </div>
            );
          })}
          {(data.subscription?.overrides || []).length === 0 ? <p className="text-sm text-slate-400">No overrides.</p> : null}
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Add an override</p>
          <label className="mt-3 block text-xs font-semibold text-slate-500">Feature
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={overrideKey}
              onChange={(event) => {
                const feature = data.billing.features.find((item) => item.key === event.target.value);
                setOverrideKey(event.target.value);
                if (feature) setOverrideLimit({ enabled: feature.enabled, quota: feature.quota, allowlist: feature.allowlist || [], config: asConfig(feature.config) });
              }}
            >
              {data.billing.features.map((feature) => <option key={feature.key} value={feature.key}>{feature.label}</option>)}
            </select>
          </label>
          <div className="mt-3">
            {selectedFeature ? (
              <FeatureLimitEditor featureKey={selectedFeature.key} kind={selectedFeature.kind} value={overrideLimit} onChange={setOverrideLimit} />
            ) : null}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold text-slate-500">Ends
              <input className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            </label>
            <label className="text-xs font-semibold text-slate-500">Note
              <input className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Founding restaurant, promo, support" />
            </label>
          </div>
          <button type="button" disabled={saving} onClick={addOverride} className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#001B50]">Add override</button>
        </div>
      </section>
    </div>
  );
}
