'use client';

import type { CornerSquareType, GradientConfig, QRCornerSquareConfig } from '@/types/qrTypes';
import {
  QR_COLOR,
  QR_COLOR_SM,
  QR_GRADIENT_TOGGLE_ACTIVE,
  QR_GRADIENT_TOGGLE_INACTIVE,
  QR_INPUT,
  QR_INPUT_SM,
  QR_LABEL,
  QR_LABEL_INLINE,
  QR_OPTION_ACTIVE,
  QR_OPTION_INACTIVE,
  QR_SELECT,
} from '@/components/qr/controlStyles';

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
        <label className={QR_LABEL}>Corner Type</label>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ ...cornerSquares, type: t.value })}
              className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all ${
                cornerSquares.type === t.value ? QR_OPTION_ACTIVE : QR_OPTION_INACTIVE
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={QR_LABEL_INLINE}>
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
              hasGradient ? QR_GRADIENT_TOGGLE_ACTIVE : QR_GRADIENT_TOGGLE_INACTIVE
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
              className={QR_COLOR}
            />
            <input
              type="text"
              value={cornerSquares.color}
              onChange={e => onChange({ ...cornerSquares, color: e.target.value })}
              className={QR_INPUT}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={cornerSquares.gradient?.type}
              onChange={e => updateGradient({ type: e.target.value as 'linear' | 'radial' })}
              className={`w-full ${QR_SELECT}`}
            >
              <option value="linear" className="bg-slate-950">Linear</option>
              <option value="radial" className="bg-slate-950">Radial</option>
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
                  className={QR_COLOR_SM}
                />
                <input
                  type="text"
                  value={cornerSquares.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(cornerSquares.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], color: e.target.value };
                    updateGradient({ colorStops: stops });
                  }}
                  className={QR_INPUT_SM}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
