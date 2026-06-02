'use client';

import type { CornerDotType, GradientConfig, QRCornerDotConfig } from '@/types/qrTypes';
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

interface CornerDotsCustomizerProps {
  cornerDots: QRCornerDotConfig;
  onChange: (cfg: QRCornerDotConfig) => void;
}

const TYPES: { value: CornerDotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

export default function CornerDotsCustomizer({
  cornerDots,
  onChange,
}: CornerDotsCustomizerProps) {
  const hasGradient = !!cornerDots.gradient;

  const updateGradient = (partial: Partial<GradientConfig>) => {
    const current = cornerDots.gradient ?? {
      type: 'linear' as const,
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#4361ee' },
        { offset: 1, color: '#7209b7' },
      ],
    };
    onChange({ ...cornerDots, gradient: { ...current, ...partial } });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={QR_LABEL}>Inner Dot Style</label>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ ...cornerDots, type: t.value })}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all ${
                cornerDots.type === t.value ? QR_OPTION_ACTIVE : QR_OPTION_INACTIVE
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
                ...cornerDots,
                gradient: hasGradient
                  ? undefined
                  : {
                      type: 'linear',
                      rotation: 0,
                      colorStops: [
                        { offset: 0, color: cornerDots.color },
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
              value={cornerDots.color}
              onChange={e => onChange({ ...cornerDots, color: e.target.value })}
              className={QR_COLOR}
            />
            <input
              type="text"
              value={cornerDots.color}
              onChange={e => onChange({ ...cornerDots, color: e.target.value })}
              className={QR_INPUT}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={cornerDots.gradient?.type}
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
                  value={cornerDots.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(cornerDots.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], color: e.target.value };
                    updateGradient({ colorStops: stops });
                  }}
                  className={QR_COLOR_SM}
                />
                <input
                  type="text"
                  value={cornerDots.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(cornerDots.gradient?.colorStops ?? [])];
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
