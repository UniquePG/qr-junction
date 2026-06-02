'use client';

import type { QRPreviewHandle } from '@/components/qr/QRPreview';
import type { DownloadFormat, DownloadScale, QRDownloadConfig } from '@/types/qrTypes';
import type { RefObject } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Camera, Download, Globe, Image as ImageIcon, Pencil } from 'lucide-react';

interface DownloadControlsProps {
  config: QRDownloadConfig;
  onChange: (cfg: QRDownloadConfig) => void;
  qrRef: RefObject<QRPreviewHandle | null>;
  hasQRValue: boolean;
  /** When provided, called on download click (enables frame-aware download) */
  onDownload?: () => void | Promise<void>;
}

const FORMATS: { value: DownloadFormat; label: string; Icon: LucideIcon }[] = [
  { value: 'png', label: 'PNG', Icon: ImageIcon },
  { value: 'svg', label: 'SVG', Icon: Pencil },
  { value: 'jpeg', label: 'JPEG', Icon: Camera },
  { value: 'webp', label: 'WebP', Icon: Globe },
];

const SCALES: { value: DownloadScale; label: string }[] = [
  { value: 1, label: '1× Standard' },
  { value: 2, label: '2× High-res' },
  { value: 3, label: '3× Ultra' },
];

export default function DownloadControls({
  config,
  onChange,
  qrRef,
  hasQRValue,
  onDownload,
}: DownloadControlsProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (qrRef.current) {
      qrRef.current.download(config.format, config.fileName || 'qrcode');
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Format */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
          Format
        </label>
        <div className="grid grid-cols-4 gap-2">
          {FORMATS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => onChange({ ...config, format: f.value })}
              className={`flex flex-col items-center py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                config.format === f.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <f.Icon className="w-4 h-4 mb-0.5" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
          Resolution Scale
        </label>
        <div className="flex flex-col gap-2">
          {SCALES.map(s => (
            <label key={s.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="scale"
                value={s.value}
                checked={config.scale === s.value}
                onChange={() => onChange({ ...config, scale: s.value })}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-slate-300">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* File name */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
          File Name
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={config.fileName}
            onChange={e => onChange({ ...config, fileName: e.target.value })}
            placeholder="qrcode"
            className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <span className="text-sm text-slate-500">.{config.format}</span>
        </div>
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!hasQRValue}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
          hasQRValue
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-0.5 hover:shadow-md'
            : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
        }`}
      >
        <Download className="w-4 h-4" />
        Download {config.fileName || 'qrcode'}.{config.format}
      </button>
    </div>
  );
}
