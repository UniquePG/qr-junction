import GeneratorSeoPage, { generatorMetadata } from "@/components/qr/GeneratorSeoPage";
import { qrLandingContent } from "@/lib/qrLandingContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug.endsWith("-qr-code-generator")) {
    return { title: "QR Junction" };
  }
  const typeStr = slug.replace("-qr-code-generator", "");
  return generatorMetadata(typeStr);
}

export function generateStaticParams() {
  return Object.keys(qrLandingContent).map((type) => ({
    slug: `${type}-qr-code-generator`,
  }));
}

export default async function DynamicQRLandingPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug.endsWith("-qr-code-generator")) {
    notFound();
  }
  const typeStr = slug.replace("-qr-code-generator", "");
  if (!qrLandingContent[typeStr]) {
    notFound();
  }
  return <GeneratorSeoPage typeStr={typeStr} />;
}
