import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Editable QR Codes | Changeable QR Code Link - QR Junction",
  description:
    "Create editable QR codes with a changeable QR code link. Track QR code scans from the dashboard after print. Static QR codes stay free with no signup.",
  keywords:
    "editable QR code, changeable QR code link, track QR code scans, create editable QR codes, edit QR code after printing, dynamic QR code, QR Junction register",
  openGraph: {
    title: "Create Editable QR Codes | Changeable QR Code Link - QR Junction",
    description:
      "Create editable QR codes with a changeable QR code link. Update the destination after print and track scans.",
    url: "https://www.qrjunction.in/register",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Editable QR Codes | Changeable QR Code Link - QR Junction",
    description:
      "Create editable QR codes with a changeable QR code link. Update the destination after print and track scans.",
  },
  alternates: {
    canonical: "https://www.qrjunction.in/register",
  },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
