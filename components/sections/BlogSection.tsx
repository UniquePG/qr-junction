import { getAllBlogs } from "@/lib/blogs";
import { ArrowRight, Calendar, Clock, QrCode } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BlogSection() {
  const allBlogs = getAllBlogs();

  if (allBlogs.length === 0) {
    return null;
  }

  const featuredBlog = allBlogs[0];
  const secondaryBlogs = allBlogs.slice(1, 4);

  // High-fidelity fallback illustration template when post image is absent
  const renderFallbackImage = (slug: string) => {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#0046a1] to-[#001B50] flex flex-col justify-between p-6 text-white select-none overflow-hidden">
        {/* Decorative QR code matrix pattern inside backdrop */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] bg-[size:12px_12px]" />
        
        <div className="flex justify-between items-start relative z-10">
          <span className="text-[8px] font-black tracking-widest uppercase bg-white/15 px-2.5 py-0.5 rounded border border-white/20 font-mono">
            Insights
          </span>
          <QrCode className="w-4 h-4 text-white/30" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-[8px] font-bold font-mono tracking-widest opacity-60 uppercase">QR Junction Hub</span>
          <span className="text-xs font-black tracking-tight leading-tight uppercase line-clamp-2">
            {slug.split('-').join(' ')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-20 py-20 bg-slate-50/50 border-t border-slate-200/80 relative overflow-hidden rounded-3xl">
      {/* Decorative glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/2 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/2 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Resources
          </span>
          <h2 className="text-3.5xl font-extrabold text-[#001B50] mt-4 mb-4 tracking-tight leading-tight">
            Latest Marketing &amp; Tech Insights
          </h2>
          <p className="text-slate-650 max-w-2xl mx-auto text-sm leading-relaxed">
            Discover guides, strategies, and best practices for dynamic QR tracking, UTM conversions, and customer experience mapping.
          </p>
        </div>

        {/* Asymmetric Content Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Major Highlight Feature Card (5 columns width) */}
          <div className="lg:col-span-5">
            <Link
              href={`/blog/${featuredBlog.slug}`}
              className="group block bg-white border border-slate-200/80 hover:border-slate-350 rounded-3xl overflow-hidden shadow-3xs hover:shadow-xl transition-all duration-500 hover:-translate-y-1 no-underline"
            >
              <div className="relative h-64 w-full overflow-hidden border-b border-slate-100/60 bg-slate-50 flex items-center justify-center">
                {featuredBlog.hero?.image ? (
                  <Image
                    src={featuredBlog.hero.image}
                    alt={featuredBlog.hero.imageAlt || featuredBlog.hero.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                ) : (
                  renderFallbackImage(featuredBlog.slug)
                )}
                
                {/* Float Category tag */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full bg-[#001B50]/90 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                    Featured
                  </span>
                </div>
              </div>

              <div className="p-7 space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {featuredBlog.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={featuredBlog.publishedAt}>
                        {new Date(featuredBlog.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  )}
                  {featuredBlog.readTime && (
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{featuredBlog.readTime} Min Read</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-[#001B50] group-hover:text-primary transition-colors duration-300 leading-tight">
                  {featuredBlog.hero.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {featuredBlog.hero.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider group/link">
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>

          {/* RIGHT: Secondary Articles List (7 columns width) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {secondaryBlogs.map((blog) => (
              <Link
                href={`/blog/${blog.slug}`}
                key={blog.slug}
                className="group flex flex-col sm:flex-row gap-5 bg-white border border-slate-200/80 p-5 rounded-3xl hover:border-slate-350 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 no-underline"
              >
                {/* Small preview thumbnail layout */}
                <div className="relative w-full sm:w-44 h-32 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-center">
                  {blog.hero?.image ? (
                    <Image
                      src={blog.hero.image}
                      alt={blog.hero.imageAlt || blog.hero.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, 20vw"
                    />
                  ) : (
                    renderFallbackImage(blog.slug)
                  )}
                </div>

                {/* Text details column */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-450 uppercase tracking-widest">
                      {blog.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      {blog.readTime && (
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                          <Clock className="w-3 h-3" />
                          <span>{blog.readTime} min read</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-[#001B50] group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-2">
                      {blog.hero.title}
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                      {blog.hero.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center gap-1.5 text-[11px] font-extrabold text-primary uppercase tracking-wider">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* Global Footer CTA link */}
        {allBlogs.length > 4 && (
          <div className="text-center mt-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md shadow-blue-100 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 no-underline"
            >
              <span>View All Blog Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
