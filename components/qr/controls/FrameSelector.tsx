'use client';

import { FRAME_TEMPLATES } from '@/config/frameTemplates';
import type { QRFrameConfig } from '@/types/qrTypes';
import {
  QR_COLOR_SM,
  QR_INPUT,
  QR_INPUT_SM,
  QR_MUTED,
  QR_OPTION_ACTIVE,
  QR_OPTION_INACTIVE,
} from '@/components/qr/controlStyles';

interface FrameSelectorProps {
  frame: QRFrameConfig;
  onChange: (frame: QRFrameConfig) => void;
}

export default function FrameSelector({ frame, onChange }: FrameSelectorProps) {
  const selected = FRAME_TEMPLATES.find(t => t.id === frame.templateId);

  const selectTemplate = (id: string) => {
    const template = FRAME_TEMPLATES.find(t => t.id === id)!;
    onChange({
      templateId: id,
      title: template.defaultTitle,
      subtitle: template.defaultSubtitle,
      cta: template.defaultCta,
      primaryColor: template.defaultPrimaryColor,
      textColor: template.defaultTextColor,
    });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onChange({ ...frame, templateId: null })}
        className={`w-full py-2 text-sm font-medium rounded-lg border-2 transition-all ${
          !frame.templateId ? QR_OPTION_ACTIVE : QR_OPTION_INACTIVE
        }`}
      >
        No Frame (Plain QR)
      </button>

      <div className="grid grid-cols-2 gap-2">
        {FRAME_TEMPLATES.map(template => (
          <button
            key={template.id}
            type="button"
            onClick={() => selectTemplate(template.id)}
            className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
              frame.templateId === template.id
                ? 'border-primary bg-primary/10'
                : 'border-slate-200 hover:border-slate-350 bg-slate-50'
            }`}
          >
            <span className="text-xl mb-1">{template.emoji}</span>
            <span className="text-xs font-bold text-[#001B50] leading-tight">{template.name}</span>
            <span className={`text-xs ${QR_MUTED} leading-tight mt-0.5`}>{template.description}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-3 pt-2 border-t border-slate-200/80">
          <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide">
            Edit Frame Text
          </h4>
          {[
            { key: 'title', label: 'Title', placeholder: selected.defaultTitle },
            { key: 'subtitle', label: 'Subtitle', placeholder: selected.defaultSubtitle },
            { key: 'cta', label: 'CTA Button', placeholder: selected.defaultCta },
          ].map(field => (
            <div key={field.key}>
              <label className={`block ${QR_MUTED} mb-1`}>{field.label}</label>
              <input
                type="text"
                value={frame[field.key as keyof QRFrameConfig] as string}
                onChange={e => onChange({ ...frame, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className={`w-full ${QR_INPUT}`}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block ${QR_MUTED} mb-1`}>Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={frame.primaryColor}
                  onChange={e => onChange({ ...frame, primaryColor: e.target.value })}
                  className={QR_COLOR_SM}
                />
                <input
                  type="text"
                  value={frame.primaryColor}
                  onChange={e => onChange({ ...frame, primaryColor: e.target.value })}
                  className={QR_INPUT_SM}
                />
              </div>
            </div>
            <div>
              <label className={`block ${QR_MUTED} mb-1`}>Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={frame.textColor}
                  onChange={e => onChange({ ...frame, textColor: e.target.value })}
                  className={QR_COLOR_SM}
                />
                <input
                  type="text"
                  value={frame.textColor}
                  onChange={e => onChange({ ...frame, textColor: e.target.value })}
                  className={QR_INPUT_SM}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
