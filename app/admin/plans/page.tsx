"use client";

import { FeatureLimitEditor, type LimitDraft } from "@/components/admin/FeatureLimitEditor";
import { AdminLoading } from "@/components/admin/AdminUI";
import PlanGrid, { type FeatureRecord, type PlanRecord } from "@/components/billing/PlanGrid";
import { IntervalToggle } from "@/components/billing/PricingBoard";
import ConfirmModal from "@/components/ConfirmModal";
import { adminService } from "@/lib/api";
import { asConfig } from "@/lib/billing/config";
import { formatRupees, rupeeInputValue } from "@/lib/billing/money";
import {
  SUITE_LABELS,
  emptyPlanHighlights,
  parsePlanHighlights,
  serializePlanHighlights,
  type PlanHighlights,
} from "@/lib/billing/present";
import { Pencil, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

type Feature = FeatureRecord & { sortOrder?: number };
type Plan = PlanRecord & { id: string; sortOrder: number; limits: { featureKey: string; enabled: boolean; quota: number; allowlist: string[] | null; config?: unknown }[] };

type Draft = {
  id: string;
  code: string;
  accounts: number;
  name: string;
  monthlyRupees: string;
  yearlyRupees: string;
  graceDays: string;
  isPublic: boolean;
  active: boolean;
  sortOrder: string;
  highlights: PlanHighlights;
  limits: Record<string, LimitDraft>;
};

function asList(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [interval, setInterval] = useState<"MONTH" | "YEAR">("MONTH");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newPlan, setNewPlan] = useState({ code: "", name: "", monthlyRupees: "0", yearlyRupees: "0", copyFrom: "free", isPublic: false });
  const [featureForm, setFeatureForm] = useState({ label: "", key: "", suite: "platform", kind: "BOOLEAN" });

  const load = () => {
    setLoading(true);
    adminService.plans<{ plans: Plan[]; features: Feature[] }>()
      .then((data) => {
        setPlans(data.plans.map((plan) => ({ ...plan, accounts: plan.accounts ?? (plan as Plan & { _count?: { subscriptions: number } })._count?.subscriptions ?? 0 })));
        setFeatures(data.features);
      })
      .catch(() => setMessage("Plans did not load."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEditor = (plan: Plan) => {
    const limits: Record<string, LimitDraft> = {};
    for (const feature of features) {
      const current = plan.limits.find((limit) => limit.featureKey === feature.key);
      limits[feature.key] = {
        enabled: current?.enabled ?? false,
        quota: current?.quota ?? 0,
        allowlist: asList(current?.allowlist),
        config: asConfig(current?.config),
      };
    }
    setDraft({
      id: plan.id,
      code: plan.code,
      accounts: plan.accounts ?? 0,
      name: plan.name,
      monthlyRupees: rupeeInputValue(plan.monthlyPricePaise),
      yearlyRupees: rupeeInputValue(plan.yearlyPricePaise),
      graceDays: String(plan.graceDays ?? 7),
      isPublic: plan.isPublic !== false,
      active: plan.active !== false,
      sortOrder: String(plan.sortOrder ?? 0),
      highlights: parsePlanHighlights(plan.highlights),
      limits,
    });
    setMessage("");
  };

  const patchHighlights = (patch: Partial<PlanHighlights>) => {
    if (!draft) return;
    setDraft({ ...draft, highlights: { ...draft.highlights, ...patch } });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage("");
    try {
      await adminService.savePlan(draft.id, {
        name: draft.name,
        monthlyRupees: Number(draft.monthlyRupees),
        yearlyRupees: Number(draft.yearlyRupees),
        graceDays: Number(draft.graceDays),
        isPublic: draft.isPublic,
        active: draft.active,
        sortOrder: Number(draft.sortOrder),
        highlights: serializePlanHighlights(draft.highlights),
        limits: Object.entries(draft.limits).map(([featureKey, limit]) => ({ featureKey, ...limit })),
      });
      setMessage("Plan saved. Prices are stored in paise.");
      setDraft(null);
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the plan.");
    } finally {
      setSaving(false);
    }
  };

  const createPlan = async () => {
    setSaving(true);
    setMessage("");
    try {
      await adminService.createPlan({
        code: newPlan.code,
        name: newPlan.name,
        monthlyRupees: Number(newPlan.monthlyRupees),
        yearlyRupees: Number(newPlan.yearlyRupees),
        copyFrom: newPlan.copyFrom,
        isPublic: newPlan.isPublic,
      });
      setCreating(false);
      setNewPlan({ code: "", name: "", monthlyRupees: "0", yearlyRupees: "0", copyFrom: "free", isPublic: false });
      setMessage("Plan created.");
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the plan.");
    } finally {
      setSaving(false);
    }
  };

  const removePlan = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage("");
    try {
      await adminService.deletePlan(draft.id);
      setConfirmDelete(false);
      setDraft(null);
      setMessage("Plan deleted.");
      load();
    } catch (error) {
      setConfirmDelete(false);
      setMessage(error instanceof Error ? error.message : "Could not delete the plan.");
    } finally {
      setSaving(false);
    }
  };

  const createFeature = async () => {
    setSaving(true);
    setMessage("");
    try {
      await adminService.createFeature(featureForm);
      setFeatureForm({ label: "", key: "", suite: "platform", kind: "BOOLEAN" });
      setMessage("Feature added to every plan as off. Set its limit on each plan. A new feature is not enforced until the product checks that key.");
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add the feature.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && plans.length === 0) return <AdminLoading />;

  if (draft) {
    const groups = ["platform", "restaurant", "reviews"].map((suite) => ({
      suite,
      label: SUITE_LABELS[suite] || suite,
      features: features.filter((feature) => feature.suite === suite),
    }));
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button type="button" onClick={() => setDraft(null)} className="text-sm font-semibold text-primary">All plans</button>
            <h1 className="mt-2 text-2xl font-black text-[#001B50]">Edit {draft.name}</h1>
          </div>
          <div className="flex gap-2">
            {draft.code !== "free" && draft.code !== "legacy" ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            ) : null}
            <button type="button" disabled={saving} onClick={save} className="rounded-xl bg-[#001B50] px-4 py-2 text-sm font-semibold text-white">
              {saving ? "Saving" : "Save plan"}
            </button>
          </div>
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <ConfirmModal
          isOpen={confirmDelete}
          title={draft.accounts > 0 ? "Accounts are still on this plan" : `Delete ${draft.name}?`}
          message={draft.accounts > 0
            ? `${draft.accounts} ${draft.accounts === 1 ? "account is" : "accounts are"} on ${draft.name}. Move them to another plan, then delete this one.`
            : "The plan leaves the public page and the admin list. This cannot be undone."}
          confirmText="Delete plan"
          cancelText={draft.accounts > 0 ? "Close" : "Keep plan"}
          hideConfirm={draft.accounts > 0}
          isLoading={saving}
          onConfirm={removePlan}
          onClose={() => setConfirmDelete(false)}
        />
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">What customers see</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Fill only the parts you want on the card. Empty fields stay hidden. Feature bullets are optional — leave them blank if the description alone is enough.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field
              label="Section badge"
              hint='Short audience label, e.g. "For growing businesses". Shown as a small pill near the plan name.'
              placeholder="For growing businesses"
              value={draft.highlights.section}
              onChange={(section) => patchHighlights({ section })}
            />
            <Field
              label="Catchy line"
              hint="One short line under the price. Tone can be bold or warm."
              placeholder="Make every scan count. Make every customer experience better."
              value={draft.highlights.subtitle}
              onChange={(subtitle) => patchHighlights({ subtitle })}
            />
          </div>
          <label className="mt-4 block text-xs font-semibold text-slate-500">
            Plan description
            <textarea
              value={draft.highlights.description}
              onChange={(event) => patchHighlights({ description: event.target.value })}
              rows={4}
              placeholder="Take complete control of your digital customer journey…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 placeholder:font-normal placeholder:text-slate-300"
            />
            <span className="mt-1 block font-normal leading-5 text-slate-400">
              Longer pitch shown under the catchy line. Skip it if the feature list carries the story.
            </span>
          </label>
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-500">Features to display</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Bullet lines on the pricing card. Order is the order customers see.</p>
            <div className="mt-3 space-y-2">
              {draft.highlights.features.map((line, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={line}
                    onChange={(event) => {
                      const features = [...draft.highlights.features];
                      features[index] = event.target.value;
                      patchHighlights({ features });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    placeholder="Unlimited dynamic QR codes"
                  />
                  <button
                    type="button"
                    aria-label="Remove feature line"
                    onClick={() =>
                      patchHighlights({
                        features: draft.highlights.features.filter((_, item) => item !== index),
                      })
                    }
                    className="rounded-xl border border-slate-200 px-3 text-slate-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => patchHighlights({ features: [...draft.highlights.features, ""] })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#001B50]"
              >
                <Plus className="h-4 w-4" /> Add feature line
              </button>
            </div>
          </div>
          <label className="mt-5 block text-xs font-semibold text-slate-500">
            Best for
            <input
              value={draft.highlights.bestFor}
              onChange={(event) => patchHighlights({ bestFor: event.target.value })}
              placeholder="Established restaurants, premium cafes, high-volume outlets…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 placeholder:font-normal placeholder:text-slate-300"
            />
            <span className="mt-1 block font-normal leading-5 text-slate-400">
              Who this plan fits. Shown at the bottom of the card when filled in.
            </span>
          </label>
          <button
            type="button"
            onClick={() => setDraft({ ...draft, highlights: emptyPlanHighlights() })}
            className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Clear all customer copy
          </button>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">Price and access</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
            <Field label="Monthly price (₹)" value={draft.monthlyRupees} onChange={(monthlyRupees) => setDraft({ ...draft, monthlyRupees })} />
            <Field label="Yearly price (₹)" value={draft.yearlyRupees} onChange={(yearlyRupees) => setDraft({ ...draft, yearlyRupees })} />
            <Field label="Grace days after the period ends" value={draft.graceDays} onChange={(graceDays) => setDraft({ ...draft, graceDays })} />
            <Field label="Sort order" value={draft.sortOrder} onChange={(sortOrder) => setDraft({ ...draft, sortOrder })} />
            <div className="flex items-end gap-4 pb-2 text-sm text-slate-600">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isPublic} onChange={(event) => setDraft({ ...draft, isPublic: event.target.checked })} /> Public</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Active</label>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Type rupees. {formatRupees(Math.round(Number(draft.monthlyRupees || 0) * 100))} a month is saved as paise. Grace days are the default for new accounts on this plan.</p>
        </section>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">Internal limits</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">These controls are only for the product. Customers see the lines above, not this list.</p>
        </div>
        {groups.map((group) => (
          <section key={group.suite} className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">{group.label}</h2>
            <div className="mt-2 divide-y divide-slate-100">
              {group.features.map((feature) => (
                <div key={feature.key} className="grid gap-3 py-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:justify-items-start">
                  <div>
                    <p className="text-sm font-semibold text-[#001B50]">{feature.label}</p>
                    <p className="text-xs text-slate-400">{feature.kind}{feature.shipped ? "" : " · not live"}</p>
                  </div>
                  <FeatureLimitEditor
                    featureKey={feature.key}
                    kind={feature.kind}
                    value={draft.limits[feature.key] || { enabled: false, quota: 0, allowlist: [], config: null }}
                    onChange={(value) => setDraft({ ...draft, limits: { ...draft.limits, [feature.key]: value } })}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#001B50]">Plans</h1>
          <p className="mt-1 text-sm text-slate-500">Cards show the customer wording. The pencil opens price, that wording, and the internal limits.</p>
        </div>
        <button type="button" onClick={() => setCreating((open) => !open)} className="rounded-xl bg-[#001B50] px-4 py-2 text-sm font-semibold text-white">
          New plan
        </button>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      {creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#001B50]">New plan</h2>
            <p className="mt-1 text-sm text-slate-500">Limits and the customer wording are copied from the plan you pick. You can rewrite both after it is created.</p>
            <div className="mt-4 grid gap-3">
              <Field label="Code" value={newPlan.code} onChange={(code) => setNewPlan({ ...newPlan, code })} />
              <Field label="Name" value={newPlan.name} onChange={(name) => setNewPlan({ ...newPlan, name })} />
              <label className="text-xs font-semibold text-slate-500">Copy from
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newPlan.copyFrom} onChange={(event) => setNewPlan({ ...newPlan, copyFrom: event.target.value })}>
                  {plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Monthly price (₹)" value={newPlan.monthlyRupees} onChange={(monthlyRupees) => setNewPlan({ ...newPlan, monthlyRupees })} />
                <Field label="Yearly price (₹)" value={newPlan.yearlyRupees} onChange={(yearlyRupees) => setNewPlan({ ...newPlan, yearlyRupees })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={newPlan.isPublic} onChange={(event) => setNewPlan({ ...newPlan, isPublic: event.target.checked })} /> Show on the public pricing page
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button type="button" disabled={saving} onClick={createPlan} className="rounded-xl bg-[#001B50] px-4 py-2 text-sm font-semibold text-white">Create plan</button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex justify-end">
        <IntervalToggle interval={interval} onChange={setInterval} suite={false} />
      </div>
      <PlanGrid
        plans={plans}
        tone="public"
        interval={interval}
        audience="admin"
        headerAction={(plan) => (
          <button type="button" aria-label={`Edit ${plan.name}`} onClick={() => openEditor(plan as Plan)} className="rounded-full border border-slate-200 p-2 text-[#001B50]">
            <Pencil className="h-4 w-4" />
          </button>
        )}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001B50]">Add a feature</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          This adds an internal limit, not a line on the pricing card. It starts off on every plan. Open each plan and set the number, switch, or allowed values. Customers only see the lines you write under “What customers see.”
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field
            label="Feature name"
            hint="The name shown in the internal limits list. Example: Staff logins. Use plain words. This name is not printed on the public pricing cards."
            placeholder="Staff logins"
            value={featureForm.label}
            onChange={(label) => {
              const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
              setFeatureForm((current) => ({
                ...current,
                label,
                key: !current.key || current.key === slug(current.label) ? slug(label) : current.key,
              }));
            }}
          />
          <Field
            label="Key"
            hint="The id the product checks in code. Lowercase words separated by dots, such as restaurant.staff.seats. Leave the suggestion unless you already have that exact key in the app. A new key is stored, and it starts limiting accounts only after the app checks it."
            placeholder="restaurant.staff.seats"
            value={featureForm.key}
            onChange={(key) => setFeatureForm({ ...featureForm, key })}
          />
          <label className="text-xs font-semibold text-slate-500">Suite
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700" value={featureForm.suite} onChange={(event) => setFeatureForm({ ...featureForm, suite: event.target.value })}>
              <option value="platform">QR codes and profiles</option>
              <option value="restaurant">Restaurant</option>
              <option value="reviews">Reviews</option>
            </select>
            <span className="mt-1 block font-normal leading-5 text-slate-400">Which group this limit sits in when you edit a plan. Pick the product area it belongs to.</span>
          </label>
          <label className="text-xs font-semibold text-slate-500">Measured as
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700" value={featureForm.kind} onChange={(event) => setFeatureForm({ ...featureForm, kind: event.target.value })}>
              <option value="BOOLEAN">On or off</option>
              <option value="QUOTA">Quota</option>
              <option value="MONTHLY">Monthly allowance</option>
              <option value="LIFETIME">Lifetime allowance</option>
              <option value="ALLOWLIST">Allowlist</option>
            </select>
            <span className="mt-1 block font-normal leading-5 text-slate-400">{KIND_HINTS[featureForm.kind]}</span>
          </label>
        </div>
        <button type="button" disabled={saving} onClick={createFeature} className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-[#001B50]">Add feature</button>
      </section>
    </div>
  );
}

const KIND_HINTS: Record<string, string> = {
  BOOLEAN: "Included or not. Use this for a switch such as live orders or advanced analytics.",
  QUOTA: "A standing count, such as 5 menus or 10 QR codes. Unlimited is allowed when you edit the plan.",
  MONTHLY: "A count that starts again each billing month, such as 200 scans or 5 AI menu scans.",
  LIFETIME: "A one-time total that never resets, such as 1 AI menu scan for the life of the account.",
  ALLOWLIST: "A list of allowed values, such as menu layouts or languages. Known lists show as choices. Any other key starts with a blank list you fill in.",
};

function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="text-xs font-semibold text-slate-500">{label}
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 placeholder:font-normal placeholder:text-slate-300" />
      {hint ? <span className="mt-1 block font-normal leading-5 text-slate-400">{hint}</span> : null}
    </label>
  );
}
