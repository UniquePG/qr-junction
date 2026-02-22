'use client';

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
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span>⚠️</span>
          <p className="text-xs text-amber-700 font-medium">
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
                ? 'border-primary-400 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
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
              <div className="text-sm font-semibold text-gray-800">{l.label}</div>
              <div className="text-xs text-gray-500">{l.description}</div>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-gray-600 px-2 py-0.5 rounded">
              {l.recovery}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
