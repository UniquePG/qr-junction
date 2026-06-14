'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { auth } from '@/lib/firebase';
import { Loader2, Download, ExternalLink, Check, Save, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';
import { getQrUrl } from '@/utils/qrUrl';

interface LandingPageQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: {
    id: number;
    slug: string;
    title: string;
  };
}

export default function LandingPageQRModal({ isOpen, onClose, page }: LandingPageQRModalProps) {
  const [qrCode, setQrCode] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingColors, setSavingColors] = useState(false);

  // Style customization
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const fetchQRDetails = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/qrs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load QR codes list.');
      const data = await res.json();
      
      // Find the QR code linked to this landing page
      const found = (data.qrCodes || []).find((qr: any) => qr.landingPageId === page.id);
      if (found) {
        setQrCode(found);
        setFgColor(found.fgColor || '#000000');
        setBgColor(found.bgColor || '#FFFFFF');
      } else {
        setQrCode(null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Could not check landing page QR details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQRDetails();
    }
  }, [isOpen, page.id]);

  const handleGenerateQR = async () => {
    setGenerating(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/qrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `QR - ${page.title}`,
          type: 'LANDING_PAGE',
          destination: { landingPageId: page.id },
          landingPageId: page.id,
          fgColor: '#000000',
          bgColor: '#FFFFFF'
        })
      });

      if (!res.ok) throw new Error('Failed to create QR code.');
      const data = await res.json();
      
      setQrCode(data.qrCode);
      setFgColor('#000000');
      setBgColor('#FFFFFF');
      toast.success('Landing page QR generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create linked QR code.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveColors = async () => {
    if (!qrCode) return;
    setSavingColors(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/qrs/${qrCode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fgColor,
          bgColor
        })
      });

      if (!res.ok) throw new Error('Failed to save design.');
      toast.success('QR Code colors updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save QR Code colors.');
    } finally {
      setSavingColors(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const svg = document.getElementById(`modal-qr-svg-${qrCode.shortCode}`);
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
    
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${svgBase64}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `page-${page.slug}-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-6 animate-scale-in relative shadow-xl">
        <div className="flex justify-between items-center">
          <div className="min-w-0">
            <h3 className="text-md font-bold text-[#001B50] truncate block" title={page.title}>{page.title}</h3>
            <span className="text-[10px] text-slate-500 font-mono">Linked QR Code</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-750 text-xs bg-slate-55 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-slate-400 text-xs">Checking details...</span>
          </div>
        ) : !qrCode ? (
          <div className="text-center py-6 space-y-4">
            <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1.5 px-2">
              <p className="text-sm font-semibold text-slate-750">No QR Code Generated Yet</p>
              <p className="text-xs text-slate-550 leading-relaxed">Create a linked dynamic QR code to track offline scans, leads, and conversion metrics directly.</p>
            </div>
            <button
              onClick={handleGenerateQR}
              disabled={generating}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-primary disabled:opacity-60 flex items-center justify-center gap-2 border-none"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Generate QR Code</span>}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SVG element used for downloading */}
            <div className="hidden">
              <QRCodeSVG
                id={`modal-qr-svg-${qrCode.shortCode}`}
                value={getQrUrl(qrCode.shortCode)}
                size={500}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
              />
            </div>

            {/* QR Card Container */}
            <div className="bg-white p-6 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner max-w-[220px] mx-auto">
              <QRCodeSVG
                value={getQrUrl(qrCode.shortCode)}
                size={160}
                fgColor={fgColor}
                bgColor={bgColor}
                level="M"
              />
            </div>

            {/* Color Settings */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Foreground</label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="font-mono text-[9px] text-slate-600 uppercase">{fgColor}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Background</label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="font-mono text-[9px] text-slate-600 uppercase">{bgColor}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveColors}
                disabled={savingColors}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border-none disabled:opacity-60"
                title="Save Design Options"
              >
                {savingColors ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Colors</span>
              </button>

              <button
                onClick={downloadQR}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer shadow-primary border-none"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Shortcode:</span>
              <span className="text-slate-800 font-semibold">/q/{qrCode.shortCode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
