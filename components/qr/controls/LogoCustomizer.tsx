'use client';

import type { QRLogoConfig } from '@/types/qrTypes';
import { useRef, useState } from 'react';
import { AlertTriangle, ImagePlus, Upload } from 'lucide-react';
import { QR_HINT, QR_LABEL_INLINE, QR_MUTED } from '@/components/qr/controlStyles';

interface LogoCustomizerProps {
  logo: QRLogoConfig | null;
  onChange: (logo: QRLogoConfig | null) => void;
  onEclLocked: (locked: boolean) => void;
}

const PREDEFINED_LOGOS = [
  { id: 'tiktok', name: 'TikTok', url: 'https://cdn.simpleicons.org/tiktok/000000' },
  { id: 'youtube', name: 'YouTube', url: 'https://cdn.simpleicons.org/youtube/FF0000' },
  { id: 'facebook', name: 'Facebook', url: 'https://cdn.simpleicons.org/facebook/1877F2' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://api.iconify.design/bi:linkedin.svg?color=%230A66C2' },
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://cdn.simpleicons.org/whatsapp/25D366' },
  { id: 'instagram', name: 'Instagram', url: 'https://cdn.simpleicons.org/instagram/E4405F' },
  { id: 'pinterest', name: 'Pinterest', url: 'https://cdn.simpleicons.org/pinterest/E60023' },
  { id: 'twitter', name: 'Twitter', url: 'https://api.iconify.design/bi:twitter.svg?color=%231DA1F2' },
  { id: 'x', name: 'X', url: 'https://cdn.simpleicons.org/x/000000' },
  { id: 'snapchat', name: 'Snapchat', url: 'https://cdn.simpleicons.org/snapchat/FFFC00' },
  { id: 'gmail', name: 'Gmail', url: 'https://cdn.simpleicons.org/gmail/EA4335' },
  { id: 'phone', name: 'Phone', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>' },
  { id: 'wechat', name: 'WeChat', url: 'https://cdn.simpleicons.org/wechat/07C160' },
];

export default function LogoCustomizer({ logo, onChange, onEclLocked }: LogoCustomizerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(logo?.src ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, or SVG file.');
      return;
    }

    setIsLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Upload failed');

      setPreviewUrl(json.url);
      onChange({
        src: json.url,
        size: logo?.size ?? 0.2,
        margin: logo?.margin ?? 5,
        hideBackgroundDots: logo?.hideBackgroundDots ?? true,
        crossOrigin: 'anonymous',
      });
      onEclLocked(true);
    } catch (err) {
      console.error('Logo upload error:', err);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onChange(null);
    onEclLocked(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredefinedClick = (url: string) => {
    setPreviewUrl(url);
    onChange({
      src: url,
      size: logo?.size ?? 0.2,
      margin: logo?.margin ?? 5,
      hideBackgroundDots: logo?.hideBackgroundDots ?? true,
      crossOrigin: 'anonymous',
    });
    onEclLocked(true);
  };

  const ACCEPTED = '.png,.jpg,.jpeg,.svg';

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">
              Select Logo
            </label>
            <div className="flex flex-wrap gap-3 items-center">
              {PREDEFINED_LOGOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePredefinedClick(item.url)}
                  className="w-[52px] h-[52px] rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:border-primary hover:shadow-md transition-all p-2.5 group"
                  title={item.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    crossOrigin="anonymous"
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-[52px] px-5 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all text-slate-600 text-sm font-semibold whitespace-nowrap ml-1"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </button>
            </div>
          </div>
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
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Logo preview"
              className="w-14 h-14 object-contain rounded-lg border border-slate-250 bg-white p-1"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#001B50]">Logo Applied</p>
              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Error correction auto-set to H
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-650 hover:text-red-700 text-sm font-semibold px-3 py-1 rounded-lg border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100/60 transition-all"
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
                logo?.hideBackgroundDots ? 'bg-primary' : 'bg-slate-300'
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
            <span className="text-sm text-slate-650 font-medium">Hide dots behind logo</span>
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
