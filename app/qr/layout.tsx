import { QR_PAGE_DESCRIPTION, QR_PAGE_TITLE } from "@/lib/qrPageSeo";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: QR_PAGE_TITLE,
  description: QR_PAGE_DESCRIPTION,
  keywords:
    "QR code maker, QR code maker no signup, create QR code online, custom QR code, QR code with logo, free QR code generator",
  openGraph: {
    title: QR_PAGE_TITLE,
    description: QR_PAGE_DESCRIPTION,
    url: "https://www.qrjunction.in/qr",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: QR_PAGE_TITLE,
    description: QR_PAGE_DESCRIPTION,
  },
  alternates: {
    canonical: "https://www.qrjunction.in/qr",
  },
};

export default function QrLayout({ children }: { children: ReactNode }) {
  return children;
}
