import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuickQRCard from '@/components/QuickQRCard';
import BlogSection from '@/components/sections/BlogSection';
import Features from '@/components/sections/Features';
import PlatformExplanation from '@/components/sections/PlatformExplanation';
import UseCases from '@/components/sections/UseCases';
import { PageViewTracker } from '@/hooks/usePageView';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white relative overflow-hidden">
      <PageViewTracker />
      
      {/* Background decoration grid and blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1524_1px,transparent_1px),linear-gradient(to_bottom,#0e1524_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[5%] right-[-15%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Floating navigation header */}
      <Header />

      {/* Hero landing container */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dynamic QR Infrastructure Platform</span>
              </div> */}
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] sm:leading-none">
                Turn Every QR Code Into a{' '}
                <span className="bg-gradient-to-r from-primary via-slate-100 to-secondary bg-clip-text text-transparent">
                  Business Asset
                </span>
              </h1>
              
              <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Establish an offline-to-online marketing pipeline. Generate fully custom vector designs, track scan statistics, resolution metrics, and geolocation coordinates in real-time, and update destinations instantly after printing.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/register"
                  className="gradient-primary hover:opacity-95 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-primary hover:shadow-primary-hover hover:-translate-y-0.5 transition-all text-center no-underline"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/qr"
                  className="bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-all text-center flex items-center justify-center gap-2 no-underline"
                >
                  <span>Customize QR Design</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Hero Card Widget */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <QuickQRCard />
            </div>

          </div>
        </div>

        {/* Feature section displays */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <PlatformExplanation />
          <UseCases />
          <Features />
        </div>

        {/* Blog lists */}
        <BlogSection />
      </main>

      {/* Landing footer */}
      <Footer />
    </div>
  );
}
