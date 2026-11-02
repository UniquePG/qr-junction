"use client";

import {
  Clock3,
  Crown,
  Flame,
  Heart,
  Pin,
  ScanLine,
  Sparkles,
  Star,
  ChefHat,
  Candy,
  BadgePlus,
} from "lucide-react";
import {
  displayTags,
  presetForTag,
  tagLabel,
  type TagTone,
} from "@/lib/menu/item-config";
import type { MenuItem } from "@/components/menu/types";

const TONE_CLASS: Record<TagTone, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  copper: "border-[#E8C4AE] bg-[#FFF8F3] text-[#C4622D]",
  navy: "border-[#001B50]/20 bg-[#001B50]/5 text-[#001B50]",
};

function TagIcon({ name, className }: { name: string; className?: string }) {
  const props = { className: className || "h-3 w-3" };
  switch (name) {
    case "sparkles":
      return <Sparkles {...props} />;
    case "flame":
      return <Flame {...props} />;
    case "flameHot":
      return <Flame {...props} />;
    case "chef":
      return <ChefHat {...props} />;
    case "crown":
      return <Crown {...props} />;
    case "candy":
      return <Candy {...props} />;
    case "new":
      return <BadgePlus {...props} />;
    case "clock":
      return <Clock3 {...props} />;
    case "star":
      return <Star {...props} />;
    case "pin":
      return <Pin {...props} />;
    case "heart":
      return <Heart {...props} />;
    case "scan":
      return <ScanLine {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

export function ItemTags({
  item,
  hidePopular = false,
  size = "sm",
  className = "",
}: {
  item: Pick<MenuItem, "isPopular" | "config">;
  hidePopular?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const tags = displayTags(item, { hidePopular });
  if (!tags.length) return null;
  const pad = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-1.5 py-0.5 text-[10px]";
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tags.map((tag) => {
        const preset = presetForTag(tag);
        const tone = preset?.tone || "slate";
        return (
          <span
            key={tag}
            title={preset?.vibe || tagLabel(tag)}
            className={`inline-flex items-center gap-1 rounded-full border font-semibold ${pad} ${TONE_CLASS[tone]}`}
          >
            {preset ? <TagIcon name={preset.icon} className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} /> : null}
            {tagLabel(tag)}
          </span>
        );
      })}
    </div>
  );
}
