'use client';

import type { QRSizeConfig } from '@/types/qrTypes';

interface SizeControlsProps {
  size: QRSizeConfig;
  onChange: (size: QRSizeConfig) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
        <span className="text-xs text-gray-500 font-mono">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function SizeControls({ size, onChange }: SizeControlsProps) {
  return (
    <div className="space-y-4">
      <SliderRow
        label="Width"
        value={size.width}
        min={100}
        max={600}
        unit="px"
        onChange={v => onChange({ ...size, width: v })}
      />
      <SliderRow
        label="Height"
        value={size.height}
        min={100}
        max={600}
        unit="px"
        onChange={v => onChange({ ...size, height: v })}
      />
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Margin
          </label>
          <span className="text-xs text-gray-500 font-mono">{size.margin}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={size.margin}
          onChange={e => onChange({ ...size, margin: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      {/* Quick presets */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Quick Sizes
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Small', w: 200, h: 200 },
            { label: 'Medium', w: 300, h: 300 },
            { label: 'Large', w: 400, h: 400 },
            { label: 'XL', w: 500, h: 500 },
          ].map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ ...size, width: preset.w, height: preset.h })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
                size.width === preset.w && size.height === preset.h
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-slate-200 text-gray-600 hover:border-slate-300'
              }`}
            >
              {preset.label}
              <span className="text-gray-400 ml-1">
                {preset.w}px
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
