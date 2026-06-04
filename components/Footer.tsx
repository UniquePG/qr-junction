import Link from 'next/link';
import { getAllBlogs } from '@/lib/blogs';
import Image from 'next/image';

export default function Footer() {
  const blogs = getAllBlogs().slice(0, 5); // Show latest 5 blogs in footer

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-1">
            {/* <h3 className="text-[#001B50] text-xl font-bold tracking-tight">
              QR <span className="text-primary">Junction</span>
            </h3> */}
          <Link href="/" className="flex items-center group no-underline">
          <Image
            src="/NewLogo/Logo.png"
            alt="QR Junction"
            width={120}
            height={42}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              Transforming offline scans into rich dynamic online insights. Create, customize, track, and optimize QR links instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#001B50] text-sm font-semibold uppercase tracking-wider mb-4">Product</h4>
            <ul className="list-none p-0 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-primary transition-colors no-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/qr" className="text-slate-600 hover:text-primary transition-colors no-underline flex items-center gap-1.5">
                  <span>Advanced Generator</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-600 hover:text-primary transition-colors no-underline">
                  Help &amp; FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Blogs */}
          <div>
            <h4 className="text-[#001B50] text-sm font-semibold uppercase tracking-wider mb-4">Latest Insights</h4>
            {blogs.length > 0 ? (
              <ul className="list-none p-0 space-y-2.5 text-sm">
                {blogs.map((blog) => (
                  <li key={blog.slug}>
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-slate-600 hover:text-primary transition-colors no-underline line-clamp-1"
                      title={blog.hero.title}
                    >
                      {blog.hero.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-xs">No articles published yet.</p>
            )}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[#001B50] text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="list-none p-0 space-y-2.5 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-slate-600 hover:text-primary transition-colors no-underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-primary transition-colors no-underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-[#001B50] text-sm font-semibold uppercase tracking-wider">Connect</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Need assistance or looking for agency packages? We are ready to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex justify-center items-center bg-[#001B50] hover:bg-[#00143c] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 no-underline shadow-sm hover:-translate-y-0.5 h-[40px]"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Bottom copyright info */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QR Junction. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}
