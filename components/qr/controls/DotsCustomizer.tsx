'use client';

import type { DotType, GradientConfig, QRDotsConfig } from '@/types/qrTypes';
import {
  QR_COLOR,
  QR_COLOR_SM,
  QR_GRADIENT_TOGGLE_ACTIVE,
  QR_GRADIENT_TOGGLE_INACTIVE,
  QR_HINT,
  QR_INPUT,
  QR_INPUT_SM,
  QR_LABEL,
  QR_LABEL_INLINE,
  QR_MUTED,
  QR_OPTION_ACTIVE,
  QR_OPTION_INACTIVE,
  QR_SELECT,
} from '@/components/qr/controlStyles';

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
      <div>
        <label className={QR_LABEL}>Dot Style</label>
        <div className="grid grid-cols-3 gap-2">
          {DOT_STYLES.map(style => (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange({ ...dots, type: style.value })}
              className={`flex flex-col items-center py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all ${
                dots.type === style.value ? QR_OPTION_ACTIVE : QR_OPTION_INACTIVE
              }`}
            >
              <span className="text-lg leading-none mb-1 text-slate-500">{style.preview}</span>
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={QR_LABEL_INLINE}>
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
              value={dots.color}
              onChange={e => onChange({ ...dots, color: e.target.value })}
              className={QR_COLOR}
            />
            <input
              type="text"
              value={dots.color}
              onChange={e => onChange({ ...dots, color: e.target.value })}
              className={QR_INPUT}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={dots.gradient?.type}
                onChange={e => updateGradient({ type: e.target.value as 'linear' | 'radial' })}
                className={QR_SELECT}
              >
                <option value="linear" className="bg-white text-slate-800">Linear</option>
                <option value="radial" className="bg-white text-slate-800">Radial</option>
              </select>
              {dots.gradient?.type === 'linear' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={dots.gradient?.rotation ?? 0}
                    onChange={e => updateGradient({ rotation: Number(e.target.value) })}
                    className={`w-16 ${QR_INPUT_SM}`}
                  />
                  <span className={QR_MUTED}>°</span>
                </div>
              )}
            </div>

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
                  className={QR_COLOR_SM}
                />
                <input
                  type="text"
                  value={dots.gradient?.colorStops[i]?.color ?? '#000000'}
                  onChange={e => {
                    const stops = [...(dots.gradient?.colorStops ?? [])];
                    stops[i] = { ...stops[i], color: e.target.value };
                    updateGradient({ colorStops: stops });
                  }}
                  className={QR_INPUT_SM}
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
                <span className={`${QR_HINT} w-7`}>
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
