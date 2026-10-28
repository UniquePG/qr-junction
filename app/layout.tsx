import { AuthProvider } from "@/components/AuthContext";
import { ToastProvider } from "@/components/ToastProvider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/homeSeo";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  keywords: "free QR code generator, create QR code online, custom QR codes, URL QR code, WiFi QR code, vCard QR code, social media QR code, QR code maker, dynamic QR codes, QR Junction",
  authors: [{ name: "QR Junction", url: "https://www.qrjunction.in/about" }],
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
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "https://www.qrjunction.in/",
    images: [
      {
        url: "https://www.qrjunction.in/NewLogo/logo-192x192.png",
        width: 192,
        height: 192,
        alt: "QR Junction - Free QR Code Generator Tool",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["https://www.qrjunction.in/NewLogo/logo-192x192.png"],
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
        <link rel="icon" href="/NewLogo/favicon_white.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="16x16" href="/NewLogo/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/NewLogo/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/NewLogo/apple-touch-icon.png" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" href="https://www.qrjunction.in/sitemap.xml" />
        <link rel="author" href="https://www.qrjunction.in/about" />
        
        {/* Language and Geographic Targeting */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        
        {/* Stylesheets and Performance */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <Script id="structured-data-webapp" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "QR Junction",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "All",
            "url": "https://www.qrjunction.in/",
            "description": "QR Junction is a free QR code generator and tracking platform for URLs, Wi-Fi, vCards, WhatsApp, PDFs, restaurant menus, and Google reviews.",
            "image": "https://www.qrjunction.in/NewLogo/logo-192x192.png",
            "author": {
              "@type": "Organization",
              "name": "QR Junction",
              "url": "https://www.qrjunction.in/about",
            },
          })}
        </Script>
        <Script id="structured-data-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "QR Junction",
            "legalName": "QR Junction",
            "url": "https://www.qrjunction.in/",
            "logo": "https://www.qrjunction.in/NewLogo/logo-192x192.png",
            "description": "QR Junction is a free QR code generator built in India. You create website, Wi-Fi, vCard, WhatsApp, PDF, menu, and Google Review QR codes and download PNG or SVG.",
            "email": "qrjunction1@gmail.com",
            "areaServed": "IN",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN",
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "email": "qrjunction1@gmail.com",
              "availableLanguage": ["English", "Hindi"],
            },
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
            "name": "QR Junction",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web",
            "url": "https://www.qrjunction.in/",
            "description": "QR Junction is a free QR code generator for URLs, Wi-Fi, contacts, social profiles, PDFs, and menus, with optional scan tracking.",
            "image": "https://www.qrjunction.in/NewLogo/logo-192x192.png",
            "author": {
              "@type": "Organization",
              "name": "QR Junction",
              "url": "https://www.qrjunction.in/about",
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
            },
          })}
        </Script>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <ToastProvider />
        <Analytics />
      </body>
    </html>
  );
}
