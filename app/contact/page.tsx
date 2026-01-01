import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import HelpSection from '@/components/contact/HelpSection';
import { PageViewTracker } from '@/hooks/usePageView';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Contact Us | QR Junction - QR Code Generator',
  description: 'Get in touch with QR Junction for support, questions, or feedback. We\'re here to help with your QR code generator needs.',
  keywords: 'contact QR Junction, QR code generator support, customer service, help center, QR Junction contact',
  openGraph: {
    title: 'Contact Us | QR Junction',
    description: 'Get in touch with QR Junction for support, questions, or feedback.',
    url: 'https://www.qrjunction.in/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | QR Junction',
    description: 'Get in touch with QR Junction for support, questions, or feedback.',
  },
  alternates: {
    canonical: 'https://www.qrjunction.in/contact',
  },
};

export default function ContactPage() {
  return (
    <>
      <Script id="breadcrumb-schema-contact" type="application/ld+json">
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
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Contact",
              "item": "https://www.qrjunction.in/contact",
            },
          ],
        })}
      </Script>
      <PageViewTracker />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-6 sm:py-8">
          <Header />
          
          <div className="max-w-6xl mx-auto mt-6 sm:mt-8">
            <div className="text-center mb-8 sm:mb-12 pb-4 sm:pb-6 border-b-2 border-slate-200">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 sm:mb-3">
                Contact Us
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                We&apos;d love to hear from you. Get in touch with us!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
              <ContactInfo />
              <ContactForm />
            </div>

            <HelpSection />
          </div>
        </div>

        <Footer />
      </div>
      <Script id="contact-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact QR Junction',
          description: 'Get in touch with QR Junction for support, questions, or feedback',
          url: 'https://www.qrjunction.in/contact',
          mainEntity: {
            '@type': 'Organization',
            name: 'QR Junction',
            email: 'uniquetechexplorer7@gmail.com',
            url: 'https://www.qrjunction.in/',
          },
        })}
      </Script>
    </>
  );
}

