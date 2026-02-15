import { getAllBlogs } from '@/lib/blogs';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogsPage() {
  const allBlogs = getAllBlogs();

  if (allBlogs.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-4">Blog</h1>
        <p className="text-gray-600">No blog posts available yet.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Blog</h1>
        <p className="text-gray-600 mt-2">All posts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allBlogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {blog.hero?.image && (
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
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
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
    </main>
  );
}