import { ToastProvider } from "@/components/ToastProvider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Free QR Code Generator | Create Custom QR Codes - QR Junction",
  description: "Generate free QR codes instantly for URLs, WiFi, contacts, social media & more. Easy-to-use tool with customization options. No registration required.",
  keywords: "free QR code generator, create QR code online, custom QR codes, URL QR code, WiFi QR code, vCard QR code, social media QR code, QR code maker, dynamic QR codes, QR Junction",
  authors: [{ name: "QR Junction" }],
  creator: "QR Junction",
  publisher: "QR Junction",
  metadataBase: new URL("https://www.qrjunction.in"),
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "QR Junction",
    title: "Free QR Code Generator | Create Custom QR Codes - QR Junction",
    description: "Generate free QR codes instantly for URLs, WiFi, contacts, social media & more. Easy-to-use tool with customization options.",
    url: "https://www.qrjunction.in/",
    images: [
      {
        url: "https://www.qrjunction.in/assests/og-image.png",
        width: 1200,
        height: 630,
        alt: "QR Junction - Free QR Code Generator Tool",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free QR Code Generator | Create Custom QR Codes - QR Junction",
    description: "Generate free QR codes instantly for URLs, WiFi, contacts, social media & more. Easy-to-use tool with customization options.",
    images: ["https://www.qrjunction.in/assests/og-image.png"],
  },
  alternates: {
    canonical: "https://www.qrjunction.in/",
  },
  verification: {
    google: "G-HK32BH5KGT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon and Icons */}
        <link rel="icon" href="/assests/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assests/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assests/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/assests/apple-touch-icon.png" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" href="https://www.qrjunction.in/sitemap.xml" />
        
        {/* Language and Geographic Targeting */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        
        {/* Stylesheets and Performance */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <Script id="structured-data-webapp" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "QR Junction",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "All",
            "url": "https://www.qrjunction.in/",
            "description": "Free online QR code generator tool to create custom QR codes for URLs, WiFi, contacts, social media, and more with instant download.",
            "image": "https://www.qrjunction.in/assests/screenshot.png",
          })}
        </Script>
        <Script id="structured-data-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "QR Junction",
            "url": "https://www.qrjunction.in/",
            "logo": "https://www.qrjunction.in/assests/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "email": "uniquetechexplorer7@gmail.com",
            },
          })}
        </Script>
        <Script id="structured-data-faq" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I create a QR code for free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your URL, text, or information in the generator, customize the size of qr code if desired, and click generate. Download your QR code instantly for free.",
                },
              },
              {
                "@type": "Question",
                "name": "What types of QR codes can I create?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can create QR codes for URLs, WiFi credentials, contact information (vCard), email, SMS, social media profiles, and plain text.",
                },
              },
            ],
          })}
        </Script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-HK32BH5KGT"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HK32BH5KGT');
          `}
        </Script>
        <Script id="structured-data-software" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Ultimate QR Code Generator",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web",
            "url": "https://www.qrjunction.in/",
            "description": "Free online QR code generator tool to create custom QR codes for URLs, WiFi, contacts, social media, and more with instant download.",
            "image": "https://www.qrjunction.in/assests/og-image.png",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
          })}
        </Script>
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
        <ToastProvider />
        <Analytics />
      </body>
    </html>
  );
}
