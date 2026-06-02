import { getAllBlogs } from "@/lib/blogs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export default function BlogSection() {
  const allBlogs = getAllBlogs();

  if (allBlogs.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 py-16 bg-slate-950/20 border-t border-slate-900 relative overflow-hidden">
      <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/15 px-3 py-1 rounded-full border border-secondary/20">
            Resources
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-4">
            Latest Marketing &amp; Tech Insights
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Learn more about dynamic QR codes, UTM campaign tracking, and customer journey optimization from our technical advisors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allBlogs.slice(0, 3).map((blog) => (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="group bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden hover:border-primary/30 shadow-md hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 no-underline"
            >
              {blog.hero.image && (
                <div className="relative h-48 w-full overflow-hidden border-b border-slate-950">
                  <Image
                    src={blog.hero.image}
                    alt={blog.hero.imageAlt || blog.hero.title}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {blog.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={blog.publishedAt}>
                        {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  )}
                  {blog.readTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{blog.readTime} Min Read</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {blog.hero.title}
                </h3>
                
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {blog.hero.subtitle}
                </p>
                
                <span className="inline-flex items-center text-primary font-semibold text-xs gap-1 group-hover:gap-2 transition-all pt-2">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {allBlogs.length > 3 && (
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-bold text-xs shadow-primary hover:shadow-primary-hover hover:opacity-95 transition-all duration-300 no-underline"
            >
              <span>View All Blog Posts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
