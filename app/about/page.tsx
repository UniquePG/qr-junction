import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PageViewTracker } from "@/hooks/usePageView";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "About QR Junction | Free QR Code Generator from India",
  description:
    "QR Junction is a free QR code generator built in India. Learn who writes the guides, how we handle static vs dynamic codes, and how to contact the team.",
  alternates: { canonical: "https://www.qrjunction.in/about" },
  openGraph: {
    title: "About QR Junction",
    description:
      "QR Junction is a free QR code generator and tracking platform for websites, Wi-Fi, vCards, menus, and Google reviews.",
    url: "https://www.qrjunction.in/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageViewTracker />
      <Script id="about-org-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About QR Junction",
          url: "https://www.qrjunction.in/about",
          mainEntity: {
            "@type": "Organization",
            name: "QR Junction",
            url: "https://www.qrjunction.in/",
            email: "qrjunction1@gmail.com",
            address: { "@type": "PostalAddress", addressCountry: "IN" },
          },
        })}
      </Script>
      <div className="min-h-screen bg-white text-slate-700">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            About
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-6">
            QR Junction is a free QR code generator built in India
          </h1>
          <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
            QR Junction is the team behind qrjunction.in. We build a browser tool so you can
            create a URL, Wi-Fi, vCard, WhatsApp, PDF, restaurant menu, or Google Review QR,
            customise it, and download PNG or SVG. Static codes need no account. Dynamic codes,
            scan analytics, digital menus, and review flows live in the dashboard after you
            sign up.
          </p>
          <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
            The homepage, generator pages, and{" "}
            <Link href="/blog" className="text-primary font-semibold hover:underline">
              blog
            </Link>{" "}
            are written by the QR Junction team — people who ship the product, not a rented
            byline. When we cite a standard we link it:{" "}
            <a
              href="https://www.iso.org/standard/62021.html"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ISO/IEC 18004
            </a>{" "}
            for the QR format, plus how Apple Camera and Android Camera actually scan in the
            wild.
          </p>
          <h2 className="text-2xl font-bold text-[#001B50] mt-10 mb-3">What you can hold us to</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-8">
            <li>No watermark on free static downloads.</li>
            <li>Instructions that name the generator type (Wi-Fi is not a website).</li>
            <li>
              Public{" "}
              <Link href="/changelog" className="text-primary font-semibold hover:underline">
                changelog
              </Link>{" "}
              when the product changes.
            </li>
            <li>
              Support via{" "}
              <Link href="/contact" className="text-primary font-semibold hover:underline">
                contact
              </Link>{" "}
              or qrjunction1@gmail.com.
            </li>
          </ul>
          <p className="text-sm text-slate-500">
            Last updated 28 October 2026.{" "}
            <Link href="/privacy-policy" className="hover:underline">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
          </p>
        </main>
        <Footer />
      </div>
    </>
  );
}
