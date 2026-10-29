'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Download, Save, Upload, X, Check, Trash2, Sparkles, Palette, Layout, QrCode } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {/* Universal Container */}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden animate-scale-in relative shadow-2xl">
        
        {/* Left Side: Live Preview Panel */}
        <div className="md:w-5/12 bg-slate-50 border-r border-slate-100 flex flex-col items-center justify-between p-6 md:p-8 shrink-0">
          
          {/* Top Info */}
          <div className="w-full text-center space-y-1 mb-4 md:mb-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3" /> Live Design Preview
            </span>
            <h4 className="text-sm font-bold text-slate-800 truncate px-2">{qrCode.name}</h4>
          </div>

          {/* QR Render Window */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-center w-[230px] h-[230px] md:w-[260px] md:h-[260px]">
            <div className="w-full h-full flex items-center justify-center">
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
          </div>

          {/* Bottom Actions */}
          <div className="w-full space-y-3 mt-4 md:mt-0">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Download High-Res PNG
            </button>
            <div className="text-[10px] text-center text-slate-400 font-mono">
              Redirects to: <span className="font-semibold text-slate-600">/q/{qrCode.shortCode}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Options Scroll Pane */}
        <div className="md:w-7/12 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#001B50]">QR Code Customizer</h3>
              <p className="text-xs text-slate-500">Tailor styling, colors, logo overlay, and themed frames.</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 cursor-pointer border border-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Tabs */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white">
            
            {/* 1. Select Theme Frame */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" /> 1. Frame Style
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FRAME_PRESETS.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => {
                      setFrameId(frame.id);
                      if (frame.id !== 'no_frame' && frameText === 'SCAN ME') {
                        setFrameText('SCAN MENU');
                      }
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      frameId === frame.id
                        ? 'border-primary bg-primary/[0.03] ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-850 flex items-center justify-between w-full">
                      {frame.name}
                      {frameId === frame.id && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-snug line-clamp-2 mt-1">{frame.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* If frame is selected, show Frame Text & Color Settings */}
            {frameId !== 'no_frame' && (
              <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-1">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Frame Text & Colors
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-650">Frame Text Banner</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="e.g. SCAN MENU"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-650 block">Frame Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="font-mono text-xs text-slate-600 uppercase">{frameColor}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-650 block">Text Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={frameTextColor}
                          onChange={(e) => setFrameTextColor(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="font-mono text-xs text-slate-600 uppercase">{frameTextColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. QR Code Colors */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> 2. QR Colors
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-650 block">Foreground (Dots)</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0 bg-transparent"
                    />
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs text-slate-800 uppercase font-bold">{fgColor}</span>
                      <p className="text-[10px] text-slate-400">Dark colors recommended</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={`fg-${c}`}
                        type="button"
                        onClick={() => setFgColor(c)}
                        className="w-5 h-5 rounded-full border border-slate-300 cursor-pointer transition-transform hover:scale-110 shrink-0"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-650 block">Background</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0 bg-transparent"
                    />
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs text-slate-800 uppercase font-bold">{bgColor}</span>
                      <p className="text-[10px] text-slate-400">Light background works best</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['#FFFFFF', '#F8FAFC', '#FFFBEB', '#F0FDF4', '#EFF6FF'].map((c) => (
                      <button
                        key={`bg-${c}`}
                        type="button"
                        onClick={() => setBgColor(c)}
                        className="w-5 h-5 rounded-full border border-slate-300 cursor-pointer transition-transform hover:scale-110 shrink-0"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Logo Overlay */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary" /> 3. Central Brand Logo
              </h4>

              <div className="space-y-5">
                
                {/* Upload Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-650">Upload Custom Logo</label>
                  {logoUrl ? (
                    <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-1" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-emerald-800 truncate">Custom logo loaded</p>
                        <p className="text-[10px] text-emerald-600">Displays in the center of the QR</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-xl transition-colors cursor-pointer border border-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-center">
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
                        className={`flex-1 flex flex-col items-center justify-center py-5 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors ${
                          uploadingLogo ? 'border-slate-300 opacity-60' : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {uploadingLogo ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin mb-1" />
                        ) : (
                          <Upload className="w-5 h-5 text-slate-450 mb-1" />
                        )}
                        <span className="text-xs font-semibold text-slate-700">
                          {uploadingLogo ? 'Uploading logo image...' : 'Choose PNG/JPEG (Max 1MB)'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Preset Options */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-650">Or Select a Quick Preset Icon</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LOGO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setLogoPreset(preset.id as any);
                          setLogoUrl(null); // Clear custom upload if choosing preset
                        }}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          logoPreset === preset.id && !logoUrl
                            ? 'border-primary bg-primary/5 text-primary font-bold'
                            : 'border-slate-250 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="p-6 md:p-8 border-t border-slate-100 flex gap-4 bg-white shrink-0">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploadingLogo}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold transition-all shadow-primary border-none disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Customizations</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
