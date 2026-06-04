import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QuickQRCard from "@/components/QuickQRCard";
import BlogSection from "@/components/sections/BlogSection";
import Features from "@/components/sections/Features";
import PlatformExplanation from "@/components/sections/PlatformExplanation";
import UseCases from "@/components/sections/UseCases";
import { PageViewTracker } from "@/hooks/usePageView";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-700 relative overflow-x-clip">
      <PageViewTracker />

      {/* Background decoration grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Radial halo background glows */}
      <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-1/12 w-[400px] h-[400px] bg-[#001B50]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating navigation header */}
      <Header />

      {/* Hero landing container */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-[48px] font-bold text-[#001B50] tracking-tight leading-tight sm:leading-[56px]">
                Turn Every QR Code Into a{" "}
                <span className="bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent px-2">
                  Business Asset
                </span>
              </h1>

              <p className="text-slate-650 text-base leading-[26px] max-w-2xl mx-auto lg:mx-0">
                Establish an offline-to-online marketing pipeline. Generate
                fully custom vector designs, track scan statistics, resolution
                metrics, and geolocation coordinates in real-time, and update
                destinations instantly after printing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm h-[44px] px-6 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all text-center flex items-center justify-center no-underline border-none"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/qr"
                  className="bg-transparent border border-[#001B50]/20 text-[#001B50] hover:text-[#001B50] hover:bg-[#001B50]/5 font-semibold text-sm h-[44px] px-6 rounded-xl transition-all text-center flex items-center justify-center gap-2 no-underline"
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
        <div className="max-w-7xl mx-auto px-6 pb-20 space-y-24">
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
