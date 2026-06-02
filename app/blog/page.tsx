import { getAllBlogs } from '@/lib/blogs';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogsPage() {
  const allBlogs = getAllBlogs();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background grids and blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1524_1px,transparent_1px),linear-gradient(to_bottom,#0e1524_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <Header />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Knowledge{' '}
            <span className="bg-gradient-to-r from-primary via-slate-100 to-secondary bg-clip-text text-transparent">
              Hub
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Discover guides, tips, and best practices for leveraging dynamic QR codes in your campaigns and day-to-day business.
          </p>
        </div>

        {allBlogs.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl max-w-md mx-auto">
            <p className="text-slate-400">No blog posts available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allBlogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="group bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-350 hover:-translate-y-1 flex flex-col justify-between shadow-lg no-underline"
              >
                <div>
                  {blog.hero?.image && (
                    <div className="relative h-48 w-full overflow-hidden border-b border-slate-850">
                      <Image
                        src={blog.hero.image}
                        alt={blog.hero.imageAlt || blog.hero.title}
                        fill
                        className="object-cover group-hover:scale-103 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {blog.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <time dateTime={blog.publishedAt}>
                            {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      )}
                      {blog.readTime && (
                        <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{blog.readTime} min read</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {blog.hero.title}
                    </h3>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {blog.hero.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <span className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all select-none">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}