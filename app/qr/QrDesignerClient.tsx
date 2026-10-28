"use client";

import QRGenerator from "@/components/QRGenerator";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function QRGeneratorWrapper() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url") || undefined;

  return (
    <QRGenerator
      initialUrl={urlParam}
      heading="Customise colours, logo, and frames"
      subheading="QR code maker with no signup for static codes. Download PNG or SVG."
    />
  );
}

export default function QrDesignerClient() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-500 text-sm">Initializing customizer engine...</p>
        </div>
      }
    >
      <QRGeneratorWrapper />
    </Suspense>
  );
}
