'use client';

import { PRESET_STYLES } from '@/config/presets';
import type { QRConfig } from '@/types/qrTypes';

interface PresetStylesProps {
  onApply: (partial: Partial<QRConfig>) => void;
}

export default function PresetStyles({ onApply }: PresetStylesProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRESET_STYLES.map(preset => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onApply(preset.config)}
          className="group flex flex-col items-start p-3 rounded-xl border-2 border-slate-800 hover:border-primary bg-slate-950/50 hover:bg-primary/5 transition-all text-left"
        >
          {/* Color swatches */}
          <div className="flex gap-1 mb-2">
            {preset.swatchColors.map((color, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-200 group-hover:text-primary transition-colors">
            {preset.name}
          </span>
          <span className="text-xs text-slate-500 leading-tight mt-0.5">
            {preset.description}
          </span>
        </button>
      ))}
    </div>
  );
}
