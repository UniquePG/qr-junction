'use client';

import type { GradientConfig, QRBackgroundConfig } from '@/types/qrTypes';

interface BackgroundCustomizerProps {
  background: QRBackgroundConfig;
  onChange: (bg: QRBackgroundConfig) => void;
}

export default function BackgroundCustomizer({ background, onChange }: BackgroundCustomizerProps) {
  const hasGradient = !!background.gradient;

  const updateGradient = (partial: Partial<GradientConfig>) => {
    const current = background.gradient ?? {
      type: 'linear' as const,
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#ffffff' },
        { offset: 1, color: '#f0f4ff' },
      ],
    };
    onChange({ ...background, gradient: { ...current, ...partial } });
  };

  return (
    <div className="space-y-4">
      {/* Transparent toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className={`relative w-10 h-5 rounded-full transition-colors ${
            background.transparent ? 'bg-primary-500' : 'bg-slate-300'
          }`}
          onClick={() => onChange({ ...background, transparent: !background.transparent })}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              background.transparent ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </div>
        <span className="text-sm text-gray-700 font-medium">Transparent background</span>
      </label>

      {!background.transparent && (
        <>
          {/* Color / Gradient header */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {hasGradient ? 'Gradient' : 'Background Color'}
            </label>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...background,
                  gradient: hasGradient
                    ? undefined
                    : {
                        type: 'linear',
                        rotation: 0,
                        colorStops: [
                          { offset: 0, color: background.color },
                          { offset: 1, color: '#f0f4ff' },
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
                value={background.color}
                onChange={e => onChange({ ...background, color: e.target.value })}
                className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={background.color}
                onChange={e => onChange({ ...background, color: e.target.value })}
                className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-400"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={background.gradient?.type}
                  onChange={e => updateGradient({ type: e.target.value as 'linear' | 'radial' })}
                  className="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
                {background.gradient?.type === 'linear' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={360}
                      value={background.gradient?.rotation ?? 0}
                      onChange={e => updateGradient({ rotation: Number(e.target.value) })}
                      className="w-16 px-2 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                    <span className="text-xs text-gray-500">°</span>
                  </div>
                )}
              </div>
              {[0, 1].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={background.gradient?.colorStops[i]?.color ?? '#ffffff'}
                    onChange={e => {
                      const stops = [...(background.gradient?.colorStops ?? [])];
                      stops[i] = { ...stops[i], color: e.target.value };
                      updateGradient({ colorStops: stops });
                    }}
                    className="w-9 h-9 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={background.gradient?.colorStops[i]?.color ?? '#ffffff'}
                    onChange={e => {
                      const stops = [...(background.gradient?.colorStops ?? [])];
                      stops[i] = { ...stops[i], color: e.target.value };
                      updateGradient({ colorStops: stops });
                    }}
                    className="flex-1 px-2 py-2 border-2 border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-primary-400"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Border radius */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Corner Radius
          </label>
          <span className="text-xs text-gray-500 font-mono">{background.borderRadius}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={background.borderRadius}
          onChange={e => onChange({ ...background, borderRadius: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>Sharp</span>
          <span>Rounded</span>
        </div>
      </div>
    </div>
  );
}
