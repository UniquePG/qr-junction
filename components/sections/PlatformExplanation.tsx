'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Settings, 
  TrendingUp, 
  QrCode, 
  Shuffle, 
  Sparkles,
  BarChart2, 
  MapPin, 
  Cpu
} from 'lucide-react';

export default function PlatformExplanation() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden scroll-mt-10"
    >
      {/* Background ambient grids and glow shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-radial-gradient from-primary/5 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute -top-10 left-10 w-72 h-72 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Modern Label & Title */}
        <div className={`text-center space-y-4 max-w-3xl mx-auto mb-20 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/15 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          
          <h2 className="text-3.5xl md:text-4.5xl font-extrabold text-[#001B50] tracking-tight leading-tight">
            Why Choose QR Junction?
          </h2>
          
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            A premium, feature-rich dynamic QR platform engineered to give you absolute control, sub-second routing, conversion tracking, and styling freedom.
          </p>
        </div>

        {/* Bento-Inspired Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Dynamic Routing */}
          <div className={`group bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between h-full relative overflow-hidden transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          } delay-100`}>
            
            {/* Interactive SVG Animation Wrapper */}
            <div className="relative h-48 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden mb-6 p-4">
              {/* Dynamic Connecting Network Nodes */}
              <svg className="w-full h-full" viewBox="0 0 300 160" fill="none">
                {/* Connection lines */}
                <path 
                  d="M 50 80 L 150 80" 
                  stroke="#e2e8f0" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                />
                <path 
                  d="M 150 80 L 250 40" 
                  stroke="#e2e8f0" 
                  strokeWidth="2" 
                  className="group-hover:stroke-primary/40 transition-colors duration-500"
                />
                <path 
                  d="M 150 80 L 250 80" 
                  stroke="#e2e8f0" 
                  strokeWidth="2"
                  className="group-hover:stroke-primary/40 transition-colors duration-500"
                />
                <path 
                  d="M 150 80 L 250 120" 
                  stroke="#e2e8f0" 
                  strokeWidth="2"
                  className="group-hover:stroke-primary/40 transition-colors duration-500"
                />

                {/* Animated Pulsing Signal dashes */}
                <path 
                  d="M 50 80 L 150 80 L 250 40" 
                  stroke="#0046a1" 
                  strokeWidth="2.5" 
                  strokeDasharray="10 120" 
                  strokeDashoffset="0"
                  className="animate-[dash_3s_linear_infinite]" 
                />
                <path 
                  d="M 150 80 L 250 120" 
                  stroke="#0046a1" 
                  strokeWidth="2.5" 
                  strokeDasharray="10 120" 
                  strokeDashoffset="30"
                  className="animate-[dash_3s_linear_infinite]" 
                />

                {/* Left QR Code Node */}
                <g className="cursor-pointer">
                  <circle cx="50" cy="80" r="22" fill="#0046a1" fillOpacity="0.08" stroke="#0046a1" strokeWidth="1.5" />
                  <rect x="42" y="72" width="16" height="16" rx="2" fill="none" stroke="#0046a1" strokeWidth="2" />
                  <rect x="46" y="76" width="8" height="8" fill="#0046a1" />
                </g>

                {/* Center Routing Server Node */}
                <g className="group-hover:scale-105 transition-transform duration-500 origin-[150px_80px]">
                  <circle cx="150" cy="80" r="26" fill="#001B50" />
                  <path d="M 142 80 L 158 80" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 150 72 L 150 88" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <Shuffle className="w-5 h-5 text-white absolute" style={{ transform: 'translate(140px, 70px)' }} />
                </g>

                {/* Right Target Destinations */}
                <g className="group-hover:translate-x-1 transition-transform duration-500">
                  {/* Dest 1 (URL) */}
                  <rect x="234" y="28" width="50" height="24" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" className="group-hover:stroke-primary/50 transition-colors" />
                  <text x="259" y="43" textAnchor="middle" fill="#001B50" fontSize="9" fontWeight="bold" fontFamily="sans-serif">URL</text>

                  {/* Dest 2 (WiFi) */}
                  <rect x="234" y="68" width="50" height="24" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" className="group-hover:stroke-primary/50 transition-colors" />
                  <text x="259" y="83" textAnchor="middle" fill="#001B50" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Wi-Fi</text>

                  {/* Dest 3 (Lead Form) */}
                  <rect x="234" y="108" width="50" height="24" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" className="group-hover:stroke-primary/50 transition-colors" />
                  <text x="259" y="123" textAnchor="middle" fill="#001B50" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Leads</text>
                </g>
              </svg>

              {/* Glowing overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-transparent pointer-events-none" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#001B50] flex items-center gap-2 group-hover:text-primary transition-colors">
                <Cpu className="w-5 h-5 text-primary" />
                <span>Dynamic Redirect Routing</span>
              </h3>
              
              <p className="text-slate-600 text-sm leading-relaxed">
                Change your QR destination URL, WiFi network, email parameters, or digital product files anytime without re-printing. Maintain routing consistency with 99.9% uptime.
              </p>
            </div>
          </div>

          {/* Card 2: Premium Styling Customizer */}
          <div className={`group bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between h-full relative overflow-hidden transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          } delay-200`}>
            
            {/* Customizer Slider Mock */}
            <div className="relative h-48 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden mb-6 p-4">
              <div className="w-full space-y-3 px-4">
                {/* Foreground color picker */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>FOREGROUND GRADIENT</span>
                    <span className="text-primary">#0046A1 → #001B50</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full w-[70%] bg-gradient-to-r from-primary to-secondary rounded-full group-hover:w-[85%] transition-all duration-700" />
                  </div>
                </div>

                {/* Dot pattern switchers */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 block">QR DOT FORMAT</span>
                  <div className="flex gap-2">
                    <span className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">■</span>
                    <span className="w-6 h-6 rounded bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] text-slate-600 font-bold group-hover:bg-primary/20 group-hover:border-primary/30 group-hover:text-primary transition-all duration-500">●</span>
                    <span className="w-6 h-6 rounded bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] text-slate-600 font-bold">◆</span>
                    <span className="w-6 h-6 rounded bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] text-slate-600 font-bold">▲</span>
                  </div>
                </div>

                {/* Center logo toggle switch */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-500">EMBED BRAND LOGO</span>
                  <div className="w-8 h-4 rounded-full bg-slate-200 relative cursor-pointer group-hover:bg-primary/30 transition-colors">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-400 absolute left-0.5 top-0.5 group-hover:bg-primary group-hover:translate-x-3.5 transition-all duration-500 shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Glowing overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-transparent pointer-events-none" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#001B50] flex items-center gap-2 group-hover:text-primary transition-colors">
                <Settings className="w-5 h-5 text-primary" />
                <span>Premium Styling Customizer</span>
              </h3>
              
              <p className="text-slate-600 text-sm leading-relaxed">
                Brand your assets with custom corner elements, custom shapes, and gradients. Smoothly insert logos inside the QR pattern using automatic high error correction keys.
              </p>
            </div>
          </div>

          {/* Card 3: Advanced Scan Analytics */}
          <div className={`group bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between h-full relative overflow-hidden transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          } delay-300`}>
            
            {/* Analytics Visual Represent */}
            <div className="relative h-48 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden mb-6 p-4">
              <div className="w-full flex items-end justify-between px-6 h-28 relative">
                
                {/* SVG bar representation */}
                <div className="w-8 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-slate-200 rounded-lg h-12 group-hover:bg-primary/25 transition-all duration-500" />
                  <span className="text-[8px] font-bold text-slate-400">MON</span>
                </div>
                <div className="w-8 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-slate-200 rounded-lg h-16 group-hover:bg-primary/35 transition-all duration-500" />
                  <span className="text-[8px] font-bold text-slate-400">TUE</span>
                </div>
                <div className="w-8 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-slate-200 rounded-lg h-10 group-hover:bg-primary/25 transition-all duration-500" />
                  <span className="text-[8px] font-bold text-slate-400">WED</span>
                </div>
                <div className="w-8 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-primary/70 rounded-lg h-24 group-hover:h-[105px] transition-all duration-500 shadow-sm relative overflow-hidden">
                    {/* Glow inside active bar */}
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <span className="text-[8px] font-bold text-primary">THU</span>
                </div>
                <div className="w-8 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-slate-200 rounded-lg h-14 group-hover:bg-primary/45 transition-all duration-500" />
                  <span className="text-[8px] font-bold text-slate-400">FRI</span>
                </div>

                {/* Tooltip Overlay */}
                <div className="absolute top-2 right-12 bg-[#001B50] text-white text-[9px] font-bold py-1 px-2.5 rounded-lg shadow-md group-hover:-translate-y-1 transition-transform duration-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>+412 Scans</span>
                </div>
              </div>

              {/* Glowing overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-transparent pointer-events-none" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[#001B50] flex items-center gap-2 group-hover:text-primary transition-colors">
                <BarChart2 className="w-5 h-5 text-primary" />
                <span>Sub-Second Scan Analytics</span>
              </h3>
              
              <p className="text-slate-600 text-sm leading-relaxed">
                Log real-time campaign referrals, device system logs, browser configurations, geographic scan metrics, unique reader metrics, and client-collected leads in one dashboard.
              </p>
            </div>
          </div>

        </div>

        {/* Dynamic bottom details container */}
        <div className={`mt-20 max-w-4xl mx-auto border-t border-slate-200/80 pt-10 text-center transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } delay-400`}>
          <p className="text-slate-500 text-sm leading-relaxed max-w-3xl mx-auto">
            QR Junction enables you to deploy professional vector assets instantly. Whether launching print marketing campaigns, collecting lead subscribers, managing guest office Wi-Fi, or sharing business portfolios, enjoy complete reliability, sub-second latency routing, and high-fidelity output.
          </p>
        </div>
      </div>

      {/* Styled inline animation keyframes */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -130;
          }
        }
      `}</style>
    </section>
  );
}
