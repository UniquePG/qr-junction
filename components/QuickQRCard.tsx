"use client";

import { ArrowRight, Download, Link2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function QuickQRCard() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [copied, setCopied] = useState(false);

  const handleQuickGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a website link first.");
      return;
    }

    // Auto-prepend http if missing
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    setQrValue(targetUrl);
    toast.success("QR Code generated instantly!");
  };

  const handleCustomizeRedirect = () => {
    if (url.trim()) {
      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }
      router.push(`/qr?url=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push("/qr");
    }
  };

  const downloadSVG = () => {
    const svg = document.getElementById("quick-qr-svg");
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));

    const downloadLink = document.createElement("a");
    downloadLink.href = `data:image/svg+xml;base64,${svgBase64}`;
    downloadLink.download = "qr-junction-quick.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("SVG file downloaded!");
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 p-6 sm:p-8 rounded-lg shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-6 relative overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">
          Instant Generator
        </h3>
      </div>

      <form onSubmit={handleQuickGenerate} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
            Destination Link
          </label>
          <div className="relative">
            <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. google.com, yourname.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md h-[48px] pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-[44px] bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-primary hover:-translate-y-0.5 hover:shadow-primary-hover duration-200 border-none"
        >
          <span>Generate Quick QR</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Render QR Preview Container */}
      <div className="flex flex-col items-center justify-center min-h-[160px] border border-slate-100 bg-slate-50/50 rounded-md p-4">
        {qrValue ? (
          <div className="space-y-4 text-center animate-fade-in">
            <div className="bg-white p-3.5 rounded-lg inline-block shadow-sm border border-slate-205">
              <QRCodeSVG
                id="quick-qr-svg"
                value={qrValue}
                size={120}
                fgColor="#001B50"
                bgColor="#ffffff"
                level="L"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={downloadSVG}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-[#001B50] rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download SVG</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4 space-y-2 text-slate-400 select-none">
            <div className="w-12 h-12 rounded-lg bg-white border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto text-slate-400 font-bold text-sm">
              ?
            </div>
            <p className="text-xs text-slate-550">
              Your dynamic QR code preview will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Link to advanced customization canvas */}
      <button
        onClick={handleCustomizeRedirect}
        className="w-full text-center text-xs text-primary hover:text-primary/90 hover:underline font-semibold block transition-colors cursor-pointer bg-transparent border-none outline-none mt-2"
      >
        Customize Design &amp; Add Frames →
      </button>
    </div>
  );
}
