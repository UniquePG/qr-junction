import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PageViewTracker } from "@/hooks/usePageView";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog | QR Junction product updates",
  description:
    "What changed in QR Junction: generator pages, restaurant menus, Google review QRs, analytics, and SEO docs. Dated product notes from the team in India.",
  alternates: { canonical: "https://www.qrjunction.in/changelog" },
};

const ENTRIES: { date: string; title: string; body: string }[] = [
  {
    date: "2026-10-28",
    title: "Homepage SEO, robots.txt, and llms.txt",
    body: "Published /robots.txt and /llms.txt, shortened the homepage title, added an on-page FAQ with schema, how-to steps, About, and this changelog so crawlers and answer engines can cite a living page.",
  },
  {
    date: "2026-10-26",
    title: "Dedicated generator landing pages",
    body: "Rewrote URL, vCard, PDF, Wi-Fi, App Store, Image, Video, and Google Review generator pages with unique guides, print sizes, and FAQs. Footer now lists the high-search generators.",
  },
  {
    date: "2026-10-24",
    title: "Restaurant menu layouts and admin",
    body: "Added more customer-menu themes, AI-assisted dish flows, guest QR tracking, and admin analytics. Password reset and email OTP signup shipped the same week.",
  },
  {
    date: "2026-07-08",
    title: "Review suite insights",
    body: "Google review QR flows gained weekly summary insights so shops can see what diners actually wrote.",
  },
  {
    date: "2026-06-14",
    title: "Restaurant QR suite and customisation",
    body: "Launched menu-wise QR codes, the restaurant menu manager, richer QR styling, and split review / landing-page QR types out of the generic generator.",
  },
  {
    date: "2026-06-05",
    title: "Per-type QR landing pages",
    body: "Each generator type (Instagram, WhatsApp, Wi-Fi, and others) got its own URL, meta tags, and social-themed presets.",
  },
  {
    date: "2026-06-02",
    title: "Auth and dynamic QR",
    body: "Accounts, dashboard, and dynamic QR codes with editable destinations went live alongside a full public-site redesign.",
  },
];

export default function ChangelogPage() {
  return (
    <>
      <PageViewTracker />
      <div className="min-h-screen bg-white text-slate-700">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Freshness
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-4">
            QR Junction changelog
          </h1>
          <p className="text-[17px] leading-relaxed text-slate-600 mb-10">
            Dated notes from the{" "}
            <Link href="/about" className="text-primary font-semibold hover:underline">
              QR Junction team
            </Link>
            . This is how we keep the product page honest when features move.
          </p>
          <ol className="space-y-8 list-none p-0 m-0 border-l-2 border-slate-200 pl-6">
            {ENTRIES.map((entry) => (
              <li key={entry.date + entry.title} className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white shadow" />
                <time className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {entry.date}
                </time>
                <h2 className="text-xl font-bold text-[#001B50] mt-1 mb-2">{entry.title}</h2>
                <p className="text-slate-600 leading-relaxed">{entry.body}</p>
              </li>
            ))}
          </ol>
        </main>
        <Footer />
      </div>
    </>
  );
}
