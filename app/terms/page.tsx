import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { PageViewTracker } from '@/hooks/usePageView';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Terms of Service | QR Junction - QR Code Generator',
  description: 'Read the Terms of Service for QR Junction. Understand the terms and conditions for using our free QR code generator tool.',
  keywords: 'QR Junction terms, terms of service, QR code generator terms, user agreement, terms and conditions',
  openGraph: {
    title: 'Terms of Service | QR Junction',
    description: 'Read the Terms of Service for QR Junction. Understand the terms and conditions for using our free QR code generator tool.',
    url: 'https://www.qrjunction.in/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | QR Junction',
    description: 'Read the Terms of Service for QR Junction. Understand the terms and conditions for using our free QR code generator tool.',
  },
  alternates: {
    canonical: 'https://www.qrjunction.in/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Script id="breadcrumb-schema-terms" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.qrjunction.in/",
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Terms of Service",
              "item": "https://www.qrjunction.in/terms",
            },
          ],
        })}
      </Script>
      <Script id="webpage-schema-terms" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Terms of Service | QR Junction",
          "description": "Terms of Service for QR Junction QR Code Generator.",
          "url": "https://www.qrjunction.in/terms",
          "datePublished": "2025-01-27",
          "dateModified": "2025-01-27",
        })}
      </Script>
      <PageViewTracker />
      <div className="container mx-auto px-4 md:px-6 py-6 sm:py-8">
        <Header />
        
        <div className="max-w-4xl mx-auto mt-6 sm:mt-8">
          <div className="text-center mb-8 sm:mb-12 pb-4 sm:pb-6 border-b-2 border-slate-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 sm:mb-3">
              Terms of Service
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Last Updated: January 27, 2025</p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <section className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-slate-200">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using QR Junction (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                QR Junction is a free online QR code generator tool that allows users to create QR codes for various purposes including URLs, text, social media profiles, contact information, WiFi credentials, and more. The Service is provided &quot;as is&quot; without any warranties or guarantees.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">3. Use of Service</h2>
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">3.1 Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use QR Junction to generate QR codes for personal, commercial, or any other lawful purposes. The Service is free to use and does not require registration.
              </p>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">3.2 Prohibited Use</h3>
              <p className="text-gray-700 leading-relaxed mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li>Generate QR codes containing illegal, harmful, or malicious content</li>
                <li>Create QR codes that violate any laws or regulations</li>
                <li>Generate QR codes that infringe upon intellectual property rights</li>
                <li>Use the Service in any way that could damage, disable, or impair the Service</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use automated systems or bots to access the Service in a manner that could overload our servers</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">4. User Content and Responsibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You are solely responsible for the content you use to generate QR codes. QR Junction does not monitor, review, or control the content of QR codes generated by users. You agree that:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li>You have the right to use any content you input into the Service</li>
                <li>You will not use the Service to create QR codes with offensive, defamatory, or illegal content</li>
                <li>You are responsible for ensuring that your use of generated QR codes complies with applicable laws</li>
                <li>QR Junction is not liable for any consequences resulting from the use of QR codes you generate</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">5. Privacy and Data</h2>
              <p className="text-gray-700 leading-relaxed">
                QR Junction processes all QR code generation locally in your browser. We do not store, collect, or transmit your data to our servers. For more information about how we handle data, please review our{' '}
                <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">6. Intellectual Property</h2>
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">6.1 Service Ownership</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content, features, and functionality of QR Junction, including but not limited to the design, text, graphics, logos, and software, are owned by QR Junction and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">6.2 Generated QR Codes</h3>
              <p className="text-gray-700 leading-relaxed">
                QR codes generated using the Service are your property. You retain all rights to the QR codes you create and may use them for any lawful purpose without restriction.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">7. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4 mb-4">
                <li>Warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy, reliability, or availability of the Service</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                QR Junction does not warrant that the Service will be uninterrupted, error-free, or free from viruses or other harmful components.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, QR JUNCTION SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li>Your use or inability to use the Service</li>
                <li>Any content or QR codes generated using the Service</li>
                <li>Unauthorized access to or use of our servers</li>
                <li>Any errors or omissions in the Service</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">9. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree to indemnify, defend, and hold harmless QR Junction, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney&apos;s fees, arising out of or in any way connected with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms of Service</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content you use to generate QR codes</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">10. Modifications to Service</h2>
              <p className="text-gray-700 leading-relaxed">
                QR Junction reserves the right to modify, suspend, or discontinue the Service, or any part thereof, at any time with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                QR Junction reserves the right to modify these Terms of Service at any time. We will notify users of any material changes by updating the &quot;Last Updated&quot; date at the top of this page. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">12. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                QR Junction reserves the right to terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">If you have any questions about these Terms of Service, please contact us at:</p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Email:</strong> uniquetechexplorer7@gmail.com<br />
                <strong>Website:</strong> <Link href="/" className="text-primary hover:underline">www.qrjunction.in</Link>
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">15. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms of Service is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">16. Entire Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service constitute the entire agreement between you and QR Junction regarding the use of the Service and supersede all prior agreements and understandings.
              </p>
            </section>
          </div>

          <div className="mt-12 sm:mt-16 text-center p-6 sm:p-10 bg-slate-50 rounded-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4">
              Questions about our Terms?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              If you have any questions or concerns about these Terms of Service, please{' '}
              <Link href="/contact" className="text-primary hover:underline font-semibold">
                contact us
              </Link>.
            </p>
            <Link
              href="/"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 gradient-primary text-white rounded-lg font-semibold text-base sm:text-lg shadow-primary hover:-translate-y-0.5 hover:shadow-primary-hover transition-all"
            >
              <i className="fas fa-qrcode mr-2"></i>Generate QR Code Now
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

