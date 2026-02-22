'use client';

import type { CornerSquareType, GradientConfig, QRCornerSquareConfig } from '@/types/qrTypes';

interface CornerSquaresCustomizerProps {
  cornerSquares: QRCornerSquareConfig;
  onChange: (cfg: QRCornerSquareConfig) => void;
}

const TYPES: { value: CornerSquareType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
];

export default function CornerSquaresCustomizer({
  cornerSquares,
  onChange,
}: CornerSquaresCustomizerProps) {
  const hasGradient = !!cornerSquares.gradient;

  const updateGradient = (partial: Partial<GradientConfig>) => {
    const current = cornerSquares.gradient ?? {
      type: 'linear' as const,
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#4361ee' },
        { offset: 1, color: '#7209b7' },
      ],
    };
    onChange({ ...cornerSquares, gradient: { ...current, ...partial } });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Corner Type
        </label>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ ...cornerSquares, type: t.value })}
              className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all ${
                cornerSquares.type === t.value
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-slate-200 text-gray-600 hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {hasGradient ? 'Gradient' : 'Color'}
          </label>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...cornerSquares,
                gradient: hasGradient
                  ? undefined
                  : {
                      type: 'linear',
                      rotation: 0,
                      colorStops: [
                        { offset: 0, color: cornerSquares.color },
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
              value={cornerSquares.color}
              onChange={e => onChange({ ...cornerSquares, color: e.target.value })}
              className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={cornerSquares.color}
              onChange={e => onChange({ ...cornerSquares, color: e.target.value })}
              className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-400"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={cornerSquares.gradient?.type}
              onChange={e => updateGradient({ type: e.target.value as 'linear' | 'radial' })}
              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
            {[0, 1].map(i => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={cornerSquares.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(cornerSquares.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], color: e.target.value };
                    updateGradient({ colorStops: stops });
                  }}
                  className="w-9 h-9 rounded-lg border-2 border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={cornerSquares.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(cornerSquares.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], color: e.target.value };
                    updateGradient({ colorStops: stops });
                  }}
                  className="flex-1 px-2 py-2 border-2 border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-primary-400"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
