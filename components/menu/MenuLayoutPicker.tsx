'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { MENU_THEMES, THEME_GROUPS, getMenuTheme } from './themeCatalog';
import type { ThemeGroup } from './types';
import LayoutPreviewArt from './LayoutPreviewArt';

type Props = {
  open: boolean;
  value: string;
  onClose: () => void;
  onApply: (themeId: string) => void;
};

export default function MenuLayoutPicker({ open, value, onClose, onApply }: Props) {
  const [draft, setDraft] = useState(value || 'modern');
  const [group, setGroup] = useState<'all' | ThemeGroup>('all');

  useEffect(() => {
    if (open) setDraft(value || 'modern');
  }, [open, value]);

  const themes = useMemo(
    () => MENU_THEMES.filter((theme) => group === 'all' || theme.group === group),
    [group],
  );

  const selected = getMenuTheme(draft);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 p-3 sm:p-6 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#001B50]">Choose a menu layout</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pick a look. Guests see this after they scan the QR.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-none cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5">
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
            {THEME_GROUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGroup(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer ${
                  group === item.id ? 'bg-[#001B50] text-white border-[#001B50]' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themes.map((theme) => {
              const active = draft === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setDraft(theme.id)}
                  className={`flex flex-col text-left rounded-2xl overflow-hidden border cursor-pointer min-w-0 bg-white ${
                    active ? 'border-[#001B50] ring-2 ring-[#001B50]/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="h-24 shrink-0 overflow-hidden">
                    <LayoutPreviewArt themeId={theme.id} />
                  </div>
                  <div className="p-2.5 bg-white shrink-0 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-[#001B50] wrap-anywhere">{theme.name}</p>
                      {active && <Check className="w-3.5 h-3.5 text-[#001B50] shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{theme.desc}</p>
                    {theme.id === value && (
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#001B50] mt-1">In use</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 cursor-pointer border-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#001B50] text-white cursor-pointer border-none"
          >
            Use {selected.name}
          </button>
        </div>
      </div>
    </div>
  );
}
