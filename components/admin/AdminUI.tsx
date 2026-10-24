"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import React from "react";

export function AdminStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-2xl font-black text-[#001B50] mt-2">{value}</p>
      {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}

export function AdminCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-xs">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full max-w-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    />
  );
}

export function AdminSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary"
    >
      {children}
    </select>
  );
}

export function AdminPagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total?: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <span>
        {typeof total === "number" ? `${total.toLocaleString("en-IN")} total · ` : ""}
        Page {page} of {totalPages}
      </span>
    </div>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
            {headers.map((header) => (
              <th key={header} className="py-3 pr-4 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return <p className="text-sm text-slate-500 py-8 text-center">{message}</p>;
}

export function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );
}

export function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-primary font-medium hover:underline">
      {children}
    </Link>
  );
}
