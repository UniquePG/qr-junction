'use client';

import type { DotType, GradientConfig, QRDotsConfig } from '@/types/qrTypes';

interface DotsCustomizerProps {
  dots: QRDotsConfig;
  onChange: (dots: QRDotsConfig) => void;
}

const DOT_STYLES: { value: DotType; label: string; preview: string }[] = [
  { value: 'square', label: 'Square', preview: '▪' },
  { value: 'rounded', label: 'Rounded', preview: '▬' },
  { value: 'dots', label: 'Dots', preview: '●' },
  { value: 'classy', label: 'Classy', preview: '◆' },
  { value: 'classy-rounded', label: 'Classy Rd.', preview: '◈' },
  { value: 'extra-rounded', label: 'Extra Rd.', preview: '⬤' },
];

export default function DotsCustomizer({ dots, onChange }: DotsCustomizerProps) {
  const hasGradient = !!dots.gradient;

  const updateGradient = (partial: Partial<GradientConfig>) => {
    const current = dots.gradient ?? {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#4361ee' },
        { offset: 1, color: '#7209b7' },
      ],
    };
    onChange({ ...dots, gradient: { ...current, ...partial } });
  };

  return (
    <div className="space-y-4">
      {/* Dot Style */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Dot Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DOT_STYLES.map(style => (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange({ ...dots, type: style.value })}
              className={`flex flex-col items-center py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all ${
                dots.type === style.value
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-slate-200 text-gray-600 hover:border-slate-300'
              }`}
            >
              <span className="text-lg leading-none mb-1">{style.preview}</span>
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color / Gradient toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {hasGradient ? 'Gradient' : 'Solid Color'}
          </label>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...dots,
                gradient: hasGradient
                  ? undefined
                  : {
                      type: 'linear',
                      rotation: 0,
                      colorStops: [
                        { offset: 0, color: dots.color },
                        { offset: 1, color: '#7209b7' },
                      ],
                    },
              })
            }
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              hasGradient
                ? 'bg-primary-500 text-white border-primary-500'
                : 'border-slate-300 text-gray-600 hover:border-primary-400'
            }`}
          >
            {hasGradient ? '✓ Gradient' : '+ Gradient'}
          </button>
        </div>

        {!hasGradient ? (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={dots.color}
              onChange={e => onChange({ ...dots, color: e.target.value })}
              className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={dots.color}
              onChange={e => onChange({ ...dots, color: e.target.value })}
              className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-400"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={dots.gradient?.type}
                onChange={e => updateGradient({ type: e.target.value as 'linear' | 'radial' })}
                className="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
              {dots.gradient?.type === 'linear' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={dots.gradient?.rotation ?? 0}
                    onChange={e => updateGradient({ rotation: Number(e.target.value) })}
                    className="w-16 px-2 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
                  />
                  <span className="text-xs text-gray-500">°</span>
                </div>
              )}
            </div>

            {/* Color stops */}
            {[0, 1].map(i => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={dots.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(dots.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], color: e.target.value };
                    updateGradient({ colorStops: stops });
                  }}
                  className="w-9 h-9 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={dots.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(dots.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], color: e.target.value };
                    updateGradient({ colorStops: stops });
                  }}
                  className="flex-1 px-2 py-2 border-2 border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-primary-400"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round((dots.gradient?.colorStops[i]?.offset ?? i) * 100)}
                  onChange={e => {
                    const stops = [...(dots.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], offset: Number(e.target.value) / 100 };
                    updateGradient({ colorStops: stops });
                  }}
                  className="w-16 accent-primary"
                />
                <span className="text-xs text-gray-500 w-7">
                  {Math.round((dots.gradient?.colorStops[i]?.offset ?? i) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
