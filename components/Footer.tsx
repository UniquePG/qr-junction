import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 p-8 bg-slate-50 rounded-lg">
        <div>
          <h3 className="text-primary text-xl font-semibold mb-4">QR Junction</h3>
          <p className="text-gray-600 leading-relaxed mb-2">
            Free QR code generator for all your needs. Create custom QR codes instantly without registration.
          </p>
        </div>
        <div>
          <h4 className="text-gray-900 text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="list-none p-0">
            <li className="mb-2">
              <Link href="/" className="text-gray-600 hover:text-primary transition-colors no-underline">
                Home
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/faq" className="text-gray-600 hover:text-primary transition-colors no-underline">
                FAQ
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors no-underline">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-900 text-lg font-semibold mb-4">Legal</h4>
          <ul className="list-none p-0">
            <li className="mb-2">
              <Link href="/privacy-policy" className="text-gray-600 hover:text-primary transition-colors no-underline">
                Privacy Policy
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors no-underline">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-900 text-lg font-semibold mb-4">Connect</h4>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Have questions or feedback? We&apos;d love to hear from you!
          </p>
          <Link
            href="/contact"
            className="inline-block mt-2 px-5 py-2.5 gradient-primary text-white no-underline rounded-lg transition-transform hover:-translate-y-0.5"
          >
            Get in Touch
          </Link>
        </div>
      </div>
      <p className="text-center mt-8 text-gray-600 text-sm pt-5 border-t border-slate-200">
        Made with <span className="text-secondary">❤️</span> | © 2025 QR Junction. All rights reserved.
      </p>
    </footer>
  );
}

