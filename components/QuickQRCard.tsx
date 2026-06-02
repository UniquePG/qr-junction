'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Link2, ArrowRight, Sparkles, Download } from 'lucide-react';
import { toast } from 'react-toastify';

export default function QuickQRCard() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [copied, setCopied] = useState(false);

  const handleQuickGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a website link first.');
      return;
    }
    
    // Auto-prepend http if missing
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    
    setQrValue(targetUrl);
    toast.success('QR Code generated instantly!');
  };

  const handleCustomizeRedirect = () => {
    if (url.trim()) {
      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }
      router.push(`/qr?url=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push('/qr');
    }
  };

  const downloadSVG = () => {
    const svg = document.getElementById('quick-qr-svg');
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
    
    const downloadLink = document.createElement('a');
    downloadLink.href = `data:image/svg+xml;base64,${svgBase64}`;
    downloadLink.download = 'qr-junction-quick.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success('SVG file downloaded!');
  };

  return (
    <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden group">
      {/* Background glowing blob inside card */}
      <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] rounded-full bg-primary/10 blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all duration-300" />
      
      <div className="flex items-center gap-2 border-b border-slate-850 pb-4">
        <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Instant Generator</h3>
      </div>

      <form onSubmit={handleQuickGenerate} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Destination Link</label>
          <div className="relative">
            <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550" />
            <input
              type="text"
              placeholder="e.g. google.com, yourname.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-850 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-primary flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
        >
          <span>Generate Quick QR</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Render QR Preview Container */}
      <div className="flex flex-col items-center justify-center min-h-[160px] border border-slate-850 rounded-2xl bg-slate-950/40 p-4">
        {qrValue ? (
          <div className="space-y-4 text-center animate-fade-in">
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg border border-slate-800/10">
              <QRCodeSVG
                id="quick-qr-svg"
                value={qrValue}
                size={120}
                fgColor="#0b0f19"
                bgColor="#ffffff"
                level="L"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSVG}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download SVG</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4 space-y-2 text-slate-550 select-none">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center mx-auto text-slate-655 font-bold text-sm">
              ?
            </div>
            <p className="text-xs">Your dynamic QR code preview will appear here.</p>
          </div>
        )}
      </div>

      {/* Link to advanced customization canvas */}
      <button
        onClick={handleCustomizeRedirect}
        className="w-full text-center text-xs text-secondary hover:text-secondary/85 hover:underline font-semibold block transition-colors cursor-pointer bg-transparent border-none outline-none mt-2"
      >
        Customize Design &amp; Add Frames →
      </button>
    </div>
  );
}
