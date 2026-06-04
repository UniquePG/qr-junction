'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Shield, 
  Infinity as InfinityIcon, 
  Download, 
  Palette, 
  RefreshCw 
} from 'lucide-react';

// Sub-component: Mini product sandbox simulations for each feature card
function FeatureSimulation({ index }: { index: number }) {
  switch (index) {
    case 0: // Instant Generation
      return (
        <div className="w-full h-full flex flex-col justify-center text-[10px] space-y-1.5 select-none">
          <div className="flex items-center justify-between bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-3xs">
            <span className="text-slate-500 font-mono text-[9px] truncate max-w-[130px]">qrjunction.in/campaign_01</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="flex items-center justify-between text-[8px] px-0.5 font-bold">
            <span className="text-[#0046a1]">Engine: Online</span>
            <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-black">✓ 0.08s</span>
          </div>
        </div>
      );

    case 1: // Secure
      return (
        <div className="w-full h-full flex items-center justify-center gap-3 select-none">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-[#8B5CF6]">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col text-[10px] space-y-0.5">
            <span className="font-extrabold text-[#001B50] text-[9.5px]">Secure Shield</span>
            <span className="font-mono text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.2 rounded text-[7.5px] font-bold">
              AES-256 Verified
            </span>
          </div>
        </div>
      );

    case 2: // Tracking
      return (
        <div className="w-full h-full flex items-end justify-between px-3 pb-1 relative select-none">
          {/* Sparkline column bars */}
          <div className="w-3.5 h-6 bg-slate-200 rounded-xs" />
          <div className="w-3.5 h-9 bg-slate-200 rounded-xs" />
          <div className="w-3.5 h-5 bg-slate-200 rounded-xs" />
          <div className="w-3.5 h-12 bg-primary/20 rounded-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/40 animate-pulse" />
          </div>
          <div className="w-3.5 h-8 bg-slate-200 rounded-xs" />
          <div className="w-3.5 h-10 bg-slate-200 rounded-xs" />

          {/* Floating counter */}
          <div className="absolute top-0 right-1 bg-[#001B50] text-white text-[8px] font-black py-0.5 px-2 rounded shadow-sm animate-bounce">
            +412 Scans
          </div>
        </div>
      );

    case 3: // Downloads
      return (
        <div className="w-full h-full flex items-center justify-center gap-2 select-none">
          <div className="border border-slate-200 bg-white hover:border-[#0046a1] hover:text-[#0046a1] text-slate-700 font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg shadow-3xs cursor-pointer transition-colors flex items-center gap-1">
            <Download className="w-2.5 h-2.5 text-slate-400" />
            <span>PNG</span>
          </div>
          <div className="border border-primary bg-primary/5 text-primary hover:bg-primary hover:text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg shadow-3xs cursor-pointer transition-colors flex items-center gap-1">
            <Download className="w-2.5 h-2.5 text-primary" />
            <span>SVG</span>
          </div>
        </div>
      );

    case 4: // Customizable
      return (
        <div className="w-full h-full flex items-center justify-center gap-3 select-none">
          <div className="flex gap-1.5">
            <div className="w-6 h-6 rounded-md bg-white border border-primary flex items-center justify-center text-[10px] font-bold text-primary">
              ■
            </div>
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-450">
              ●
            </div>
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-450">
              ◆
            </div>
          </div>
          
          <span className="w-[1px] h-6 bg-slate-200" />
          
          <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[8px] font-black">
            <Palette className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 5: // Redirection
      return (
        <div className="w-full h-full flex items-center justify-between px-2 text-[8px] select-none">
          <div className="bg-white border border-slate-200 rounded-md p-1 font-bold shadow-3xs flex flex-col leading-tight">
            <span className="text-slate-400 text-[5.5px] font-semibold uppercase">Code</span>
            <span className="text-[#001B50]">qr.in/xyz</span>
          </div>
          
          {/* Animated trail */}
          <div className="flex-1 flex items-center justify-center relative px-2.5">
            <div className="w-full h-[1px] bg-slate-200 relative">
              <div className="absolute top-[-2.5px] left-0 w-2 h-2 rounded-full bg-[#0046a1] shadow-xs shadow-blue-200 animate-route-dot" />
            </div>
          </div>

          <div className="bg-white border border-[#0046a1]/30 rounded-md p-1 font-bold shadow-3xs flex flex-col leading-tight">
            <span className="text-[#0046a1] text-[5.5px] font-semibold uppercase">Route</span>
            <span className="text-[#0046a1]">target.com</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !scrollRef.current) return;
      if (window.innerWidth < 1024) return; // Only process scroll locks on desktop widths

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      const totalScrollableDistance = rect.height - windowHeight;
      const scrolledDistance = -rect.top;
      
      if (totalScrollableDistance <= 0) return;
      
      const progress = Math.max(0, Math.min(1, scrolledDistance / totalScrollableDistance));
      setScrollProgress(progress);
      
      // Calculate strip scroll width relative to screen width
      const scrollWidth = scrollRef.current.scrollWidth;
      const maxTranslate = scrollWidth - windowWidth + 128; // pad offset matching container spacing
      
      if (maxTranslate > 0) {
        setTranslateX(-progress * maxTranslate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Instant Generation',
      description: 'Generate dynamic QR codes instantly without any delays or wait times.',
      colorGradient: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50 border-amber-100 text-amber-600',
    },
    {
      icon: Shield,
      title: '100% Secure',
      description: 'Enterprise-grade encryption and Firebase security keep your data protected.',
      colorGradient: 'from-indigo-500 to-blue-650',
      bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-650',
    },
    {
      icon: InfinityIcon,
      title: 'Unlimited QR Tracking',
      description: 'Create and monitor as many dynamic campaigns as your growth requires.',
      colorGradient: 'from-purple-500 to-pink-650',
      bgColor: 'bg-purple-50 border-purple-100 text-purple-650',
    },
    {
      icon: Download,
      title: 'Vector Downloads',
      description: 'Download QR codes in high-resolution PNG or SVG vector formats instantly.',
      colorGradient: 'from-emerald-400 to-teal-600',
      bgColor: 'bg-emerald-50 border-emerald-100 text-emerald-650',
    },
    {
      icon: Palette,
      title: 'Fully Customizable',
      description: 'Adjust corner dots, eye framing shapes, preset colors, and embed logos.',
      colorGradient: 'from-rose-500 to-red-650',
      bgColor: 'bg-rose-50 border-rose-100 text-rose-650',
    },
    {
      icon: RefreshCw,
      title: 'Dynamic Redirection',
      description: 'Scan on mobile, update routing destinations instantly from your dashboard.',
      colorGradient: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    },
  ];

  return (
    <div id="features" className="scroll-mt-10 relative">
      {/* Global CSS Style tag for scroll animation hooks */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes route-dot {
          0% { left: 0%; opacity: 0.2; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 85%; opacity: 0.2; }
        }
        .animate-route-dot {
          animation: route-dot 1.8s infinite linear;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* 1. DESKTOP VIEWPORT HORIZONTAL STICKY SCROLLER */}
      <div ref={containerRef} className="relative h-[250vh] hidden lg:block z-20">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center bg-gradient-to-b from-white via-slate-50/50 to-white">
          
          {/* Header Block */}
          <div className="text-center max-w-3xl mx-auto mb-12 mt-8 flex-shrink-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Core Capabilities
            </span>
            <h2 className="text-3.5xl font-extrabold text-[#001B50] mt-3">
              Everything You Need to Power Offline Campaigns
            </h2>
            <p className="text-slate-600 text-sm mt-1.5">
              A premium dynamic engine built to establish seamless offline-to-online engagement pathways.
            </p>
          </div>

          {/* Horizontal translate box */}
          <div className="w-full flex-1 flex items-center overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex gap-8 px-16 transition-transform duration-100 ease-out will-change-transform"
              style={{ transform: `translateX(${translateX}px)` }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="w-[340px] md:w-[380px] h-[350px] flex-shrink-0 bg-white border border-slate-200/80 rounded-3xl p-8 hover:border-slate-350 hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-3xs group"
                  >
                    {/* Index Watermark */}
                    <span className="absolute right-6 top-4 text-7xl font-mono font-black text-slate-100/50 select-none pointer-events-none group-hover:text-slate-200/70 transition-colors duration-300">
                      0{index + 1}
                    </span>

                    <div>
                      {/* Icon circle */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 bg-gradient-to-tr ${feature.colorGradient} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <h3 className="text-xl font-extrabold text-[#001B50] group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Graphic Box */}
                    <div className="h-28 mt-4 rounded-2xl bg-slate-50 border border-slate-100/80 p-4 flex items-center justify-center overflow-hidden relative">
                      <FeatureSimulation index={index} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom indicator progress bar */}
          <div className="h-1.5 w-full bg-slate-100 flex-shrink-0 relative overflow-hidden border-t border-slate-200/60">
            <div 
              className="absolute top-0 left-0 h-full bg-[#0046a1] transition-all duration-300"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>

        </div>
      </div>

      {/* 2. MOBILE/TABLET SWIPEABLE snap deck FALLBACK */}
      <div className="lg:hidden py-16 px-6 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden border-t border-slate-200/80 mt-8">
        
        {/* Mobile Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Core Capabilities
          </span>
          <h2 className="text-2.5xl font-extrabold text-[#001B50] mt-3">
            Everything You Need to Power Offline Campaigns
          </h2>
          <p className="text-slate-600 text-xs mt-2 max-w-md mx-auto">
            From high-fidelity designer elements to dynamic geo-tracking redirection systems.
          </p>
        </div>

        {/* Horizontal Swipe deck */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 scrollbar-none px-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="w-[280px] sm:w-[320px] snap-center flex-shrink-0 bg-white border border-slate-200/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-3xs"
              >
                {/* Index Watermark */}
                <span className="absolute right-4 top-2 text-6xl font-mono font-black text-slate-100/50 select-none pointer-events-none">
                  0{index + 1}
                </span>

                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 bg-gradient-to-tr ${feature.colorGradient} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#001B50]">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                    {feature.description}
                  </p>
                </div>

                <div className="h-24 mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-center overflow-hidden relative">
                  <FeatureSimulation index={index} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

