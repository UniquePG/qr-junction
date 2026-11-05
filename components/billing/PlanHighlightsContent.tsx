"use client";

import { parsePlanHighlights, type PlanHighlights } from "@/lib/billing/present";
import { Check } from "lucide-react";
import React from "react";

type Tone = "public" | "suite";

const tones = {
  public: {
    badge: "bg-[#E8F0FE] text-[#0046a1]",
    subtitle: "text-[#334155]",
    descriptionWrap: "border-[#E2E8F4] bg-[#F7F9FC]",
    description: "text-slate-600",
    label: "text-[#64748B]",
    feature: "text-slate-700",
    checkWrap: "bg-[#E8F0FE] text-[#0046a1]",
    bestForWrap: "border-[#E2E8F4] bg-[#F8FAFC]",
    bestFor: "text-slate-500",
    empty: "text-slate-400",
  },
  suite: {
    badge: "bg-[#FFF4EC] text-[#C4622D]",
    subtitle: "text-[#4A3B32]",
    descriptionWrap: "border-[#E7DDD2] bg-[#FFFCF8]",
    description: "text-[#6B5A50]",
    label: "text-[#8A7568]",
    feature: "text-[#1C1410]",
    checkWrap: "bg-[#FFF4EC] text-[#C4622D]",
    bestForWrap: "border-[#E7DDD2] bg-[#FFF8F2]",
    bestFor: "text-[#6B5A50]",
    empty: "text-[#6B5A50]",
  },
} as const;

export default function PlanHighlightsContent({
  value,
  tone = "public",
  emptyLabel = "Details coming soon.",
  hideSection = false,
  hideSubtitle = false,
}: {
  value: PlanHighlights | unknown;
  tone?: Tone;
  emptyLabel?: string;
  /** Parent already rendered the section badge */
  hideSection?: boolean;
  /** Parent already rendered the catchy line */
  hideSubtitle?: boolean;
}) {
  const content = parsePlanHighlights(value);
  const t = tones[tone];
  const showSection = Boolean(content.section) && !hideSection;
  const showSubtitle = Boolean(content.subtitle) && !hideSubtitle;
  const showDescription = Boolean(content.description);
  const showFeatures = content.features.length > 0;
  const showBestFor = Boolean(content.bestFor);
  const hasAny = showSection || showSubtitle || showDescription || showFeatures || showBestFor;

  if (!hasAny) {
    return <p className={`text-sm ${t.empty}`}>{emptyLabel}</p>;
  }

  return (
    <div className="space-y-4">
      {showSection ? (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${t.badge}`}>
          {content.section}
        </span>
      ) : null}

      {showSubtitle ? (
        <p className={`text-[15px] italic leading-relaxed ${t.subtitle}`}>{content.subtitle}</p>
      ) : null}

      {showDescription ? (
        <div className={`rounded-2xl border px-3.5 py-3 ${t.descriptionWrap}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${t.label}`}>Plan description</p>
          <p className={`mt-2 text-sm leading-relaxed ${t.description}`}>{content.description}</p>
        </div>
      ) : null}

      {showFeatures ? (
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${t.label}`}>Features</p>
          <ul className="mt-2.5 space-y-2.5">
            {content.features.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm leading-snug">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${t.checkWrap}`}>
                  <Check className="h-3 w-3" strokeWidth={2.75} />
                </span>
                <span className={t.feature}>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showBestFor ? (
        <div className={`rounded-2xl border px-3.5 py-3 ${t.bestForWrap}`}>
          <p className={`text-xs leading-relaxed ${t.bestFor}`}>
            <span className={`font-semibold ${tone === "suite" ? "text-[#1C1410]" : "text-slate-700"}`}>Best for</span>
            <span className="mx-1.5 opacity-40">·</span>
            {content.bestFor}
          </p>
        </div>
      ) : null}
    </div>
  );
}
