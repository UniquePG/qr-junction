export interface BlogPost {
  slug: string;
  seo: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
  author?: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  publishedAt?: string;
  updatedAt?: string;
  readTime?: number;
  hero: {
    title: string;
    subtitle: string;
    image?: string;
    imageAlt?: string;
  };
  sections: {
    id: string;
    heading?: string;
    headingLevel?: 2 | 3;
    content: string[];
    list?: (string | { text: string; sublist?: string[] })[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    image?: {
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    };
    images?: {
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    }[];
    code?: {
      language: string;
      code: string;
    };
    quote?: {
      text: string;
      author?: string;
    };
  }[];
  faq?: { q: string; a: string }[];
  howTo?: {
    name: string;
    steps: { title: string; text: string }[];
  };
  relatedSlugs?: string[];
  cta: {
    text: string;
    link: string;
  };
}
