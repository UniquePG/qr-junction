import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QuickQRCard from "@/components/QuickQRCard";
import BlogSection from "@/components/sections/BlogSection";
import Features from "@/components/sections/Features";
import HomeKnowledge from "@/components/sections/HomeKnowledge";
import PlatformExplanation from "@/components/sections/PlatformExplanation";
import UseCases from "@/components/sections/UseCases";
import { PageViewTracker } from "@/hooks/usePageView";
import { HOME_FAQS, HOME_HOW_TO } from "@/lib/homeSeo";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function Home() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to create a free QR code",
    description:
      "Create a free QR code for a website, Wi-Fi network, vCard, WhatsApp chat, or menu, then download PNG or SVG.",
    step: HOME_HOW_TO.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.title,
      text: step.text,
    })),
  };

  return (
    <div className="min-h-screen bg-white text-slate-700 relative overflow-x-clip">
      <PageViewTracker />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-1/12 w-[400px] h-[400px] bg-[#001B50]/5 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Free QR code generator · Made in India
              </p>
              <h1 className="text-4xl sm:text-[48px] font-bold text-[#001B50] tracking-tight leading-tight sm:leading-[56px]">
                Free QR Code Generator for Your Website, Wi-Fi, and Shop
              </h1>

              <p className="text-slate-700 text-base sm:text-lg leading-[28px] max-w-2xl mx-auto lg:mx-0">
                QR Junction is a free QR code generator. You paste a website, Wi-Fi
                password, WhatsApp number, or menu link, customise the design, and
                download a PNG or SVG. iPhone and Android cameras scan it — no extra
                app. Static codes need no signup; tracking lives in the dashboard if
                you want it.
              </p>

              <p className="text-sm text-slate-500">
                By the{" "}
                <Link href="/about" className="text-primary font-semibold hover:underline">
                  QR Junction team
                </Link>
                {" · "}
                <Link href="/changelog" className="hover:underline">
                  Updated 28 Oct 2026
                </Link>
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

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <QuickQRCard />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20 space-y-24">
          <PlatformExplanation />
          <UseCases />
          <Features />
        </div>

        <HomeKnowledge />
        <BlogSection />
      </main>

      <Footer />

      <Script id="structured-data-faq" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script id="structured-data-howto" type="application/ld+json">
        {JSON.stringify(howToJsonLd)}
      </Script>
    </div>
  );
}
