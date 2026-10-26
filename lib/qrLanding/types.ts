import type { TabType } from '../qrEngine';
import type { LucideIcon } from 'lucide-react';

export interface QRLandingContent {
  type: string;
  tabType: TabType;
  displayName?: string;
  title: string;
  description: string;
  heroHeading: string;
  heroSubheading: string;
  fact: string;
  icon: LucideIcon;
  keywords?: string[];
  article?: { heading: string; paragraphs: string[] }[];
  useCases: { title: string; desc: string }[];
  benefits: { title: string; desc: string }[];
  mistakes?: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
  howToSteps?: { title: string; desc: string }[];
  howToTitle?: string;
  comparison?: {
    title: string;
    theirProduct: string;
    ourProduct: string;
    points: { feature: string; them: string; us: string }[];
  };
  printGuide?: {
    title: string;
    description: string;
    tips: { title: string; desc: string }[];
  };
  ctaExamples?: { title: string; desc: string }[];
  imagePrompts?: { section: string; prompt: string }[];
  internalLinks?: { anchor: string; path: string }[];
}
