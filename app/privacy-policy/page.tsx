import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { PageViewTracker } from '@/hooks/usePageView';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Privacy Policy | QR Junction - QR Code Generator',
  description: 'Read QR Junction\'s Privacy Policy. Learn how we protect your privacy and handle data when you use our free QR code generator tool.',
  keywords: 'QR Junction privacy policy, data protection, QR code generator privacy, user privacy, privacy agreement',
  openGraph: {
    title: 'Privacy Policy | QR Junction',
    description: 'Read QR Junction\'s Privacy Policy. Learn how we protect your privacy and handle data.',
    url: 'https://www.qrjunction.in/privacy-policy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | QR Junction',
    description: 'Read QR Junction\'s Privacy Policy. Learn how we protect your privacy and handle data.',
  },
  alternates: {
    canonical: 'https://www.qrjunction.in/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <Script id="breadcrumb-schema-privacy" type="application/ld+json">
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
              "name": "Privacy Policy",
              "item": "https://www.qrjunction.in/privacy-policy",
            },
          ],
        })}
      </Script>
      <Script id="webpage-schema-privacy" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Privacy Policy | QR Junction",
          "description": "QR Junction's Privacy Policy explaining how we protect user data and privacy.",
          "url": "https://www.qrjunction.in/privacy-policy",
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
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Last Updated: January 27, 2025</p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <section className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-slate-200">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to QR Junction. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our QR code generator service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using QR Junction, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">2. Information We Do NOT Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">QR Junction is designed with privacy as a core principle. We want to be transparent about what we do NOT collect:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li><strong>No Personal Information:</strong> We do not require registration or account creation, so we do not collect names, email addresses, or other personal identifiers.</li>
                <li><strong>No QR Code Content:</strong> All QR code generation happens locally in your browser. We do not store, transmit, or have access to the content you use to generate QR codes.</li>
                <li><strong>No Generated QR Codes:</strong> The QR codes you create are generated and downloaded directly to your device. We never see or store them.</li>
                <li><strong>No User Tracking:</strong> We do not use tracking cookies or other technologies to monitor your individual usage patterns.</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">3. Information We Automatically Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Like most websites, we automatically collect certain technical information when you visit QR Junction:</p>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">3.1 Analytics Data</h3>
              <p className="text-gray-700 leading-relaxed mb-3">We use Google Analytics to understand how visitors use our website. This may include:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4 mb-4">
                <li>IP address (anonymized)</li>
                <li>Browser type and version</li>
                <li>Device type (desktop, mobile, tablet)</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website</li>
                <li>General geographic location (country/city level, not precise location)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">This information is aggregated and anonymized, meaning it cannot be used to identify individual users.</p>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">3.2 Cookies and Similar Technologies</h3>
              <p className="text-gray-700 leading-relaxed mb-3">We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve website functionality and user experience</li>
                <li>Remember your preferences (if applicable)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">You can control cookies through your browser settings. However, disabling cookies may affect the functionality of the Service.</p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">4. How We Use Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use the automatically collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li><strong>Service Improvement:</strong> To understand how users interact with our Service and make improvements</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and optimize the website&apos;s performance</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security issues</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">5. Data Storage and Security</h2>
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">5.1 Local Processing</h3>
              <p className="text-gray-700 leading-relaxed mb-3">All QR code generation is performed entirely in your web browser using client-side JavaScript. This means:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4 mb-4">
                <li>Your data never leaves your device</li>
                <li>We cannot access the content you use to generate QR codes</li>
                <li>No data is transmitted to our servers during QR code generation</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">5.2 Server-Side Data</h3>
              <p className="text-gray-700 leading-relaxed">Any data we do collect (analytics, etc.) is stored securely and is not linked to your personal identity. We implement appropriate technical and organizational measures to protect this data.</p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">6. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use the following third-party services that may collect information:</p>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">6.1 Google Analytics</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use Google Analytics to analyze website traffic. Google Analytics uses cookies and may collect information about your use of the Service. For more information about how Google uses data, visit{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google&apos;s Privacy Policy</a>.
              </p>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">6.2 Content Delivery Networks (CDNs)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">We use CDNs (like Cloudflare) to deliver our website content. These services may collect technical information as part of their normal operations.</p>
              
              <h3 className="text-xl font-semibold text-accent mt-6 mb-3">6.3 Font Awesome</h3>
              <p className="text-gray-700 leading-relaxed">
                We use Font Awesome for icons, which may collect usage data. Please refer to{' '}
                <a href="https://fontawesome.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Font Awesome&apos;s Privacy Policy</a> for more information.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">7. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We do not sell, trade, or rent your personal information to third parties. We may share aggregated, anonymized data with:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li><strong>Service Providers:</strong> Third-party companies that help us operate our website (hosting, analytics, etc.)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">8. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                <li><strong>Right to Access:</strong> Request information about what data we have collected</li>
                <li><strong>Right to Deletion:</strong> Request deletion of your data</li>
                <li><strong>Right to Opt-Out:</strong> Opt-out of certain data collection practices</li>
                <li><strong>Cookie Controls:</strong> Manage cookies through your browser settings</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot; section.</p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                QR Junction is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">10. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our Service, you consent to the transfer of your information to these countries.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">11. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                Since we do not collect personal information or store QR code content, there is minimal data to retain. Analytics data is typically retained for up to 26 months, after which it is automatically deleted or anonymized.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">13. Your Consent</h2>
              <p className="text-gray-700 leading-relaxed">
                By using QR Junction, you consent to our Privacy Policy and agree to its terms. If you do not agree with this policy, please discontinue use of the Service.
              </p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-primary mb-4 pb-3 border-b-2 border-slate-200">14. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Email:</strong> uniquetechexplorer7@gmail.com<br />
                <strong>Website:</strong> <Link href="/" className="text-primary hover:underline">www.qrjunction.in</Link>
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">We will respond to your inquiry as soon as possible.</p>
            </section>
          </div>

          <div className="mt-12 sm:mt-16 text-center p-6 sm:p-10 bg-slate-50 rounded-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4">
              Questions about Privacy?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              If you have any questions or concerns about our Privacy Policy, please{' '}
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

