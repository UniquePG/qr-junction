import Link from 'next/link';
import { getAllBlogs } from '@/lib/blogs';
import Image from 'next/image';

export default function Footer() {
  const blogs = getAllBlogs().slice(0, 5); // Show latest 5 blogs in footer

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand Col */}
          <div className="space-y-6 lg:col-span-2">
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
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              Transforming offline scans into rich dynamic online insights. Create, customize, track, and optimize QR links instantly. The ultimate QR Code solution.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex justify-center items-center bg-[#001B50] hover:bg-primary text-white font-semibold text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 no-underline"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Product & Legal */}
          <div className="lg:col-span-1">
            <h4 className="text-[#001B50] text-sm font-bold uppercase tracking-wider mb-5">Product</h4>
            <ul className="list-none p-0 space-y-3 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-primary transition-colors no-underline">Home</Link>
              </li>
              <li>
                <Link href="/qr" className="text-slate-600 hover:text-primary transition-colors no-underline">Advanced Generator</Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-600 hover:text-primary transition-colors no-underline">Help &amp; FAQ</Link>
              </li>
            </ul>

            <h4 className="text-[#001B50] text-sm font-bold uppercase tracking-wider mb-5 mt-10">Legal</h4>
            <ul className="list-none p-0 space-y-3 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-slate-600 hover:text-primary transition-colors no-underline">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-primary transition-colors no-underline">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Social Generators */}
          <div className="lg:col-span-1">
            <h4 className="text-[#001B50] text-sm font-bold uppercase tracking-wider mb-5">Social QR Codes</h4>
            <ul className="list-none p-0 space-y-3 text-sm">
              <li>
                <Link href="/instagram-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">Instagram QR Code</Link>
              </li>
              <li>
                <Link href="/facebook-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">Facebook QR Code</Link>
              </li>
              <li>
                <Link href="/whatsapp-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">WhatsApp QR Code</Link>
              </li>
              <li>
                <Link href="/linkedin-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">LinkedIn QR Code</Link>
              </li>
              <li>
                <Link href="/twitter-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">X (Twitter) QR Code</Link>
              </li>
              <li>
                <Link href="/snapchat-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">Snapchat QR Code</Link>
              </li>
              <li>
                <Link href="/telegram-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">Telegram QR Code</Link>
              </li>
            </ul>
          </div>

          {/* Free Generators */}
          <div className="lg:col-span-1">
            <h4 className="text-[#001B50] text-sm font-bold uppercase tracking-wider mb-5">Free Generators</h4>
            <ul className="list-none p-0 space-y-3 text-sm">
              <li>
                <Link href="/url-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">URL Link QR Code</Link>
              </li>
              <li>
                <Link href="/vcard-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">vCard QR Code</Link>
              </li>
              <li>
                <Link href="/pdf-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">PDF QR Code</Link>
              </li>
              <li>
                <Link href="/image-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">Image QR Code</Link>
              </li>
              <li>
                <Link href="/video-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">Video QR Code</Link>
              </li>
              <li>
                <Link href="/wifi-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">Wi-Fi QR Code</Link>
              </li>
              <li>
                <Link href="/app-store-qr-code-generator" className="text-slate-600 hover:text-primary transition-colors no-underline">App Store QR Code</Link>
              </li>
            </ul>
          </div>

          {/* Blogs */}
          <div className="lg:col-span-1">
            <h4 className="text-[#001B50] text-sm font-bold uppercase tracking-wider mb-5">Latest Insights</h4>
            {blogs.length > 0 ? (
              <ul className="list-none p-0 space-y-3 text-sm">
                {blogs.map((blog) => (
                  <li key={blog.slug}>
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-slate-600 hover:text-primary transition-colors no-underline line-clamp-2 leading-relaxed"
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
        </div>

        {/* Bottom copyright info */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QR Junction. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium">
            Made in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
