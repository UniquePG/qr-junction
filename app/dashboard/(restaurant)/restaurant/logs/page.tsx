"use client";

import Pagination from "@/components/ui/Pagination";
import SearchableSelect, { type SelectOption } from "@/components/ui/SearchableSelect";
import { restaurantService } from "@/lib/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LogRow = {
  id: string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  summary: string;
  meta?: unknown;
  ip?: string | null;
  actorKind: string;
  actor: { id: number; name: string | null; email: string };
  createdAt: string;
};

type Facets = {
  actors: Array<{ id: number; name: string | null; email: string; count: number }>;
  actions: Array<{ action: string; count: number }>;
};

type DatePreset = "ALL" | "TODAY" | "7D" | "30D" | "CUSTOM";

const DEFAULT_PAGE_SIZE = 25;

const CATEGORIES: Record<string, { label: string; tone: string }> = {
  order: { label: "Orders", tone: "bg-[#FDECE0] text-[#B4531F]" },
  waiter: { label: "Waiter calls", tone: "bg-[#E6E8F6] text-[#3E4A8A]" },
  menu: { label: "Menus", tone: "bg-[#E3EFE7] text-[#2F6B45]" },
  item: { label: "Menu items", tone: "bg-[#E3EFE7] text-[#2F6B45]" },
  category: { label: "Categories", tone: "bg-[#E3EFE7] text-[#2F6B45]" },
  offer: { label: "Offers", tone: "bg-[#F8E8F0] text-[#8A3E6B]" },
  table: { label: "Tables", tone: "bg-[#EFEAD8] text-[#7A6420]" },
  qr: { label: "QR design", tone: "bg-[#EFEAD8] text-[#7A6420]" },
  staff: { label: "Staff", tone: "bg-[#E1EEF3] text-[#255E78]" },
  role: { label: "Roles", tone: "bg-[#E1EEF3] text-[#255E78]" },
  profile: { label: "Profile", tone: "bg-[#EEE6F6] text-[#5E3E8A]" },
  settings: { label: "Settings", tone: "bg-[#EEE6F6] text-[#5E3E8A]" },
  locale: { label: "Languages", tone: "bg-[#EEE6F6] text-[#5E3E8A]" },
  auth: { label: "Sign-ins", tone: "bg-[#EDEAE6] text-[#4B3F36]" },
  billing: { label: "Billing", tone: "bg-[#FBEFD0] text-[#7A5418]" },
};

const VERBS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  remove: "Removed",
  enable: "Enabled",
  disable: "Disabled",
  login: "Signed in",
  logout: "Signed out",
  password_change: "Password changed",
  password_reset: "Password reset",
  status: "Status changed",
  stage: "Stage changed",
  ready_in: "Ready time set",
  paid: "Marked paid",
  unpaid: "Marked unpaid",
  ack: "Acknowledged",
  availability: "Availability changed",
  image_generate: "AI image",
  scan: "AI scan",
  import: "Imported",
  design: "Design changed",
  checkout: "Checkout started",
  bill_view: "Bill viewed",
  bill_download: "Bill downloaded",
  prep_minutes: "Prep time changed",
};

const PERIOD_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All time" },
  { value: "TODAY", label: "Today" },
  { value: "7D", label: "Last 7 days" },
  { value: "30D", label: "Last 30 days" },
  { value: "CUSTOM", label: "Custom range…" },
];

const TYPE_OPTIONS: SelectOption[] = [
  { value: "", label: "Owner & staff" },
  { value: "OWNER", label: "Owner only" },
  { value: "STAFF", label: "Staff only" },
];

