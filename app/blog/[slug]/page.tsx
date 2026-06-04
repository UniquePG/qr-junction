import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { blogs } from "@/data/blogsData";
import { Calendar, Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { CopyButton } from "./CopyButton";
import { ShareButtons } from "./ShareButtons";

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper function to get blog post
function getBlog(slug: string) {
  return blogs[slug];
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlog(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found | QR Junction",
    };
  }

  const baseUrl = "https://www.qrjunction.in";
  const blogUrl = `${baseUrl}/blog/${slug}`;
  const ogImage = blog.seo.ogImage
    ? `${baseUrl}${blog.seo.ogImage}`
    : `${baseUrl}/NewLogo/logo-192x192.png`;

  return {
    title: blog.seo.title,
    description: blog.seo.description,
    keywords: blog.seo.keywords?.join(", "),
    authors: blog.author ? [{ name: blog.author.name }] : undefined,
    openGraph: {
      title: blog.seo.title,
      description: blog.seo.description,
      url: blogUrl,
      siteName: "QR Junction",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: blog.hero.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: blog.author ? [blog.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.seo.title,
      description: blog.seo.description,
      images: [ogImage],
    },
    alternates: {
      canonical: blogUrl,
    },
    other: {
      "article:author": blog.author?.name || "QR Junction",
      "article:published_time": blog.publishedAt || "",
      "article:modified_time": blog.updatedAt || "",
    },
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return Object.keys(blogs).map((slug) => ({
    slug,
  }));
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = getBlog(slug);

  if (!blog) {
    notFound();
  }

  const baseUrl = "https://www.qrjunction.in";
  const blogUrl = `${baseUrl}/blog/${slug}`;

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.seo.title,
    description: blog.seo.description,
    image: blog.seo.ogImage
      ? `${baseUrl}${blog.seo.ogImage}`
      : `${baseUrl}/NewLogo/logo-192x192.png`,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.publishedAt,
    author: {
      "@type": "Person",
      name: blog.author?.name || "QR Junction Team",
    },
    publisher: {
      "@type": "Organization",
      name: "QR Junction",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/NewLogo/logo-192x192.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-hidden flex flex-col justify-between">
      {/* Background grids and blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#001B50]/5 blur-[120px] pointer-events-none" />

      <Header />

      <Script
        id={`blog-structured-data-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="relative z-10 flex-grow max-w-4xl mx-auto px-6 pt-28 pb-20 w-full">
        <article className="space-y-8">
          {/* Hero Section */}
          <header className="border-b border-slate-200 pb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <time dateTime={blog.publishedAt}>
                  {formatDate(blog.publishedAt)}
                </time>
              </div>
              <span className="text-slate-350">•</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{blog.readTime} min read</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#001B50] tracking-tight">
              {blog.hero.title}
            </h1>

            <p className="text-slate-650 text-base sm:text-lg leading-relaxed max-w-3xl">
              {blog.hero.subtitle}
            </p>

            {blog.hero.image && (
              <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
                <Image
                  src={blog.hero.image}
                  alt={blog.hero.imageAlt || blog.hero.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
              </div>
            )}

            {/* Author info */}
            {blog.author && (
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                <Image
                  src={blog.author.avatar || "/NewLogo/Main_logo.png"}
                  alt={blog.author.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <p className="font-semibold text-[#001B50] text-sm">
                    {blog.author.name}
                  </p>
                  <p className="text-xs text-slate-500">{blog.author.bio}</p>
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <div className="prose prose-slate max-w-none">
            {blog.sections.map((section, sectionIdx) => (
              <section
                key={section.id}
                className={`mb-12 ${
                  sectionIdx === 0 ? "mt-0" : "mt-16"
                } scroll-mt-20`}
                id={section.id}
              >
                {/* Section Heading */}
                {section.heading && (
                  <h2 className="mb-6 text-2xl sm:text-3xl font-extrabold text-[#001B50]">
                    {section.heading}
                  </h2>
                )}

                {/* Single Image */}
                {section.image && (
                  <figure className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 shadow-md">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={section.image.src}
                        alt={section.image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </div>
                    {section.image.caption && (
                      <figcaption className="mt-2 text-center text-xs text-slate-500">
                        {section.image.caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Multiple Images */}
                {section.images && section.images.length > 0 && (
                  <div className="my-8 grid gap-6 md:grid-cols-2">
                    {section.images.map((img, imgIdx) => (
                      <figure
                        key={imgIdx}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 shadow-md"
                      >
                        <div className="relative aspect-video w-full">
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        </div>
                        {img.caption && (
                          <figcaption className="mt-2 text-center text-xs text-slate-500">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {/* Content Paragraphs */}
                {section.content.map((para, paraIdx) => (
                  <p
                    key={paraIdx}
                    className="mb-4 text-sm sm:text-base leading-relaxed text-slate-700"
                  >
                    {para}
                  </p>
                ))}

                {/* Quote */}
                {section.quote && (
                  <blockquote className="my-8 border-l-4 border-primary bg-slate-50 p-6 rounded-r-xl italic text-slate-800">
                    <p className="mb-2 text-lg">{section.quote.text}</p>
                    {section.quote.author && (
                      <cite className="text-xs text-slate-550 not-italic">
                        — {section.quote.author}
                      </cite>
                    )}
                  </blockquote>
                )}

                {/* Code Block */}
                {section.code && (
                  <div className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {section.code.language}
                      </span>
                      <CopyButton text={section.code.code} label="Copy" />
                    </div>
                    <pre className="overflow-x-auto p-4 m-0">
                      <code className="text-xs text-slate-700 font-mono">
                        {section.code.code}
                      </code>
                    </pre>
                  </div>
                )}

                {/* List */}
                {section.list && (
                  <ul className="my-6 space-y-3 pl-6 list-none">
                    {section.list.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="relative text-sm sm:text-base text-slate-700 before:absolute before:-left-6 before:text-primary before:content-['✓'] before:font-bold"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Table */}
                {section.table && (
                  <div className="my-8 w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {section.table.headers.map((header, headerIdx) => (
                              <th
                                key={headerIdx}
                                className="px-6 py-4 text-xs font-bold text-[#001B50] uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {section.table.rows.map((row, rowIdx) => (
                            <tr
                              key={rowIdx}
                              className="transition-colors hover:bg-slate-50"
                            >
                              {row.map((cell, cellIdx) => (
                                <td
                                  key={cellIdx}
                                  className="px-6 py-4 text-xs sm:text-sm text-slate-700"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-10 text-center shadow-xs space-y-6">
            <div className="mx-auto max-w-2xl space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-[#001B50]">
                {blog.cta.text}
              </h3>
              <p className="text-slate-650 text-xs sm:text-sm">
                Create custom vector patterns, integrate dynamic redirection
                endpoints, and view details.
              </p>
              <div className="pt-2">
                <Link
                  href={blog.cta.link}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm px-6 py-3 shadow-primary hover:-translate-y-0.5 transition-all no-underline border-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate QR Code Now</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="pt-6 border-t border-slate-200">
            <ShareButtons blogUrl={blogUrl} title={blog.seo.title} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
