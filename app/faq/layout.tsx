import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | QR Junction - QR Code Generator',
  description: 'Find answers to common questions about QR Junction - the free QR code generator. Learn how to create QR codes, customize them, and use them for various purposes.',
  keywords: 'QR code FAQ, QR code questions, QR code generator help, QR code tutorial, QR Junction FAQ',
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | QR Junction',
    description: 'Find answers to common questions about QR Junction - the free QR code generator.',
    url: 'https://www.qrjunction.in/faq',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

