"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QRGenerator from "@/components/QRGenerator";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function QRGeneratorWrapper() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url") || undefined;

  return <QRGenerator initialUrl={urlParam} />;
}

export default function QRPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-hidden">
      {/* Background grid + glow blobs (matches homepage) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#001B50]/5 blur-[130px] pointer-events-none" />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-12 relative z-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 text-sm">
                Initializing customizer engine...
              </p>
            </div>
          }
        >
          <QRGeneratorWrapper />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
