'use client';

import { useState, type ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

export default function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center">{icon}</span>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          {badge && (
            <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 bg-white">{children}</div>
      </div>
    </div>
  );
}
