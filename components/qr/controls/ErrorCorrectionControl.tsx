'use client';

import { AlertTriangle } from 'lucide-react';
import type { ErrorCorrectionLevel } from '@/types/qrTypes';

interface ErrorCorrectionControlProps {
  level: ErrorCorrectionLevel;
  onChange: (level: ErrorCorrectionLevel) => void;
  lockedToH: boolean; // true when logo is active
}

const LEVELS: {
  value: ErrorCorrectionLevel;
  label: string;
  description: string;
  recovery: string;
}[] = [
  { value: 'L', label: 'L — Low', description: 'Fastest scan', recovery: '7%' },
  { value: 'M', label: 'M — Medium', description: 'Balanced (default)', recovery: '15%' },
  { value: 'Q', label: 'Q — Quartile', description: 'High reliability', recovery: '25%' },
  { value: 'H', label: 'H — High', description: 'With logo overlay', recovery: '30%' },
];

export default function ErrorCorrectionControl({
  level,
  onChange,
  lockedToH,
}: ErrorCorrectionControlProps) {
  const effectiveLevel = lockedToH ? 'H' : level;

  return (
    <div className="space-y-3">
      {lockedToH && (
        <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-900/40 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400 font-medium">
            Auto-set to H because a logo is applied
          </p>
        </div>
      )}

      <div className="space-y-2">
        {LEVELS.map(l => (
          <label
            key={l.value}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              effectiveLevel === l.value
                ? 'border-primary bg-primary/10'
                : 'border-slate-800 hover:border-slate-600 bg-slate-950/30'
            } ${lockedToH && l.value !== 'H' ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <input
              type="radio"
              name="ecl"
              value={l.value}
              checked={effectiveLevel === l.value}
              onChange={() => !lockedToH && onChange(l.value)}
              className="accent-primary w-4 h-4"
              disabled={lockedToH}
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200">{l.label}</div>
              <div className="text-xs text-slate-500">{l.description}</div>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {l.recovery}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
