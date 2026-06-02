'use client';

import type { QRLogoConfig } from '@/types/qrTypes';
import { useRef, useState } from 'react';
import { AlertTriangle, ImagePlus } from 'lucide-react';
import { QR_HINT, QR_LABEL_INLINE, QR_MUTED } from '@/components/qr/controlStyles';

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
      onEclLocked(true);
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
      {!previewUrl ? (
        <div
          className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">Click to upload logo</p>
          <p className={`${QR_HINT} mt-1`}>PNG, JPG, SVG supported</p>
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
          <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Logo preview"
              className="w-14 h-14 object-contain rounded-lg border border-slate-700 bg-slate-900 p-1"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">Logo Applied</p>
              <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Error correction auto-set to H
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-400 hover:text-red-300 text-sm font-semibold px-3 py-1 rounded-lg border border-red-900/50 hover:border-red-700/60 bg-red-950/20 transition-all"
            >
              Remove
            </button>
          </div>

          {isLoading && <p className={`text-sm text-center ${QR_MUTED}`}>Processing…</p>}

          <div>
            <div className="flex justify-between mb-1">
              <label className={QR_LABEL_INLINE}>Logo Size</label>
              <span className={`${QR_MUTED} font-mono`}>
                {Math.round((logo?.size ?? 0.2) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              step={1}
              value={Math.round((logo?.size ?? 0.2) * 100)}
              onChange={e => onChange({ ...logo!, size: Number(e.target.value) / 100 })}
              className="w-full accent-primary"
            />
            <div className={`flex justify-between ${QR_HINT} mt-0.5`}>
              <span>10%</span>
              <span className="text-amber-500">max 40%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className={QR_LABEL_INLINE}>Margin</label>
              <span className={`${QR_MUTED} font-mono`}>{logo?.margin ?? 5}px</span>
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

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                logo?.hideBackgroundDots ? 'bg-primary' : 'bg-slate-700'
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
            <span className="text-sm text-slate-300">Hide dots behind logo</span>
          </label>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-sm text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/10 transition-all"
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