function titleCase(value: string) {
  const text = value.replace(/[_-]+/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : value;
}

function categoryOf(action: string) {
  return action.split(".")[0] || "other";
}

function categoryMeta(key: string) {
  return CATEGORIES[key] || { label: titleCase(key), tone: "bg-[#EDEAE6] text-[#4B3F36]" };
}

function verbOf(action: string) {
  const [, ...rest] = action.split(".");
  const key = rest.join(".");
  return VERBS[key] || titleCase(key || action);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayLabel(date: Date) {
  const today = startOfToday();
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return day.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: day.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function metaEntries(meta: unknown): Array<[string, string]> {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return [];
  return Object.entries(meta as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]): [string, string] => {
      const label = titleCase(k.replace(/([a-z])([A-Z])/g, "$1 $2"));
      if (Array.isArray(v)) return [label, v.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(", ")];
      return [label, typeof v === "object" ? JSON.stringify(v) : String(v)];
    })
    .filter(([, v]) => v !== "");
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function formatShortDate(value: string) {
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const dateInputCls = "h-10 w-full rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm text-[#1C1410] outline-none focus:border-[#1C1410]";

function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#E7DDD2] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7568]">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-[#1C1410]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#6B5A50]">{hint}</p> : null}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[#8A7568]">{label}</dt>
      <dd className={`mt-0.5 break-words font-medium text-[#1C1410] ${mono ? "font-mono text-[11px]" : ""}`}>{value}</dd>
    </div>
  );
}

function FilterChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F1EA] py-1 pl-3 pr-1.5 text-xs font-semibold text-[#1C1410]">
      {children}
      <button type="button" onClick={onRemove} aria-label="Remove filter" className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-none bg-[#E7DDD2] p-0 text-[11px] leading-none text-[#6B5A50] hover:bg-[#D9CCBD]">
        ×
      </button>
    </span>
  );
}

