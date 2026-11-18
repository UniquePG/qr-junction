"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
  /** Small text on the right of the option (e.g. a count). */
  hint?: string | number;
  /** Secondary line under the label. */
  description?: string;
  /** Extra text matched by search but not shown. */
  keywords?: string;
  disabled?: boolean;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown on the trigger when nothing is selected (value === ""). */
  placeholder?: string;
  /** Accessible name and small caption above the trigger (when `showLabel`). */
  label: string;
  showLabel?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Hide the search box when there are only a few options. Default 7. Set 0 to always show. */
  searchThreshold?: number;
  className?: string;
  /** Align the popover to the right edge of the trigger. */
  alignRight?: boolean;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 shrink-0 text-[#8A7568] transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-[#1C1410]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

/**
 * Reusable single-select dropdown with search, keyboard navigation and
 * click-outside / Escape to close.
 */
export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  label,
  showLabel = false,
  searchPlaceholder = "Search…",
  emptyText = "No results",
  disabled = false,
  searchThreshold = 7,
  className = "",
  alignRight = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [flipUp, setFlipUp] = useState(false);
  const [placement, setPlacement] = useState<{ side: "left" | "right"; width: number }>({ side: "left", width: 220 });
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uid = useId();

  const searchable = options.length > searchThreshold;
  const selected = options.find((o) => o.value === value) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.keywords || ""} ${o.description || ""}`.toLowerCase().includes(q));
  }, [options, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const openMenu = () => {
    if (disabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      setFlipUp(window.innerHeight - rect.bottom < 300 && rect.top > window.innerHeight - rect.bottom);
      // Keep the menu inside the viewport so it never pushes the page sideways on mobile.
      const margin = 8;
      const viewport = document.documentElement.clientWidth || window.innerWidth;
      const desired = Math.min(Math.max(rect.width, 220), viewport - margin * 2);
      const fitsLeft = rect.left + desired <= viewport - margin;
      const fitsRight = rect.right - desired >= margin;
      const side: "left" | "right" = alignRight ? (fitsRight ? "right" : "left") : fitsLeft ? "left" : fitsRight ? "right" : "left";
      const room = side === "left" ? viewport - margin - Math.max(rect.left, margin) : rect.right - margin;
      setPlacement({ side, width: Math.max(Math.min(desired, room), Math.min(rect.width, viewport - margin * 2)) });
    }
    const index = Math.max(0, options.findIndex((o) => o.value === value));
    setActive(index);
    setOpen(true);
  };

  const choose = (option: SelectOption | undefined) => {
    if (!option || option.disabled) return;
    onChange(option.value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // Keep the highlighted option in range and in view.
  useEffect(() => {
    if (!open) return;
    setActive((i) => Math.min(Math.max(0, i), Math.max(0, filtered.length - 1)));
  }, [filtered.length, open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(0, filtered.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(filtered[active]);
    } else if (event.key === "Tab") {
      close();
    }
  };

  const listId = `${uid}-list`;

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`} onKeyDown={onKeyDown}>
      {showLabel ? <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">{label}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={showLabel ? undefined : label}
        className={`flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${open ? "border-[#1C1410]" : "border-[#E7DDD2] hover:border-[#C9B8A6]"}`}
      >
        <span className="flex min-w-0 items-baseline gap-1.5">
          {!showLabel ? <span className="shrink-0 text-xs font-semibold text-[#8A7568]">{label}:</span> : null}
          <span className={`truncate ${selected && selected.value !== "" ? "font-semibold text-[#1C1410]" : "text-[#1C1410]"}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <Chevron open={open} />
      </button>

      {open ? (
        <div
          style={{ width: placement.width }}
          className={`absolute z-40 max-w-[calc(100vw-16px)] overflow-hidden rounded-xl border border-[#E7DDD2] bg-white shadow-xl ${placement.side === "right" ? "right-0" : "left-0"} ${flipUp ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          {searchable ? (
            <div className="border-b border-[#F0E8DE] p-2">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={`Search ${label}`}
                className="h-9 w-full rounded-lg border border-[#E7DDD2] bg-[#FCFAF7] px-3 text-sm outline-none focus:border-[#1C1410]"
              />
            </div>
          ) : null}
          <ul ref={listRef} id={listId} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-[#8A7568]">{emptyText}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value || "__empty"}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${index === active ? "bg-[#F6F1EA]" : ""} ${option.disabled ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span className="min-w-0">
                      <span className={`block truncate ${isSelected ? "font-semibold text-[#1C1410]" : "text-[#2A211C]"}`}>{option.label}</span>
                      {option.description ? <span className="block truncate text-xs text-[#8A7568]">{option.description}</span> : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {option.hint !== undefined ? <span className="text-xs text-[#A99888]">{option.hint}</span> : null}
                      {isSelected ? <CheckMark /> : null}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
