"use client";

import SearchableSelect from "@/components/ui/SearchableSelect";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
  noun?: string;
};

/** 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(page: number, pages: number): Array<number | "gap-left" | "gap-right"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const items: Array<number | "gap-left" | "gap-right"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) items.push("gap-left");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < pages - 1) items.push("gap-right");
  items.push(pages);
  return items;
}

const btn =
  "flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E7DDD2] bg-white px-2.5 text-sm font-semibold text-[#1C1410] hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  disabled = false,
  noun = "results",
}: Props) {
  if (total <= 0) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-[#6B5A50]">
          Showing <span className="font-semibold text-[#1C1410]">{from}–{to}</span> of{" "}
          <span className="font-semibold text-[#1C1410]">{total.toLocaleString()}</span> {noun}
        </p>
        {onPageSizeChange ? (
          <SearchableSelect
            label="Per page"
            value={String(pageSize)}
            onChange={(v) => onPageSizeChange(Number(v))}
            options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
            className="w-[130px]"
            searchThreshold={99}
          />
        ) : null}
      </div>

      {pages > 1 ? (
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
          <button type="button" disabled={disabled || current <= 1} onClick={() => onPageChange(current - 1)} className={btn} aria-label="Previous page">
            ‹ <span className="ml-1 hidden sm:inline">Prev</span>
          </button>
          {pageWindow(current, pages).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(item)}
                aria-current={item === current ? "page" : undefined}
                className={`${btn} ${item === current ? "!border-[#1C1410] !bg-[#1C1410] !text-white hover:!bg-[#1C1410]" : ""}`}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="px-1 text-sm text-[#A99888]" aria-hidden>…</span>
            ),
          )}
          <button type="button" disabled={disabled || current >= pages} onClick={() => onPageChange(current + 1)} className={btn} aria-label="Next page">
            <span className="mr-1 hidden sm:inline">Next</span> ›
          </button>
        </nav>
      ) : null}
    </div>
  );
}
