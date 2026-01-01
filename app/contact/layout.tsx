import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | QR Junction - QR Code Generator',
  description: 'Get in touch with QR Junction. Contact us for support, questions, feedback, or business inquiries about our free QR code generator.',
  keywords: 'contact QR Junction, QR code generator support, QR Junction help, customer support',
  openGraph: {
    title: 'Contact Us | QR Junction',
    description: 'Get in touch with QR Junction. Contact us for support, questions, or feedback.',
    url: 'https://www.qrjunction.in/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

