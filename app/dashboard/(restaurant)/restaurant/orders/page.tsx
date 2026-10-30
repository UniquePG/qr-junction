"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";

const steps = [
  { title: "Scan", detail: "A guest orders from the menu QR on their table." },
  { title: "Table", detail: "The ticket shows which table sent it." },
  { title: "Accept or cancel", detail: "The floor accepts the order or turns it down." },
  { title: "Status", detail: "Move it from received, to preparing, to served." },
];

export default function RestaurantOrdersPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white border border-[#E7DDD2] rounded-2xl p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[#C4622D]">Coming soon</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#2A211C]">Orders</h2>
        <p className="mt-2 text-sm text-[#6B5A50] leading-relaxed">
          This is where table orders will be handled. Nothing is connected yet, so there is no ticket list to manage.
        </p>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((step, index) => (
          <li key={step.title} className="bg-white border border-[#E7DDD2] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#C4622D]">
              <ClipboardList className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">0{index + 1}</span>
            </div>
            <p className="mt-3 font-semibold text-[#2A211C]">{step.title}</p>
            <p className="mt-1 text-sm text-[#6B5A50]">{step.detail}</p>
          </li>
        ))}
      </ol>
      <Link href="/dashboard/restaurant/tables" className="text-sm font-semibold text-[#C4622D] no-underline">
        Review table QR codes
      </Link>
    </div>
  );
}
