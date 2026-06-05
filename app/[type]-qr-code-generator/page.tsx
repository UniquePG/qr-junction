import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QRGenerator from "@/components/QRGenerator";
import { qrLandingContent } from "@/lib/qrLandingContent";
import { CheckCircle2, ChevronRight, HelpCircle, Loader2, Sparkles, Zap } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: {
    type: string;
  };
}

// Generate metadata dynamically for SEO
export function generateMetadata({ params }: PageProps): Metadata {
  const content = qrLandingContent[params.type];
  if (!content) {
    return {
      title: "QR Code Generator",
      description: "Generate free QR codes easily.",
    };
  }

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

// Static params for SSG (Server-Side Generation)
export function generateStaticParams() {
  return Object.keys(qrLandingContent).map((type) => ({
    type: type,
  }));
}

export default function DynamicQRLandingPage({ params }: PageProps) {
  const content = qrLandingContent[params.type];

  // If the user tries a URL that doesn't exist in our map
  if (!content) {
    notFound();
  }

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden font-sans">
      {/* Background aesthetics (matches home page) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none mt-4" />
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#001B50]/5 blur-[150px] pointer-events-none" />

      <Header />

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* HERO SECTION */}
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Icon className="w-4 h-4" />
              <span>{content.type.toUpperCase()} QR CODE GENERATOR</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#001B50] tracking-tight mb-6 leading-[1.15]">
              {content.heroHeading}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
              {content.heroSubheading}
            </p>
            
            <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 inline-flex items-center gap-4 text-left shadow-sm max-w-3xl mx-auto">
              <div className="bg-amber-100 p-3 rounded-full shrink-0">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Did you know?</p>
                <p className="text-sm text-slate-600 leading-snug">{content.fact}</p>
              </div>
            </div>
          </div>

          {/* QR GENERATOR TOOL */}
          <div className="mb-24 relative">
             <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent rounded-[2.5rem] -z-10 blur-xl opacity-50" />
             <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-slate-500 text-sm font-medium">
                    Loading generator engine...
                  </p>
                </div>
              }
            >
              <QRGenerator initialTab={content.tabType} />
            </Suspense>
          </div>

          {/* CONTENT SECTION: USE CASES & BENEFITS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            
            {/* Use Cases */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold">
                <Zap className="w-4 h-4" />
                Popular Use Cases
              </div>
              <h2 className="text-3xl font-extrabold text-[#001B50]">
                How to use a {content.type.toUpperCase()} QR Code
              </h2>
              
              <div className="space-y-4">
                {content.useCases.map((useCase, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                      {useCase.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed pl-7">
                      {useCase.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Key Benefits
              </div>
              <h2 className="text-3xl font-extrabold text-[#001B50]">
                Why choose this QR format?
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {content.benefits.map((benefit, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px]" />
                    <h3 className="text-lg font-bold text-[#001B50] mb-2 relative z-10">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed relative z-10">
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* FAQ SECTION */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#001B50]">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="space-y-4">
              {content.faq.map((item, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    {item.q}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
