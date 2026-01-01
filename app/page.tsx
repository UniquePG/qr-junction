import Footer from '@/components/Footer';
import Header from '@/components/Header';
import QRGenerator from '@/components/QRGenerator';
import Features from '@/components/sections/Features';
import PlatformExplanation from '@/components/sections/PlatformExplanation';
import UseCases from '@/components/sections/UseCases';
import { PageViewTracker } from '@/hooks/usePageView';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free QR Code Generator | Create Custom QR Codes - QR Junction',
  description: 'Generate free QR codes instantly for URLs, WiFi, contacts, social media & more. Easy-to-use tool with customization options. No registration required.',
  keywords: 'free QR code generator, create QR code online, custom QR codes, URL QR code, WiFi QR code, vCard QR code, social media QR code, QR code maker, dynamic QR codes, QR Junction',
  openGraph: {
    title: 'Free QR Code Generator | Create Custom QR Codes - QR Junction',
    description: 'Generate free QR codes instantly for URLs, WiFi, contacts, social media & more. Easy-to-use tool with customization options.',
    url: 'https://www.qrjunction.in/',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.qrjunction.in/',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.qrjunction.in/",
            },
          ],
        })}
      </Script>
      <PageViewTracker />
      <div className="container mx-auto px-4 md:px-6 py-6 sm:py-8">
        <Header />
        <QRGenerator />
        <PlatformExplanation />
        <UseCases />
        <Features />
      </div>
      <Footer />
    </div>
  );
}
