import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PricingBoard from "@/components/billing/PricingBoard";
import { PageViewTracker } from "@/hooks/usePageView";
import { prisma } from "@/lib/prisma";
import { ensureCatalog } from "@/lib/billing/seed";
import type { Metadata } from "next";
import Script from "next/script";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing | QR Junction",
  description: "Compare Free, Starter, and Growth plans for QR codes, digital menus, table orders, and review collection. Prices in rupees.",
  alternates: { canonical: "https://www.qrjunction.in/pricing" },
  openGraph: {
    title: "QR Junction pricing",
    description: "Account plans for QR codes, menus, and reviews. Prices in rupees.",
    url: "https://www.qrjunction.in/pricing",
    type: "website",
  },
};

export default async function PricingPage() {
  await ensureCatalog();
  const plans = await prisma.plan.findMany({
    where: { scope: "ACCOUNT", isPublic: true, active: true },
    orderBy: { sortOrder: "asc" },
  });
  const cards = plans.map((plan) => ({
    code: plan.code,
    name: plan.name,
    monthlyPricePaise: plan.monthlyPricePaise,
    yearlyPricePaise: plan.yearlyPricePaise,
    graceDays: plan.graceDays,
    highlights: plan.highlights,
    limits: [],
  }));

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F4F7FC_0%,#F7F8FB_40%,#EEF2F8_100%)] text-slate-700">
      <PageViewTracker />
      <Script id="pricing-offers" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "QR Junction",
          applicationCategory: "BusinessApplication",
          offers: cards.map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            price: plan.monthlyPricePaise / 100,
            priceCurrency: "INR",
          })),
        })}
      </Script>
      <Header />
      <main>
        <PricingBoard plans={cards} />
      </main>
      <Footer />
    </div>
  );
}
