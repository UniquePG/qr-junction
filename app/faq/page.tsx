import Footer from '@/components/Footer';
import Header from '@/components/Header';
import FAQList from '@/components/faq/FAQList';
import { faqs } from '@/data/faqs';
import { PageViewTracker } from '@/hooks/usePageView';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import React from 'react';

export const metadata: Metadata = {
  title: 'FAQ | Frequently Asked Questions - QR Junction',
  description: 'Find answers to common questions about QR Junction QR code generator. Learn how to create, customize, and use QR codes for free.',
  keywords: 'QR code generator FAQ, QR code questions, QR Junction help, how to create QR codes, QR code generator guide, QR code generator tutorial',
  openGraph: {
    title: 'FAQ | Frequently Asked Questions - QR Junction',
    description: 'Find answers to common questions about QR Junction QR code generator.',
    url: 'https://www.qrjunction.in/faq',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Frequently Asked Questions - QR Junction',
    description: 'Find answers to common questions about QR Junction QR code generator.',
  },
  alternates: {
    canonical: 'https://www.qrjunction.in/faq',
  },
};

// Type guard to check if a value is a React element
function isReactElement(value: unknown): value is React.ReactElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'props' in value
  );
}

// Helper function to extract plain text from React nodes for structured data
function extractTextFromReactNode(node: React.ReactNode): string {
  if (typeof node === 'string') {
    return node;
  }
  
  if (typeof node === 'number') {
    return String(node);
  }
  
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join(' ').trim();
  }
  
  if (isReactElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props.children) {
      return extractTextFromReactNode(props.children);
    }
  }
  
  return '';
}

export default function FAQPage() {
  // Extract plain text from FAQ answers for structured data
  const getPlainText = (answer: React.ReactNode): string => {
    const extracted = extractTextFromReactNode(answer);
    return extracted || '';
  };

  return (
    <>
      <PageViewTracker />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-6 sm:py-8">
          <Header />
          
          <div className="max-w-4xl mx-auto mt-6 sm:mt-8">
            <div className="text-center mb-8 sm:mb-12 pb-4 sm:pb-6 border-b-2 border-slate-200">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 sm:mb-3">
                Frequently Asked Questions
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                Find answers to common questions about QR Junction
              </p>
            </div>

            <FAQList faqs={faqs} />

            <div className="mt-12 sm:mt-16 text-center p-6 sm:p-10 bg-slate-50 rounded-lg">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4">
                Still have questions?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                If you couldn&apos;t find the answer you&apos;re looking for, feel free to{' '}
                <Link href="/contact" className="text-primary hover:underline font-semibold">
                  contact us
                </Link>{' '}
                and we&apos;ll be happy to help!
              </p>
              <Link
                href="/"
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 gradient-primary text-white rounded-lg font-semibold text-base sm:text-lg shadow-primary hover:-translate-y-0.5 hover:shadow-primary-hover transition-all"
              >
                <i className="fas fa-qrcode mr-2"></i>Generate QR Code Now
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: getPlainText(faq.answer) || faq.question,
            },
          })),
        })}
      </Script>
      <Script id="breadcrumb-schema-faq" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.qrjunction.in/',
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'FAQ',
              'item': 'https://www.qrjunction.in/faq',
            },
          ],
        })}
      </Script>
    </>
  );
}

