'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Download, Save, Upload, X, Check, Trash2, Sparkles, Palette, Layout, QrCode, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { qrService, uploadService } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { getQrUrl } from '@/utils/qrUrl';
import CustomizableQRCode from './CustomizableQRCode';

interface QRDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: {
    id: number;
    shortCode: string;
    name: string;
    fgColor?: string | null;
    bgColor?: string | null;
    logoUrl?: string | null;
    customDesign?: any | null;
  };
  onSave: (updatedQrCode: any) => void;
}

const FRAME_PRESETS = [
  { id: 'no_frame', name: 'Standard QR (No Frame)', desc: 'Clean, simple square QR code.' },
  { id: 'classic_frame', name: 'Classic Card Frame', desc: 'Elegant card outline with custom footer text.' },
  { id: 'wood_plate', name: 'Restaurant Wooden Tray', desc: 'Decorated round plate outline with fork & spoon.' },
  { id: 'coffee_cup', name: 'Bistro Coffee Cup', desc: 'Warm coffee cup outline with steam effects.' },
  { id: 'chef_hat', name: 'Chef Special Recommendation', desc: 'Capped with a chef hat and crossed utensils.' },
  { id: 'love_food', name: 'Love Food Heart Frame', desc: 'Dotted heart outline with cutlery accents.' },
  { id: 'fresh_leaf', name: 'Organic Fresh Salad Leaf', desc: 'Citrus slice & green leaf frames for fresh menus.' },
];

const LOGO_PRESETS = [
  { id: 'none', name: 'No Logo' },
  { id: 'brand', name: 'Default Brand Grid' },
  { id: 'wifi', name: 'Wi-Fi Broadcast' },
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'star', name: 'Feedback Star' },
  { id: 'coffee', name: 'Coffee Cup' },
  { id: 'fork_knife', name: 'Fork & Knife' },
  { id: 'chef_hat', name: 'Chef Hat' },
];

const COLOR_PRESETS = [
  '#000000', // Deep Black
  '#001B50', // Brand Dark Blue
  '#1E293B', // Slate
  '#DC2626', // Crimson Red
  '#D97706', // Amber Yellow
  '#059669', // Emerald Green
  '#2563EB', // Sapphire Blue
  '#7C3AED', // Royal Violet
  '#DB2777', // Rose Pink
  '#B45309', // Warm Brown
];

