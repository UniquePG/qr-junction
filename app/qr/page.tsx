import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QrPageKnowledge from "@/components/qr/QrPageKnowledge";
import { QR_PAGE_FAQS } from "@/lib/qrPageSeo";
import Script from "next/script";
import QrDesignerClient from "./QrDesignerClient";

export default function QRPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QR_PAGE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#001B50]/5 blur-[130px] pointer-events-none" />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 relative z-10">
        <div className="text-center lg:text-left max-w-3xl mb-8 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            QR code maker · No signup
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#001B50] tracking-tight leading-tight mb-3">
            QR Code Maker — Custom QR Code with Logo, No Signup
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Create a custom QR code with logo, then set colours and frames. This QR
            code maker needs no signup for static codes. Download PNG or SVG and
            scan-test before you print.
          </p>
        </div>

        <QrDesignerClient />
        <QrPageKnowledge />
      </main>

      <Footer />

      <Script id="structured-data-qr-faq" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
    </div>
  );
}
