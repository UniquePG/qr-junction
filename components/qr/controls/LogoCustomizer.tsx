'use client';

import type { QRLogoConfig } from '@/types/qrTypes';
import { useRef, useState } from 'react';

interface LogoCustomizerProps {
  logo: QRLogoConfig | null;
  onChange: (logo: QRLogoConfig | null) => void;
  onEclLocked: (locked: boolean) => void;
}

export default function LogoCustomizer({ logo, onChange, onEclLocked }: LogoCustomizerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(logo?.src ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, or SVG file.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      onChange({
        src: base64,
        size: logo?.size ?? 0.2,
        margin: logo?.margin ?? 5,
        hideBackgroundDots: logo?.hideBackgroundDots ?? true,
        crossOrigin: 'anonymous',
      });
      onEclLocked(true); // Force H
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onChange(null);
    onEclLocked(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ACCEPTED = '.png,.jpg,.jpeg,.svg';

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {!previewUrl ? (
        <div
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-3xl mb-2">🖼️</div>
          <p className="text-sm font-medium text-gray-600">Click to upload logo</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Logo preview"
              className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">Logo Applied</p>
              <p className="text-xs text-amber-600 mt-0.5">
                ⚠️ Error correction auto-set to H
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 text-sm font-semibold px-3 py-1 rounded-lg border-2 border-red-200 hover:border-red-400 transition-all"
            >
              Remove
            </button>
          </div>

          {isLoading && <p className="text-sm text-center text-gray-500">Processing…</p>}

          {/* Size slider */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Logo Size
              </label>
              <span className="text-xs text-gray-500 font-mono">
                {Math.round((logo?.size ?? 0.2) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              step={1}
              value={Math.round((logo?.size ?? 0.2) * 100)}
              onChange={e =>
                onChange({ ...logo!, size: Number(e.target.value) / 100 })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>10%</span>
              <span className="text-amber-500">max 40%</span>
            </div>
          </div>

          {/* Margin slider */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Margin
              </label>
              <span className="text-xs text-gray-500 font-mono">{logo?.margin ?? 5}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={logo?.margin ?? 5}
              onChange={e => onChange({ ...logo!, margin: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          {/* Hide background dots toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                logo?.hideBackgroundDots ? 'bg-primary-500' : 'bg-slate-300'
              }`}
              onClick={() =>
                onChange({ ...logo!, hideBackgroundDots: !logo?.hideBackgroundDots })
              }
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  logo?.hideBackgroundDots ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">Hide dots behind logo</span>
          </label>

          {/* Change file */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-sm text-primary-600 border-2 border-primary-200 rounded-lg py-2 hover:bg-primary-50 transition-all"
          >
            Change Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
