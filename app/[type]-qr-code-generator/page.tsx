import GeneratorSeoPage, {
  generatorMetadata,
} from "@/components/qr/GeneratorSeoPage";
import { qrLandingContent } from "@/lib/qrLandingContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  return generatorMetadata(type);
}

export function generateStaticParams() {
  return Object.keys(qrLandingContent).map((type) => ({ type }));
}

export default async function TypeQrLandingPage({ params }: PageProps) {
  const { type } = await params;
  if (!qrLandingContent[type]) {
    notFound();
  }
  return <GeneratorSeoPage typeStr={type} />;
}
