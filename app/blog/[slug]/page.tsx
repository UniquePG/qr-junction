import { blogs } from "@/data/blogsData";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { CopyButton } from "./CopyButton";
import { ShareButtons } from "./ShareButtons";
import { Calendar, Clock } from "lucide-react";

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
    : `${baseUrl}/assests/og-image.png`;

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

  // console.log("blogg", blog)

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
      : `${baseUrl}/assests/og-image.png`,
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
        url: `${baseUrl}/assests/qrjunction-logo1.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
  };

  return (
    <>
      <Script
        id={`blog-structured-data-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="min-h-screen bg-white max-w-[85%] mx-auto py-8">
        {/* Hero Section */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={blog.publishedAt}>
                {formatDate(blog.publishedAt)}
              </time>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime} min read</span>
            </div>

          <div className="flex flex-col gap-3">
            <h1 className="mb-2 text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              {blog.hero.title}
            </h1>

            <p className="mb-8 max-w-5xl text-lg leading-relaxed text-slate-600 md:text-xl">
              {blog.hero.subtitle}
            </p>

            {blog.hero.image && (
              <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl shadow-2xl">
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
            <div className="flex items-center gap-4">
              <Image
                src={blog.author.avatar || "/assests/logo.png"}
                alt={blog.author.name}
                width={20}
                height={20}
                className="h-12 w-12 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <p className="font-semibold text-slate-900">{blog.author.name}</p>
                <p className="text-sm text-slate-600">{blog.author.bio}</p>
              </div>
            </div>
          )}
          </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-max px-4 py-12 pb-2">
          <div className="prose prose-lg prose-slate max-w-none lg:prose-xl">
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
                  <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                    {section.heading}
                  </h2>
                )}

                {/* Single Image */}
                {section.image && (
                  <figure className="my-8 overflow-hidden rounded-xl shadow-lg">
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
                      <figcaption className="mt-2 text-center text-sm text-gray-600">
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
                        className="overflow-hidden rounded-xl shadow-lg"
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
                          <figcaption className="mt-2 text-center text-sm text-gray-600">
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
                    className="mb-3 text-lg leading-relaxed text-gray-700"
                  >
                    {para}
                  </p>
                ))}

                {/* Quote */}
                {section.quote && (
                  <blockquote className="my-8 border-l-4 border-primary-500 bg-slate-100 p-6 italic text-gray-800">
                    <p className="mb-2 text-xl">{section.quote.text}</p>
                    {section.quote.author && (
                      <cite className="text-sm text-gray-600">
                        — {section.quote.author}
                      </cite>
                    )}
                  </blockquote>
                )}

                {/* Code Block */}
                {section.code && (
                  <div className="my-8 overflow-hidden rounded-lg bg-gray-900 shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
                      <span className="text-sm font-medium text-gray-300">
                        {section.code.language}
                      </span>
                      <CopyButton text={section.code.code} label="Copy code" />
                    </div>
                    <pre className="overflow-x-auto p-4">
                      <code className="text-sm text-gray-100">
                        {section.code.code}
                      </code>
                    </pre>
                  </div>
                )}

                {/* List */}
                {section.list && (
                  <ul className="my-6 space-y-3 pl-6">
                    {section.list.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="relative text-lg leading-relaxed text-gray-700 before:absolute before:-left-6 before:text-primary-500 before:content-['✓']"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Table */}
                {section.table && (
                  <div className="my-8 w-fit overflow-hidden rounded-xl border border-gray-200 shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-fit">
                        <thead >
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {section.table.headers.map((header, headerIdx) => (
                              <th
                                key={headerIdx}
                                className="px-6 py-4 text-left text-sm font-semibold text-slate-900"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {section.table.rows.map((row, rowIdx) => (
                            <tr
                              key={rowIdx}
                              className="transition-colors hover:bg-slate-50"
                            >
                              {row.map((cell, cellIdx) => (
                                <td
                                  key={cellIdx}
                                  className="px-6 py-4 text-slate-700"
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
          <div className="mt-16 overflow-hidden rounded-xl border-2 border-indigo-600 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto max-w-2xl">
              <h3 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">
                {blog.cta.text}
              </h3>
              <Link
                href={blog.cta.link}
                className="inline-flex items-center gap-3 rounded-lg bg-indigo-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-md"
              >
                <i className="fas fa-qrcode"></i>
                Generate QR Code Now
              </Link>
            </div>
          </div>

          {/* Share Section */}
          <ShareButtons blogUrl={blogUrl} title={blog.seo.title} />
        </main>
      </article>
    </>
  );
}