export default function QRDesignModal({ isOpen, onClose, qrCode, onSave }: QRDesignModalProps) {
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Custom design states
  const [frameId, setFrameId] = useState('no_frame');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#001b50');
  const [frameTextColor, setFrameTextColor] = useState('#FFFFFF');
  const [logoPreset, setLogoPreset] = useState<'none' | 'brand' | 'wifi' | 'google' | 'facebook' | 'instagram' | 'star' | 'coffee' | 'fork_knife' | 'chef_hat'>('none');

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize values when qrCode changes
  useEffect(() => {
    if (qrCode) {
      setFgColor(qrCode.fgColor || '#000000');
      setBgColor(qrCode.bgColor || '#FFFFFF');
      setLogoUrl(qrCode.logoUrl || null);
      
      const design = qrCode.customDesign || {};
      setFrameId(design.frameId || 'no_frame');
      setFrameText(design.frameText || 'SCAN ME');
      setFrameColor(design.frameColor || '#001b50');
      setFrameTextColor(design.frameTextColor || '#FFFFFF');
      setLogoPreset(design.logoPreset || 'none');
    }
  }, [qrCode, isOpen]);

  useEffect(() => {
    if (isOpen) setPreviewOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving && !uploadingLogo) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, saving, uploadingLogo, onClose]);

  if (!isOpen || !qrCode) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('Please upload an image smaller than 1MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await uploadService.file(uploadData);

      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      
      setLogoUrl(result.url);
      setLogoPreset('none'); // Clear preset if custom logo uploaded
      toast.success('Logo uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Logo upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('You must be logged in to save design changes.');
        setSaving(false);
        return;
      }

      const customDesignPayload = {
        frameId,
        frameText,
        frameColor,
        frameTextColor,
        logoPreset,
      };

      const res = await qrService.update(qrCode.id, {
        fgColor,
        bgColor,
        logoUrl,
        customDesign: customDesignPayload,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to save QR code design.');
      }

      const responseData = await res.json();
      toast.success('QR Code customizations saved successfully!');
      
      onSave(responseData.qrCode);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Could not save QR design customizations.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const svgElement = document.getElementById(`custom-qr-preview-svg`);
    if (!svgElement) {
      toast.error('Failed to locate QR code element.');
      return;
    }

    try {
      const svgXml = new XMLSerializer().serializeToString(svgElement);
      // Escape special characters to work safely with btoa
      const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
      
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${svgBase64}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Render larger for higher resolution downloads
        if (frameId === 'no_frame') {
          canvas.width = 1000;
          canvas.height = 1000;
        } else {
          canvas.width = 1050; // Aspect ratio 350:420 -> width 1050, height 1260
          canvas.height = 1260;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `custom-qr-${qrCode.shortCode}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success('High-resolution QR Code downloaded!');
        }
      };
    } catch (err) {
      console.error(err);
      toast.error('Failed to download custom QR Code.');
    }
  };

  const closeCustomizer = () => {
    if (saving || uploadingLogo) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="qr-customizer-title">
      <button
        type="button"
        aria-label="Close customizer"
        className="absolute inset-0 cursor-pointer border-none bg-[#1C1410]/40"
        onClick={closeCustomizer}
      />
      <aside className="absolute inset-y-0 right-0 flex h-full w-full max-w-[960px] flex-col bg-white shadow-2xl">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">QR design</p>
            <h2 id="qr-customizer-title" className="truncate text-base font-bold text-[#001B50] sm:text-lg">Customize QR code</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={closeCustomizer}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
          <button
            type="button"
            aria-expanded={previewOpen}
            onClick={() => setPreviewOpen((open) => !open)}
            className="flex h-12 w-full shrink-0 cursor-pointer items-center justify-between border-b border-slate-200 bg-slate-50 px-4 text-left lg:hidden"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#001B50]">
              <Sparkles className="h-4 w-4 text-primary" />
              Live preview
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${previewOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`${previewOpen ? 'block' : 'hidden'} max-h-[52dvh] shrink-0 overflow-y-auto border-b border-slate-200 bg-slate-50 px-4 py-4 lg:block lg:max-h-none lg:w-[300px] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6`}>
            <div className="text-center">
              <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary lg:inline-flex">
                <Sparkles className="h-3 w-3" /> Live preview
              </span>
              <p className="truncate text-sm font-semibold text-slate-800 lg:mt-2">{qrCode.name}</p>
            </div>
            <div className={`mx-auto mt-4 flex w-full max-w-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:max-w-[220px] lg:p-4 ${frameId === 'no_frame' ? 'aspect-square' : 'aspect-[350/420]'}`}>
              <CustomizableQRCode
                id="custom-qr-preview-svg"
                value={getQrUrl(qrCode.shortCode)}
                fgColor={fgColor}
                bgColor={bgColor}
                logoUrl={logoUrl}
                logoPreset={logoPreset}
                frameId={frameId}
                frameText={frameText}
                frameColor={frameColor}
                frameTextColor={frameTextColor}
                size={180}
              />
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Opens <span className="font-semibold text-slate-600">/q/{qrCode.shortCode}</span>
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            <div className="space-y-8">
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <Layout className="h-4 w-4 text-primary" /> Frame
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {FRAME_PRESETS.map((frame) => {
                    const selected = frameId === frame.id;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          setFrameId(frame.id);
                          if (frame.id !== 'no_frame' && frameText === 'SCAN ME') {
                            setFrameText('SCAN MENU');
                          }
                        }}
                        className={`flex min-h-[4.5rem] cursor-pointer items-start gap-2 rounded-xl border px-3 py-3 text-left ${
                          selected ? 'border-primary bg-primary/[0.04] ring-1 ring-primary' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug text-slate-800">{frame.name}</span>
                          <span className="mt-1 block text-xs leading-snug text-slate-500">{frame.desc}</span>
                        </span>
                        {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : null}
                      </button>
                    );
                  })}
                </div>
              </section>

              {frameId !== 'no_frame' ? (
                <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Frame text and colors</h3>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Banner text</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="e.g. SCAN MENU"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className="text-sm font-semibold text-slate-700">Frame</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[11px] uppercase text-slate-500">{frameColor}</span>
                        <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0" />
                      </span>
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className="text-sm font-semibold text-slate-700">Text</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[11px] uppercase text-slate-500">{frameTextColor}</span>
                        <input type="color" value={frameTextColor} onChange={(e) => setFrameTextColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0" />
                      </span>
                    </label>
                  </div>
                </section>
              ) : null}

              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <Palette className="h-4 w-4 text-primary" /> Colors
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Dots</p>
                        <p className="mt-0.5 font-mono text-[11px] uppercase text-slate-500">{fgColor}</p>
                      </div>
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0" />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Dark colors scan more reliably.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={`fg-${color}`}
                          type="button"
                          aria-label={`Dot color ${color}`}
                          onClick={() => setFgColor(color)}
                          className={`h-7 w-7 cursor-pointer rounded-full border ${fgColor.toLowerCase() === color.toLowerCase() ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-1' : 'border-slate-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Background</p>
                        <p className="mt-0.5 font-mono text-[11px] uppercase text-slate-500">{bgColor}</p>
                      </div>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0" />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">A light background keeps the code readable.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['#FFFFFF', '#F8FAFC', '#FFFBEB', '#F0FDF4', '#EFF6FF'].map((color) => (
                        <button
                          key={`bg-${color}`}
                          type="button"
                          aria-label={`Background ${color}`}
                          onClick={() => setBgColor(color)}
                          className={`h-7 w-7 cursor-pointer rounded-full border ${bgColor.toLowerCase() === color.toLowerCase() ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-1' : 'border-slate-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <QrCode className="h-4 w-4 text-primary" /> Center logo
                </h3>
                {logoUrl ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                    <img src={logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-emerald-800">Custom logo</p>
                      <p className="text-xs text-emerald-700">Shown in the center of the code.</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove logo"
                      onClick={handleRemoveLogo}
                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border-none bg-white text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      className="hidden"
                      id="qr-logo-upload"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                    <label
                      htmlFor="qr-logo-upload"
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${uploadingLogo ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingLogo ? 'Uploading…' : 'Upload logo · PNG or JPEG, max 1MB'}
                    </label>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {LOGO_PRESETS.map((preset) => {
                    const selected = logoPreset === preset.id && !logoUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setLogoPreset(preset.id as typeof logoPreset);
                          setLogoUrl(null);
                        }}
                        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-left text-sm font-semibold ${
                          selected ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={closeCustomizer}
              disabled={saving}
              className="h-11 cursor-pointer rounded-xl border-none bg-slate-100 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingLogo}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-primary text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
