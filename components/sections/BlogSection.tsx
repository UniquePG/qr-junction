import { getAllBlogs } from "@/lib/blogs";
import Link from "next/link";
import Image from "next/image";

export default function BlogSection() {
  const allBlogs = getAllBlogs();

  if (allBlogs.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 py-16 bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn more about QR codes, their uses, and best practices from our
            expert team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allBlogs.slice(0, 3).map((blog) => (
            <Link
              key={blog.slug}
              href={`/blog/${blog.slug}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {blog.hero.image && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={blog.hero.image}
                    alt={blog.hero.imageAlt || blog.hero.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                  {blog.publishedAt && (
                    <time dateTime={blog.publishedAt}>
                      {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  {blog.readTime && (
                    <>
                      <span>•</span>
                      <span>{blog.readTime} min read</span>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {blog.hero.title}
                </h3>
                <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                  {blog.hero.subtitle}
                </p>
                <span className="inline-flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                  Read More
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {allBlogs.length > 3 && (
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-7 py-3.5 
              bg-blue-600 text-white 
              rounded-xl font-semibold 
              shadow-md hover:shadow-lg 
              hover:bg-blue-700 
              transition-all duration-300"
              >
              View All Blog Posts
              <i className="fas fa-arrow-right transition-transform duration-300 group-hover:translate-x-1"></i>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
