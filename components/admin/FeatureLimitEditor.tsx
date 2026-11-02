"use client";

import { FEATURE_ALLOWLISTS } from "@/lib/billing/allowlists";
import { FEATURE_CONFIGS, type ConfigField } from "@/lib/billing/config";
import React, { useState } from "react";

export type LimitDraft = {
  enabled: boolean;
  quota: number;
  allowlist: string[];
  config: Record<string, number> | null;
};

export function FeatureLimitEditor({
  featureKey,
  kind,
  value,
  onChange,
}: {
  featureKey: string;
  kind: string;
  value: LimitDraft;
  onChange: (value: LimitDraft) => void;
}) {
  const options = FEATURE_ALLOWLISTS[featureKey] || [];
  const fields = FEATURE_CONFIGS[featureKey] || [];
  const [custom, setCustom] = useState("");
  const unlimited = value.quota < 0;
  const patch = (next: Partial<LimitDraft>) => onChange({ ...value, ...next });
  const setConfigField = (field: ConfigField, raw: string) => {
    const next = { ...(value.config ?? {}) };
    if (raw.trim() === "") delete next[field.key];
    else {
      const number = Number(raw);
      if (!Number.isFinite(number)) return;
      next[field.key] = number;
    }
    patch({ config: Object.keys(next).length ? next : null });
  };

  const configFields = fields.length ? (
    <div className="flex flex-wrap gap-3">
      {fields.map((field) => (
        <label key={field.key} className="text-xs font-semibold text-slate-600">
          {field.label}
          <input
            type="number"
            min={field.min}
            max={field.max}
            value={value.config?.[field.key] ?? ""}
            onChange={(event) => setConfigField(field, event.target.value)}
            className="mt-1 block w-28 rounded-lg border border-slate-200 px-2 py-1 text-sm font-normal"
          />
        </label>
      ))}
    </div>
  ) : null;

  if (kind === "BOOLEAN") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => patch({ enabled: !value.enabled, quota: 0, allowlist: [] })}
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${value.enabled ? "bg-[#001B50] text-white" : "bg-slate-100 text-slate-500"}`}
        >
          {value.enabled ? "Included" : "Not included"}
        </button>
        {configFields}
      </div>
    );
  }

  if (kind === "ALLOWLIST") {
    const selected = new Set(value.allowlist);
    const extras = value.allowlist.filter((item) => !options.some((option) => option.value === item));
    const toggle = (item: string) => {
      const next = selected.has(item) ? value.allowlist.filter((entry) => entry !== item) : [...value.allowlist, item];
      patch({ enabled: unlimited || next.length > 0, quota: unlimited ? -1 : next.length, allowlist: next });
    };
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(event) => patch({ enabled: event.target.checked, quota: event.target.checked ? -1 : value.allowlist.length, allowlist: value.allowlist })}
          />
          All values
        </label>
        {options.length ? (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <label key={option.value} className={`relative rounded-full border px-3 py-1 text-xs ${selected.has(option.value) && !unlimited ? "border-[#001B50] bg-[#001B50]/5 text-[#001B50]" : "border-slate-200 text-slate-500"}`}>
                <input className="sr-only" type="checkbox" checked={selected.has(option.value)} disabled={unlimited} onChange={() => toggle(option.value)} />
                {option.label}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No preset list for this feature. Add a value the product already accepts.</p>
        )}
        {extras.length ? (
          <div className="flex flex-wrap gap-2">
            {extras.map((item) => (
              <button key={item} type="button" onClick={() => toggle(item)} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {item} ×
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2">
          <input
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            placeholder="Add a value"
            className="w-40 rounded-lg border border-slate-200 px-2 py-1 text-xs"
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
            onClick={() => {
              const nextValue = custom.trim();
              if (!nextValue || selected.has(nextValue)) return;
              const next = [...value.allowlist, nextValue];
              patch({ enabled: true, quota: unlimited ? -1 : next.length, allowlist: next });
              setCustom("");
            }}
          >
            Add
          </button>
        </div>
        {configFields}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={unlimited}
          onChange={(event) => patch({ enabled: event.target.checked || Number(value.quota) > 0, quota: event.target.checked ? -1 : Math.max(0, value.quota), allowlist: [] })}
        />
        Unlimited
      </label>
      <input
        type="number"
        min={0}
        disabled={unlimited}
        value={unlimited ? "" : value.quota}
        onChange={(event) => {
          const quota = Math.max(0, Number(event.target.value) || 0);
          patch({ enabled: quota !== 0, quota, allowlist: [] });
        }}
        className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:bg-slate-50"
      />
      <span className="text-xs text-slate-400">{kind === "MONTHLY" ? "per month" : kind === "LIFETIME" ? "in total" : "at a time"}</span>
      {configFields}
    </div>
  );
}
