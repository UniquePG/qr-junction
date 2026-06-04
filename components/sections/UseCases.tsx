'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Contact, 
  Share2, 
  Wifi, 
  Megaphone, 
  CalendarDays, 
  FileText,
  Sparkles,
  ArrowUpRight,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Check,
  QrCode,
  Ticket,
  Download,
  Lock,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  ArrowRight
} from 'lucide-react';

// Sub-component: Mock Phone Screen Content with self-contained states & timers
function PhoneScreen({ index, isActive }: { index: number; isActive: boolean }) {
  const [wifiConnected, setWifiConnected] = useState(false);
  const [scanLogged, setScanLogged] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [cardSaved, setCardSaved] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setWifiConnected(false);
      setScanLogged(false);
      setPdfProgress(0);
      setCardSaved(false);
      return;
    }

    const wifiTimeout = setTimeout(() => setWifiConnected(true), 2400);
    const scanTimeout = setTimeout(() => setScanLogged(true), 1600);
    const cardTimeout = setTimeout(() => setCardSaved(true), 1800);
    
    const pdfInterval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 100) {
          clearInterval(pdfInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 180);

    return () => {
      clearTimeout(wifiTimeout);
      clearTimeout(scanTimeout);
      clearTimeout(cardTimeout);
      clearInterval(pdfInterval);
    };
  }, [isActive]);

  switch (index) {
    case 0: // Digital Business Cards
      return (
        <div className="flex-1 bg-slate-50 flex flex-col relative text-slate-800 p-4 select-none h-full">
          {/* Header Banner */}
          <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-650 flex items-end justify-center relative p-3 rounded-b-2xl">
            <div className="absolute inset-0 bg-white/10" />
          </div>

          {/* Profile Circle */}
          <div className="flex justify-center -mt-8 relative z-10">
            <div className="w-16 h-16 rounded-full bg-white p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-indigo-650 flex items-center justify-center text-white text-lg font-bold">
                SJ
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="text-center mt-2">
            <h4 className="text-[11px] font-black text-[#001B50]">Sarah Jenkins</h4>
            <p className="text-[8.5px] text-slate-500 font-bold">VP of Product Design</p>
            <p className="text-[8px] text-[#0046a1] font-extrabold mt-0.5">Junction Creative</p>
          </div>

          {/* Save Button */}
          <div className="mt-3.5 space-y-1.5">
            <button 
              className={`w-full py-1.5 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all duration-500 ${
                cardSaved 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-[#0046a1] text-white shadow-md shadow-blue-100 hover:bg-[#003b8f]'
              }`}
            >
              <UserPlus className="w-3 h-3" />
              <span>{cardSaved ? 'Contact Saved!' : 'Save Contact'}</span>
            </button>

            <div className="flex justify-between">
              <div className="w-[48%] py-1.5 border border-slate-200/80 rounded-md text-[8px] font-bold text-slate-700 bg-white flex items-center justify-center gap-1">
                <Mail className="w-2.5 h-2.5 text-slate-400" />
                <span>Email</span>
              </div>
              <div className="w-[48%] py-1.5 border border-slate-200/80 rounded-md text-[8px] font-bold text-slate-700 bg-white flex items-center justify-center gap-1">
                <Globe className="w-2.5 h-2.5 text-slate-400" />
                <span>Web</span>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="mt-4 space-y-2 flex-1 text-left">
            <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">CONTACT</span>
            
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-100 shadow-3xs">
              <Phone className="w-3 h-3 text-[#0046a1]/80" />
              <div className="flex flex-col">
                <span className="text-[6.5px] text-slate-400 font-medium leading-none">Phone</span>
                <span className="text-[8px] text-slate-800 font-bold mt-0.5">+1 (555) 234-5678</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-100 shadow-3xs">
              <Mail className="w-3 h-3 text-[#0046a1]/80" />
              <div className="flex flex-col">
                <span className="text-[6.5px] text-slate-400 font-medium leading-none">Email</span>
                <span className="text-[8px] text-slate-800 font-bold mt-0.5">sarah@junction.design</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 1: // Social Hub Redirects
      return (
        <div className="flex-1 bg-gradient-to-b from-purple-50 via-slate-50 to-white flex flex-col p-4 select-none h-full overflow-y-auto">
          <div className="flex flex-col items-center mt-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-purple-600 font-black text-xs">
                @SJ
              </div>
            </div>
            <h4 className="text-[11px] font-black text-slate-800 mt-1.5">Sarah Jenkins</h4>
            <p className="text-[8px] text-purple-600 font-bold">@sarah_junction</p>
            <p className="text-[7.5px] text-slate-500 text-center max-w-[170px] mt-1 leading-normal">
              Freelance UX Architect & Template Creator.
            </p>
          </div>

          <div className="mt-4 space-y-2 flex-1">
            <div className="bg-white border border-purple-100/80 p-2 rounded-lg flex items-center justify-between shadow-3xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center text-[#8B5CF6]">
                  <Globe className="w-3 h-3" />
                </div>
                <span className="text-[8.5px] font-bold text-slate-700">Official Website</span>
              </div>
              <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
            </div>

            <div className="bg-white border border-purple-100/80 p-2 rounded-lg flex items-center justify-between shadow-3xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-pink-50 flex items-center justify-center text-pink-500">
                  <Instagram className="w-3 h-3" />
                </div>
                <span className="text-[8.5px] font-bold text-slate-700">Latest Dribbble Projects</span>
              </div>
              <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
            </div>

            <div className="bg-white border border-purple-100/80 p-2 rounded-lg flex items-center justify-between shadow-3xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-650">
                  <Linkedin className="w-3 h-3" />
                </div>
                <span className="text-[8.5px] font-bold text-slate-700">Professional CV</span>
              </div>
              <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-purple-100/50 flex justify-center gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Twitter className="w-3 h-3" />
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Instagram className="w-3 h-3" />
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Linkedin className="w-3 h-3" />
            </div>
          </div>
        </div>
      );

    case 2: // WiFi Sharing
      return (
        <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden h-full select-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:10px_16px] opacity-50" />

          {/* Pulse Waves */}
          <div className="relative w-20 h-20 flex items-center justify-center z-10 mb-4">
            <div className="absolute inset-0 rounded-full bg-emerald-100 border border-emerald-200/40 animate-wifi-pulse-slow" />
            <div className="absolute inset-3 rounded-full bg-emerald-200/30 border border-emerald-300/30 animate-wifi-pulse-fast" />
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-xs ${
              wifiConnected ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-white border border-slate-200 text-[#001B50]'
            }`}>
              <Wifi className={`w-6 h-6 ${wifiConnected ? 'animate-none' : 'animate-pulse'}`} />
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-3xs border border-slate-200/80 rounded-xl p-3.5 text-center shadow-md relative z-10 w-full max-w-[190px]">
            <h4 className="text-[10px] font-black text-[#001B50] tracking-tight">WiFi Network</h4>
            <p className="text-[8.5px] text-slate-700 font-bold mt-1 bg-slate-100 py-0.5 px-2 rounded border border-slate-200 inline-block">
              Junction_HQ_5G
            </p>

            <div className="flex items-center justify-center gap-1 mt-1.5 text-[7px] text-slate-400">
              <Lock className="w-2 h-2" />
              <span>WPA3 Secured</span>
            </div>

            <div className="border-t border-slate-100 mt-3 pt-2">
              {wifiConnected ? (
                <div className="flex flex-col items-center">
                  <span className="text-[8.5px] text-emerald-600 font-extrabold flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span>Connected</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 text-slate-500 text-[8px] font-bold py-0.5">
                  <div className="w-1 h-1 rounded-full bg-[#0046a1] animate-bounce" />
                  <div className="w-1 h-1 rounded-full bg-[#0046a1] animate-bounce delay-150" />
                  <div className="w-1 h-1 rounded-full bg-[#0046a1] animate-bounce delay-300" />
                  <span className="ml-1 text-[7.5px] text-slate-400">Connecting...</span>
                </div>
              )}
            </div>
          </div>

          {/* Toast */}
          {wifiConnected && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-900 text-white rounded-lg p-2 flex items-center gap-2 shadow-md text-[7.5px] z-20 border border-slate-800 animate-slideUp">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                <Check className="w-2 h-2 stroke-[3]" />
              </div>
              <div className="flex-1 flex flex-col leading-tight">
                <span className="font-extrabold">Sub-second Routing</span>
                <span className="text-slate-400">Credentials applied automatically</span>
              </div>
            </div>
          )}
        </div>
      );

    case 3: // Marketing Flyers
      return (
        <div className="flex-1 bg-slate-100 flex flex-col relative h-full select-none">
          <div className="flex-1 p-3.5 flex flex-col justify-between">
            {/* Cafe Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-2.5 text-white relative shadow-2xs">
              <div className="absolute inset-0 bg-white/5" />
              <h4 className="text-[9px] font-black uppercase tracking-wider">Junction Brews</h4>
              <p className="text-[7px] opacity-90">Fresh beans, roasted daily.</p>
              <span className="absolute top-2.5 right-2.5 px-1 py-0.2 bg-black/20 rounded text-[6px] font-bold">MENU</span>
            </div>

            {/* Price list */}
            <div className="my-2 space-y-1.5 px-1">
              <div className="flex justify-between items-baseline text-[8px] border-b border-slate-200 pb-0.5">
                <span className="font-semibold text-slate-600">Cold Brew Iced Coffee</span>
                <span className="font-bold text-[#001B50]">$4.50</span>
              </div>
              <div className="flex justify-between items-baseline text-[8px] border-b border-slate-200 pb-0.5">
                <span className="font-semibold text-slate-600">Organic Matcha Latte</span>
                <span className="font-bold text-[#001B50]">$5.00</span>
              </div>
              <div className="flex justify-between items-baseline text-[8px] border-b border-slate-200 pb-0.5">
                <span className="font-semibold text-slate-600">Artisanal Avocado Toast</span>
                <span className="font-bold text-[#001B50]">$8.50</span>
              </div>
            </div>

            {/* Bottom Promo Code */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between shadow-3xs relative">
              <div className="flex flex-col">
                <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wide">Promo Offer</span>
                <span className="text-[8px] font-black text-[#001B50] leading-tight">Scan for 20% Off</span>
              </div>

              {/* QR scanner visual */}
              <div className="relative w-8 h-8 bg-slate-50 border border-slate-200 p-0.5 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                <QrCode className="w-full h-full text-slate-800" />
                <div className="absolute left-0 right-0 h-[1.5px] bg-red-500 shadow-md shadow-red-500/50 animate-scanner-beam" />
              </div>
            </div>
          </div>

          {/* Toast */}
          {scanLogged && (
            <div className="absolute bottom-2 left-2 right-2 bg-[#001B50] text-white rounded-lg p-2 flex items-center gap-2 shadow-md text-[7px] border border-primary/20 z-20 animate-slideUp">
              <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
                <Megaphone className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="flex-1 flex flex-col leading-tight">
                <span className="font-bold flex items-center justify-between">
                  <span>Referral Tracked</span>
                  <span className="text-[6px] text-amber-400 font-extrabold bg-amber-950/40 px-1 py-0.2 rounded">COFFEE20</span>
                </span>
                <span className="text-slate-400 font-medium">Scans: +1 | Device: Mobile iOS</span>
              </div>
            </div>
          )}
        </div>
      );

    case 4: // Event Invitations
      return (
        <div className="flex-1 bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex flex-col text-white p-3 select-none h-full justify-between">
          <div className="text-center space-y-0.5 pt-1.5">
            <span className="px-1.5 py-0.2 bg-gradient-to-r from-rose-500 to-red-650 rounded-full text-[6px] font-black tracking-widest uppercase">
              VIP PASS
            </span>
            <h4 className="text-[10px] font-black tracking-tight leading-tight pt-0.5">
              TECH SUMMIT 2026
            </h4>
            <p className="text-[7.5px] text-slate-400 font-bold">Keynote & Creator Panels</p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-y border-dashed border-slate-700/80 py-2 text-left bg-slate-900/40 rounded-lg px-2 text-[7.5px]">
            <div className="flex flex-col">
              <span className="text-[6px] text-slate-500 uppercase font-bold">Date</span>
              <span className="font-bold text-white">Oct 12-14, 2026</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-slate-500 uppercase font-bold">Time</span>
              <span className="font-bold text-white">09:00 AM EST</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-slate-500 uppercase font-bold">Seat</span>
              <span className="font-bold text-white">Row A, Seat 14</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-slate-500 uppercase font-bold">Venue</span>
              <span className="font-bold text-white">Silicon Hall, SF</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1 pb-1">
            <div className="bg-white p-1.5 rounded-lg shadow flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-950" />
            </div>
            <div className="flex items-center gap-1 text-[7.5px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-full font-bold">
              <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
              <span>Ticket Verified ✓</span>
            </div>
          </div>
        </div>
      );

    case 5: // PDF Documentation
      return (
        <div className="flex-1 bg-slate-50 flex flex-col relative h-full select-none">
          {/* Top PDF Bar */}
          <div className="bg-white border-b border-slate-200/80 px-2.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-red-50 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-red-500" />
              </div>
              <span className="text-[8px] font-bold text-slate-700 truncate max-w-[110px]">User_Guide.pdf</span>
            </div>
            <span className="text-[7px] text-slate-400 font-bold bg-slate-100 px-1 py-0.2 rounded">1/12</span>
          </div>

          {/* Mini Document Skeletal lines */}
          <div className="flex-1 p-2.5 space-y-1.5">
            <div className="h-1.5 w-[70%] bg-slate-300 rounded-sm" />
            <div className="h-1 w-[40%] bg-slate-200 rounded-sm mb-2" />
            
            <div className="space-y-0.8 pt-1">
              <div className="h-[3px] w-full bg-slate-200 rounded-2xs" />
              <div className="h-[3px] w-full bg-slate-200 rounded-2xs" />
              <div className="h-[3px] w-[80%] bg-slate-200 rounded-2xs" />
            </div>

            <div className="h-10 bg-slate-100 rounded-md border border-slate-200/80 flex items-center justify-center relative overflow-hidden mt-2">
              <QrCode className="w-4 h-4 text-slate-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent" />
            </div>
          </div>

          {/* Download progress overlay */}
          <div className="bg-white border-t border-slate-200 p-2 space-y-1.5 absolute bottom-0 left-0 right-0 z-20 shadow-sm">
            <div className="flex justify-between items-center text-[7.5px]">
              <span className="font-extrabold text-slate-800 truncate max-w-[120px]">User_Guide.pdf (4.8MB)</span>
              <span className="font-black text-primary">{pdfProgress}%</span>
            </div>

            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
              <div 
                className="absolute left-0 top-0 h-full bg-[#0046a1] rounded-full transition-all duration-150 ease-out" 
                style={{ width: `${pdfProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[7px]">
              {pdfProgress < 100 ? (
                <span className="text-slate-400 font-bold flex items-center gap-0.5">
                  <Download className="w-2 h-2 animate-bounce" />
                  <span>Fetching...</span>
                </span>
              ) : (
                <span className="text-emerald-600 font-black flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Ready</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// Smartphone Mockup Wrapper Component
function PhoneMockup({ index, isActive, isMobile = false }: { index: number; isActive: boolean; isMobile?: boolean }) {
  return (
    <div className={`relative mx-auto w-[250px] sm:w-[260px] h-[500px] sm:h-[520px] bg-slate-900 rounded-[38px] border-4 border-slate-850 shadow-2xl overflow-hidden flex flex-col transition-all duration-700 ${
      isMobile ? 'my-8 scale-95 border-2 border-slate-800' : 'scale-100 border-4 border-slate-850'
    }`}>
      {/* Dynamic Island / Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-between px-2">
        <div className="w-1 h-1 rounded-full bg-slate-800" />
        <div className="w-8 h-0.5 bg-slate-800 rounded-full" />
      </div>

      {/* Top Mobile OS Status Bar */}
      <div className="flex justify-between items-center px-5 pt-6 pb-2 text-[8px] font-bold text-slate-500 bg-white border-b border-slate-100 select-none z-20">
        <span>9:41 AM</span>
        <div className="flex items-center gap-1">
          <div className="flex items-end gap-[1px] h-1.5">
            <div className="w-[1.5px] h-[2px] bg-slate-400 rounded-3xs" />
            <div className="w-[1.5px] h-[3.5px] bg-slate-400 rounded-3xs" />
            <div className="w-[1.5px] h-[5px] bg-slate-600 rounded-3xs" />
          </div>
          <Wifi className="w-2.5 h-2.5 text-slate-500" />
          <div className="w-3.5 h-2 border border-slate-400 rounded-3xs p-[0.5px] flex items-center">
            <div className="w-full h-full bg-slate-500 rounded-3xs" />
          </div>
        </div>
      </div>

      {/* Embedded Phone Screen Box */}
      <div className="flex-1 overflow-hidden relative bg-white z-10 flex flex-col">
        <PhoneScreen index={index} isActive={isActive} />
      </div>

      {/* Mobile iOS Bar */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-300 rounded-full z-30" />
    </div>
  );
}

export default function UseCases() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px', // Target middle center of the viewport
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          setActiveIndex(index);
        }
      });
    }, observerOptions);

    refs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const scrollToSection = (index: number) => {
    const element = refs.current[index];
    if (element) {
      // Find offset of the section and center it nicely
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const useCases = [
    {
      icon: Contact,
      title: 'Digital Business Cards',
      description: 'Deploy vCard dynamic QR codes to share contact details instantly on physical networking cards.',
      color: 'from-blue-500 to-indigo-650',
      bgColor: 'bg-blue-50 border-blue-100 text-blue-600',
      accent: '#0046a1',
      bullets: [
        'Instantly save vCards directly to mobile contacts list',
        'Update phone, address, and email online without reprint needs',
        'Add links to personal websites and custom portfolio galleries'
      ],
      cta: 'Generate Digital Card',
      ctaLink: '/dashboard/qrs/new?type=vcard'
    },
    {
      icon: Share2,
      title: 'Social Hub Redirects',
      description: 'Connect all your media profiles (Instagram, LinkedIn, X) to grow your online audience footprint.',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 border-purple-100 text-purple-600',
      accent: '#8B5CF6',
      bullets: [
        'Consolidate multiple media channels under a single QR code',
        'Custom link templates optimized for mobile browsers',
        'Track referral links, click rates, and visitor locations'
      ],
      cta: 'Build Social Hub',
      ctaLink: '/dashboard/pages/new'
    },
    {
      icon: Wifi,
      title: 'Seamless WiFi Sharing',
      description: 'Share local internet access with guests immediately without typing or exposing network credentials.',
      color: 'from-emerald-400 to-teal-600',
      bgColor: 'bg-emerald-50 border-emerald-100 text-emerald-650',
      accent: '#10B981',
      bullets: [
        'Supports standard WPA/WPA2/WPA3 password keys encryption',
        'Scan-to-connect protocol runs natively on iOS & Android',
        'Perfect for guest lounges, office suites, cafes, and shops'
      ],
      cta: 'Create WiFi QR',
      ctaLink: '/dashboard/qrs/new?type=wifi'
    },
    {
      icon: Megaphone,
      title: 'Marketing Flyers',
      description: 'Embed trackable short URLs on print menus, flyers, and banners. Measure offline conversions dynamically.',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50 border-amber-100 text-amber-600',
      accent: '#F59E0B',
      bullets: [
        'Use dynamic redirection URLs to control target paths anywhere',
        'A/B test campaign links without reprinting printed assets',
        'Log conversion statistics, client device types, and locations'
      ],
      cta: 'Launch Flyer QR',
      ctaLink: '/dashboard/qrs/new?type=url'
    },
    {
      icon: CalendarDays,
      title: 'Event Invitations',
      description: 'Link ticket registries, maps, schedules, and reminders directly to your paper flyers.',
      color: 'from-rose-500 to-red-650',
      bgColor: 'bg-rose-50 border-rose-100 text-rose-600',
      accent: '#F43F5E',
      bullets: [
        'Link ticket registries, directions, and calendar reminders',
        'Integrate lead registration workflows inside check-in systems',
        'High-fidelity vector barcode and ticket pass generation'
      ],
      cta: 'Set Up Ticket QR',
      ctaLink: '/dashboard/qrs/new?type=event'
    },
    {
      icon: FileText,
      title: 'PDF Documentation',
      description: 'Give users immediate mobile access to catalogs, instruction manuals, or restaurant menus.',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600',
      accent: '#06B6D4',
      bullets: [
        'Directly serve menu designs, blueprints, manual guides, and ebooks',
        'Swap PDF attachments dynamically on existing printed QR codes',
        'Fast lightweight previews designed for low-bandwidth connections'
      ],
      cta: 'Upload PDF Document',
      ctaLink: '/dashboard/qrs/new?type=pdf'
    },
  ];

  return (
    <section 
      ref={sectionRef} 
      id="usecases" 
      className="relative py-24 bg-gradient-to-b from-white via-slate-50 to-white scroll-mt-10"
    >
      {/* Style overrides for custom phone animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wifi-pulse-slow {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes wifi-pulse-fast {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes scanner-beam {
          0%, 100% { top: 10%; opacity: 0.8; }
          50% { top: 90%; opacity: 0.8; }
        }
        @keyframes slideUp {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleUp {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-wifi-pulse-slow {
          animation: wifi-pulse-slow 2.4s infinite cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-wifi-pulse-fast {
          animation: wifi-pulse-fast 1.6s infinite cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-scanner-beam {
          animation: scanner-beam 2s infinite ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Decorative background vectors wrapped to prevent breaking sticky positioning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-200/80" />
        <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-primary/2 blur-[90px]" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-secondary/2 blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/15 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Versatile Solutions</span>
          </div>

          <h2 className="text-3.5xl md:text-4.5xl font-extrabold text-[#001B50] tracking-tight leading-tight">
            Built for Diverse Business Use Cases
          </h2>
          
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Bridge the gap between offline physical interactions and online digital conversions with our premium asset solutions.
          </p>
        </div>

        {/* Dynamic Showcase Chassis */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start relative">
          
          {/* LEFT COLUMN: Sticky Smartphone Sandbox (Hidden on Mobile/Tablet layout) */}
          <div className="hidden lg:flex lg:flex-col lg:w-1/2 lg:sticky lg:top-32 lg:self-start items-center justify-center z-20">
            <div className="relative w-full flex items-center justify-center">
              
              {/* Dynamic decorative backdrop radial glows based on active use-case accent */}
              <div 
                className="absolute w-[360px] h-[360px] rounded-full blur-[110px] opacity-15 transition-all duration-1000 pointer-events-none"
                style={{ 
                  background: useCases[activeIndex]?.accent || '#0046a1',
                  transform: 'translate(-10px, -15px)' 
                }}
              />

              {/* Render Desktop Mockup */}
              <div className="transition-all duration-700 transform hover:scale-[1.01] hover:shadow-3xl">
                <PhoneMockup index={activeIndex} isActive={true} />
              </div>

              {/* Mini quick dots list floating next to the phone for scroll triggers */}
              <div className="absolute right-4 xl:right-10 flex flex-col gap-3.5">
                {useCases.map((useCase, idx) => {
                  const Icon = useCase.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToSection(idx)}
                      className={`group w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 border ${
                        activeIndex === idx
                          ? 'bg-[#001B50] border-[#001B50] text-white scale-110 shadow-md shadow-blue-100'
                          : 'bg-white border-slate-200 text-slate-450 hover:border-slate-350 hover:text-slate-650'
                      }`}
                      title={useCase.title}
                    >
                      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-105" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Scrollable narrative stories list */}
          <div className="w-full lg:w-1/2 relative">
            {/* Timeline vertical track */}
            <div className="absolute left-4 lg:left-6 top-6 bottom-6 w-[2px] bg-slate-200/80" />
            
            {/* Active timeline highlight path */}
            <div 
              className="absolute left-[15px] lg:left-[23px] top-6 w-[2px] bg-gradient-to-b from-[#0046a1] to-blue-500 transition-all duration-700 ease-out" 
              style={{
                height: `${(activeIndex / (useCases.length - 1)) * 92}%`
              }}
            />

            <div className="flex flex-col gap-16 lg:gap-24">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                const isActive = activeIndex === index;

                return (
                  <div
                    key={index}
                    ref={(el) => { refs.current[index] = el; }}
                    data-index={index}
                    className={`relative pl-12 lg:pl-16 transition-all duration-700 transform ${
                      isActive 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-50 lg:opacity-40 translate-x-0'
                    }`}
                  >
                    {/* Timeline node marker dot */}
                    <button
                      onClick={() => scrollToSection(index)}
                      className={`absolute left-[16px] lg:left-[24px] top-8 -translate-x-1/2 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-500 z-10 ${
                        isActive 
                          ? 'border-[#0046a1] scale-125 shadow-md shadow-blue-150' 
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-[#0046a1] animate-pulse" />
                      )}
                    </button>

                    {/* Content Card layout */}
                    <div className="space-y-5">
                      {/* Step index & Category tag */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 tracking-wider font-mono">
                          0{index + 1}
                        </span>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${useCase.bgColor}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{useCase.title}</span>
                        </div>
                      </div>

                      {/* Header block */}
                      <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-black text-[#001B50] tracking-tight leading-tight">
                          {useCase.title}
                        </h3>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                          {useCase.description}
                        </p>
                      </div>

                      {/* Key features bullets stack */}
                      <ul className="space-y-2.5">
                        {useCase.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-650">
                            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: useCase.accent }} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Call-to-action button */}
                      <div className="pt-2 flex items-center gap-4">
                        <a
                          href={useCase.ctaLink}
                          className="inline-flex items-center gap-2 text-xs md:text-sm font-extrabold text-[#0046a1] hover:text-[#003b8f] transition-all duration-300 group"
                        >
                          <span>{useCase.cta}</span>
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                      </div>

                      {/* Inline smartphone preview frame (Visible on Mobile/Tablet viewport sizes only) */}
                      <div className="lg:hidden w-full max-w-[280px] mx-auto mt-6 pt-2 bg-slate-50/50 rounded-2xl flex justify-center">
                        <PhoneMockup index={index} isActive={isActive} isMobile={true} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Global Bottom details block */}
        <div className="mt-24 md:mt-32 max-w-4xl mx-auto border-t border-slate-200 pt-10 text-center">
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-3xl mx-auto px-4">
            QR Junction enables you to deploy professional vector assets instantly. Whether launching print marketing campaigns, collecting lead subscribers, managing guest office Wi-Fi, or sharing business portfolios, enjoy complete reliability, sub-second latency routing, and high-fidelity output.
          </p>
        </div>

      </div>
    </section>
  );
}