export default function RestaurantLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [facets, setFacets] = useState<Facets>({ actors: [], actions: [] });
  const [stats, setStats] = useState({ today: 0, week: 0, actors: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [actorId, setActorId] = useState("");
  const [actorKind, setActorKind] = useState("");
  const [preset, setPreset] = useState<DatePreset>("ALL");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const requestSeq = useRef(0);
  const needMeta = useRef(true);
  const listTop = useRef<HTMLDivElement>(null);

  // Debounce the search box; only reset the page when the term really changed.
  useEffect(() => {
    const next = searchInput.trim();
    if (next === search) return;
    const t = setTimeout(() => {
      setSearch(next);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  const rangeError = preset === "CUSTOM" && customFrom && customTo && customFrom > customTo ? "“From” date must be on or before “To” date." : null;

  const range = useMemo(() => {
    const today = startOfToday();
    if (preset === "TODAY") return { from: today.toISOString(), to: undefined };
    if (preset === "7D") return { from: new Date(today.getTime() - 6 * 86_400_000).toISOString(), to: undefined };
    if (preset === "30D") return { from: new Date(today.getTime() - 29 * 86_400_000).toISOString(), to: undefined };
    if (preset === "CUSTOM" && !rangeError) {
      const from = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
      const to = customTo ? new Date(`${customTo}T23:59:59.999`) : null;
      return { from: from?.toISOString(), to: to?.toISOString() };
    }
    return { from: undefined, to: undefined };
  }, [preset, customFrom, customTo, rangeError]);

  const load = useCallback(async () => {
    if (rangeError) {
      setLogs([]);
      setTotal(0);
      setLoading(false);
      setError(false);
      return;
    }
    const seq = ++requestSeq.current;
    const withMeta = needMeta.current;
    setLoading(true);
    setError(false);
    const result = await restaurantService.listLogs({
      page,
      pageSize,
      category: category || undefined,
      actorUserId: actorId ? Number(actorId) : undefined,
      actorKind: actorKind || undefined,
      q: search || undefined,
      from: range.from,
      to: range.to,
      dayStart: startOfToday().toISOString(),
      meta: withMeta ? 1 : undefined,
    });
    if (seq !== requestSeq.current) return; // a newer request superseded this one
    setLoading(false);
    if (!result.ok) {
      setError(true);
      return;
    }
    const data = result.data;
    setLogs(data.logs || []);
    setTotal(Number(data.total || 0));
    if (data.page && data.page !== page) setPage(data.page); // server clamped into range
    if (data.stats) setStats(data.stats);
    if (data.facets) setFacets(data.facets);
    if (withMeta && data.facets) needMeta.current = false;
  }, [page, pageSize, category, actorId, actorKind, search, range, rangeError]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = () => {
    needMeta.current = true;
    void load();
  };

  const categoryOptions: SelectOption[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const { action, count } of facets.actions) {
      const key = categoryOf(action);
      map.set(key, (map.get(key) || 0) + count);
    }
    const rows = [...map.entries()].sort((a, b) => categoryMeta(a[0]).label.localeCompare(categoryMeta(b[0]).label));
    const all = rows.reduce((sum, [, n]) => sum + n, 0);
    const options: SelectOption[] = [{ value: "", label: "All areas", hint: all || undefined }];
    for (const [key, count] of rows) options.push({ value: key, label: categoryMeta(key).label, hint: count });
    // Keep a selected area visible even if facets haven't loaded yet.
    if (category && !map.has(category)) options.push({ value: category, label: categoryMeta(category).label });
    return options;
  }, [facets.actions, category]);

  const actorOptions: SelectOption[] = useMemo(() => {
    const options: SelectOption[] = [{ value: "", label: "Everyone" }];
    for (const a of facets.actors) {
      options.push({
        value: String(a.id),
        label: a.name || a.email,
        description: a.name ? a.email : undefined,
        keywords: a.email,
        hint: a.count,
      });
    }
    if (actorId && !facets.actors.some((a) => String(a.id) === actorId)) options.push({ value: actorId, label: `User #${actorId}` });
    return options;
  }, [facets.actors, actorId]);

  const grouped = useMemo(() => {
    const groups: Array<{ key: string; label: string; rows: LogRow[] }> = [];
    for (const row of logs) {
      const date = new Date(row.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.rows.push(row);
      else groups.push({ key, label: dayLabel(date), rows: [row] });
    }
    return groups;
  }, [logs]);

  const activeFilterCount = [search, category, actorId, actorKind, preset !== "ALL" ? preset : ""].filter(Boolean).length;
  const filtersActive = activeFilterCount > 0;

  const periodLabel = useMemo(() => {
    if (preset !== "CUSTOM") return PERIOD_OPTIONS.find((o) => o.value === preset)?.label || "";
    if (customFrom && customTo) return `${formatShortDate(customFrom)} – ${formatShortDate(customTo)}`;
    if (customFrom) return `From ${formatShortDate(customFrom)}`;
    if (customTo) return `Until ${formatShortDate(customTo)}`;
    return "Custom range";
  }, [preset, customFrom, customTo]);

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setActorId("");
    setActorKind("");
    setPreset("ALL");
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  };

  /** Change any filter and jump back to page 1. */
  const filter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
    setExpanded(null);
  };

  const goToPage = (next: number) => {
    setPage(next);
    setExpanded(null);
    const el = listTop.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
    setExpanded(null);
  };

  const exportCsv = () => {
    const header = ["Time", "Actor", "Email", "Type", "Category", "Action", "Summary", "IP"];
    const lines = logs.map((l) =>
      [
        new Date(l.createdAt).toISOString(),
        l.actor.name || "",
        l.actor.email,
        l.actorKind,
        categoryMeta(categoryOf(l.action)).label,
        l.action,
        l.summary,
        l.ip || "",
      ]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-page-${page}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actorChipLabel = actorOptions.find((o) => o.value === actorId)?.label || "";
  const showSkeleton = loading && logs.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C1410]">Activity logs</h2>
          <p className="mt-1 max-w-xl text-sm text-[#6B5A50]">
            A full audit trail of who did what across orders, waiter calls, menus, tables, staff and settings.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={refresh} disabled={loading} className="h-10 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-4 text-sm font-semibold text-[#1C1410] hover:bg-[#F6F1EA] disabled:opacity-60">
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button type="button" onClick={exportCsv} disabled={logs.length === 0} title="Exports the rows on this page" className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            Export page
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today" value={stats.today} hint="Events since midnight" />
        <StatCard label="Last 7 days" value={stats.week} hint="All recorded events" />
        <StatCard label="People active" value={facets.actors.length || stats.actors} hint="Owner and staff with activity" />
        <StatCard label={filtersActive ? "Matching" : "Total events"} value={total.toLocaleString()} hint={filtersActive ? "With current filters" : "All time"} />
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-[#E7DDD2] bg-white" aria-label="Filters">
        <div className="flex items-center justify-between gap-3 border-b border-[#F0E8DE] px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1C1410]">Filters</h3>
            {filtersActive ? <span className="rounded-full bg-[#1C1410] px-2 py-0.5 text-[11px] font-semibold text-white">{activeFilterCount} active</span> : null}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!filtersActive}
            className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#C4622D] disabled:cursor-not-allowed disabled:text-[#C9B8A6]"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="relative">
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A99888]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" />
            </svg>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search activity, e.g. “Table 5” or “Kitchen”"
              aria-label="Search activity"
              className="h-10 w-full rounded-xl border border-[#E7DDD2] bg-white pl-9 pr-3 text-sm text-[#1C1410] outline-none placeholder:text-[#A99888] focus:border-[#1C1410]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SearchableSelect label="Person" value={actorId} onChange={filter(setActorId)} options={actorOptions} searchPlaceholder="Search people…" emptyText="No people found" />
            <SearchableSelect label="User type" value={actorKind} onChange={filter(setActorKind)} options={TYPE_OPTIONS} />
            <SearchableSelect label="Area" value={category} onChange={filter(setCategory)} options={categoryOptions} searchPlaceholder="Search areas…" emptyText="No areas found" searchThreshold={5} />
            <SearchableSelect label="Period" value={preset} onChange={filter((v: string) => setPreset(v as DatePreset))} options={PERIOD_OPTIONS} alignRight />
          </div>

          {preset === "CUSTOM" ? (
            <div className="grid gap-3 rounded-xl bg-[#FCFAF7] p-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">From</span>
                <input type="date" value={customFrom} max={customTo || undefined} onChange={(e) => filter(setCustomFrom)(e.target.value)} className={dateInputCls} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">To</span>
                <input type="date" value={customTo} min={customFrom || undefined} onChange={(e) => filter(setCustomTo)(e.target.value)} className={dateInputCls} />
              </label>
              {rangeError ? <p className="text-xs font-medium text-[#B4531F] sm:col-span-2">{rangeError}</p> : null}
            </div>
          ) : null}

          {filtersActive ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-[#F0E8DE] pt-3">
              <span className="text-xs text-[#8A7568]">Applied:</span>
              {search ? (
                <FilterChip onRemove={() => { setSearchInput(""); setSearch(""); setPage(1); }}>“{search}”</FilterChip>
              ) : null}
              {actorId ? <FilterChip onRemove={() => filter(setActorId)("")}>{actorChipLabel}</FilterChip> : null}
              {actorKind ? <FilterChip onRemove={() => filter(setActorKind)("")}>{actorKind === "OWNER" ? "Owner only" : "Staff only"}</FilterChip> : null}
              {category ? <FilterChip onRemove={() => filter(setCategory)("")}>{categoryMeta(category).label}</FilterChip> : null}
              {preset !== "ALL" ? (
                <FilterChip onRemove={() => { setPreset("ALL"); setCustomFrom(""); setCustomTo(""); setPage(1); }}>{periodLabel}</FilterChip>
              ) : null}
              <span className="ml-auto text-xs text-[#6B5A50]">
                {rangeError ? "Fix the date range to see results" : loading ? "Searching…" : `${total.toLocaleString()} result${total === 1 ? "" : "s"}`}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {/* Timeline */}
      <div ref={listTop} className="scroll-mt-4 space-y-5">
        {showSkeleton ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-2xl border border-[#E7DDD2] bg-white" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#F0D9B5] bg-[#FFF8EC] px-4 py-8 text-center text-sm text-[#7A5418]">
            Could not load activity logs.{" "}
            <button type="button" onClick={refresh} className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[#C4622D]">Try again</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9CCBD] bg-white px-6 py-12 text-center">
            <p className="text-base font-semibold text-[#1C1410]">
              {rangeError ? "Invalid date range" : filtersActive ? "No activity matches your filters" : "No activity recorded yet"}
            </p>
            <p className="mt-1 text-sm text-[#6B5A50]">
              {rangeError ? rangeError : filtersActive ? "Try a different search, person, area or date range." : "Actions by you and your staff will appear here."}
            </p>
            {filtersActive ? (
              <button type="button" onClick={resetFilters} className="mt-4 h-9 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-4 text-sm font-semibold text-[#1C1410]">
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className={`space-y-5 transition-opacity ${loading ? "pointer-events-none opacity-50" : ""}`} aria-busy={loading}>
            {grouped.map((group) => (
              <section key={group.key}>
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">{group.label}</h3>
                  <span className="h-px flex-1 bg-[#E7DDD2]" />
                  <span className="text-[11px] text-[#A99888]">{group.rows.length} on this page</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#E7DDD2] bg-white">
                  {group.rows.map((log) => {
                    const cat = categoryMeta(categoryOf(log.action));
                    const name = log.actor.name || log.actor.email;
                    const open = expanded === log.id;
                    const entries = metaEntries(log.meta);
                    return (
                      <div key={log.id} className="border-b border-[#F3ECE3] last:border-b-0">
                        <button
                          type="button"
                          onClick={() => setExpanded(open ? null : log.id)}
                          aria-expanded={open}
                          className="flex w-full cursor-pointer items-start gap-3 border-none bg-transparent px-4 py-3 text-left hover:bg-[#FCFAF7]"
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6F1EA] text-xs font-semibold text-[#6B5A50]" title={name}>
                            {initials(name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-snug text-[#1C1410]">{log.summary}</span>
                            <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B5A50]">
                              <span className="font-medium text-[#2A211C]">{name}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${log.actorKind === "OWNER" ? "bg-[#1C1410] text-white" : "bg-[#E1EEF3] text-[#255E78]"}`}>
                                {log.actorKind === "OWNER" ? "Owner" : "Staff"}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.tone}`}>{cat.label}</span>
                              <span className="text-[#8A7568]">{verbOf(log.action)}</span>
                            </span>
                          </span>
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-xs font-semibold text-[#2A211C]">{timeLabel(log.createdAt)}</span>
                            <span className={`text-[#A99888] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
                              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4" /></svg>
                            </span>
                          </span>
                        </button>
                        {open ? (
                          <div className="border-t border-[#F3ECE3] bg-[#FCFAF7] px-4 py-3 sm:pl-[68px]">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:gap-x-6">
                              <Detail label="Date & time" value={new Date(log.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "medium" })} />
                              <Detail label="Person" value={`${name}${log.actor.name ? ` · ${log.actor.email}` : ""}`} />
                              <Detail label="Action key" value={log.action} mono />
                              <Detail label="Resource" value={log.resourceType ? `${titleCase(log.resourceType)}${log.resourceId ? ` #${log.resourceId}` : ""}` : "—"} />
                              {entries.map(([k, v]) => (
                                <Detail key={k} label={k} value={v} />
                              ))}
                            </dl>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {!error && !rangeError ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          disabled={loading}
          noun="events"
        />
      ) : null}
    </div>
  );
}
