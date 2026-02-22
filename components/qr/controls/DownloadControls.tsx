'use client';

import type { QRPreviewHandle } from '@/components/qr/QRPreview';
import type { DownloadFormat, DownloadScale, QRDownloadConfig } from '@/types/qrTypes';
import type { RefObject } from 'react';

interface DownloadControlsProps {
  config: QRDownloadConfig;
  onChange: (cfg: QRDownloadConfig) => void;
  qrRef: RefObject<QRPreviewHandle | null>;
  hasQRValue: boolean;
  /** When provided, called on download click (enables frame-aware download) */
  onDownload?: () => void | Promise<void>;
}

const FORMATS: { value: DownloadFormat; label: string; icon: string }[] = [
  { value: 'png', label: 'PNG', icon: '🖼️' },
  { value: 'svg', label: 'SVG', icon: '✏️' },
  { value: 'jpeg', label: 'JPEG', icon: '📸' },
  { value: 'webp', label: 'WebP', icon: '🌐' },
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
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
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
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-slate-200 text-gray-600 hover:border-slate-300'
              }`}
            >
              <span className="text-base mb-0.5">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
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
              <span className="text-sm text-gray-700">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* File name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          File Name
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={config.fileName}
            onChange={e => onChange({ ...config, fileName: e.target.value })}
            placeholder="qrcode"
            className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
          />
          <span className="text-sm text-gray-400">.{config.format}</span>
        </div>
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!hasQRValue}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
          hasQRValue
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:-translate-y-0.5 hover:shadow-md'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download {config.fileName || 'qrcode'}.{config.format}
      </button>
    </div>
  );
}
