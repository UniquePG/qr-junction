import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QRGenerator from "@/components/QRGenerator";
import { qrLandingContent } from "@/lib/qrLandingContent";
import { 
  CheckCircle2, ChevronRight, HelpCircle, Loader2, Sparkles, Zap,
  Printer, Scale, Image as ImageIcon, Grid, ArrowRight
} from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const BASE_URL = "https://www.qrjunction.in";

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const isQrGenerator = slug.endsWith("-qr-code-generator");
  if (!isQrGenerator) {
    return { title: "QR Junction" };
  }

  const typeStr = slug.replace("-qr-code-generator", "");
  const content = qrLandingContent[typeStr];
  
  if (!content) {
    return { title: "QR Junction" };
  }

  const canonicalUrl = `${BASE_URL}/${slug}`;

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: canonicalUrl,
      siteName: "QR Junction",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

// Static params for SSG (Server-Side Generation)
export function generateStaticParams() {
  return Object.keys(qrLandingContent).map((type) => ({
    slug: `${type}-qr-code-generator`,
  }));
}

export default async function DynamicQRLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const isQrGenerator = slug.endsWith("-qr-code-generator");
  if (!isQrGenerator) {
    notFound();
  }

  const typeStr = slug.replace("-qr-code-generator", "");
  const content = qrLandingContent[typeStr];

  if (!content) {
    notFound();
  }

  const Icon = content.icon;
  const canonicalUrl = `${BASE_URL}/${slug}`;

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": `${content.type.toUpperCase()} QR Code Generator by QR Junction`,
        "url": canonicalUrl,
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
      },
      content.faq && content.faq.length > 0 ? {
        "@type": "FAQPage",
        "mainEntity": content.faq.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      } : null,
      content.howToSteps && content.howToSteps.length > 0 ? {
        "@type": "HowTo",
        "name": `How to create a ${content.type.toUpperCase()} QR Code`,
        "step": content.howToSteps.map((step, idx) => ({
          "@type": "HowToStep",
          "url": `${canonicalUrl}#step-${idx + 1}`,
          "name": step.title,
          "itemListElement": [{
            "@type": "HowToDirection",
            "text": step.desc
          }]
        }))
      } : null,
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": BASE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": `${content.type.toUpperCase()} QR Generator`,
            "item": canonicalUrl
          }
        ]
      }
    ].filter(Boolean)
  };

  const otherGenerators = Object.keys(qrLandingContent)
    .filter(k => k !== typeStr)
    .map(k => ({
      name: qrLandingContent[k].type,
      slug: `${k}-qr-code-generator`,
      icon: qrLandingContent[k].icon
    }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background aesthetics (matches home page) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none mt-4" />
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#001B50]/5 blur-[150px] pointer-events-none" />

      <Header />

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* HERO SECTION */}
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Icon className="w-4 h-4" />
              <span>{content.type.toUpperCase()} QR CODE GENERATOR</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#001B50] tracking-tight mb-6 leading-[1.15]">
              {content.heroHeading}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
              {content.heroSubheading}
            </p>
            
            <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 inline-flex items-center gap-4 text-left shadow-sm max-w-3xl mx-auto">
              <div className="bg-amber-100 p-3 rounded-full shrink-0">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Did you know?</p>
                <p className="text-sm text-slate-600 leading-snug">{content.fact}</p>
              </div>
            </div>
          </div>

          {/* QR GENERATOR TOOL */}
          <div className="mb-24 relative">
             <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent rounded-[2.5rem] -z-10 blur-xl opacity-50" />
             <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-slate-500 text-sm font-medium">
                    Loading generator engine...
                  </p>
                </div>
              }
            >
              <QRGenerator initialTab={content.tabType} lockTab={true} />
            </Suspense>
          </div>

          {/* IMAGE PROMPTS (For user to replace later) */}
          {content.imagePrompts && content.imagePrompts.length > 0 && (
            <div className="mb-24 bg-purple-50 border border-purple-200 rounded-3xl p-8 max-w-4xl mx-auto">
              <h3 className="text-purple-800 font-bold mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Required Images (AI Generation Prompts)</h3>
              <p className="text-sm text-purple-600 mb-6">Use these prompts to generate the specific images needed for this page.</p>
              <div className="space-y-4">
                {content.imagePrompts.map((img, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-purple-100">
                    <p className="font-semibold text-slate-800 text-sm mb-1">{img.section}</p>
                    <p className="text-slate-600 text-xs font-mono bg-slate-50 p-3 rounded leading-relaxed border border-slate-200">"{img.prompt}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOW TO STEPS */}
          {content.howToSteps && content.howToSteps.length > 0 && (
            <div className="mb-24 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-[#001B50]">
                  How to Create a {content.type.toUpperCase()} QR Code
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.howToSteps.map((step, idx) => (
                  <div key={idx} id={`step-${idx+1}`} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative pt-10">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm absolute -top-4 -left-4 shadow-md">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-[#001B50] mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPARISON SECTION */}
          {content.comparison && (
            <div className="mb-24 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-[#001B50]">
                  {content.comparison.title}
                </h2>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full bg-white text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold text-[#001B50]">Feature</th>
                      <th className="p-4 font-bold text-slate-500 w-1/4">{content.comparison.theirProduct}</th>
                      <th className="p-4 font-bold text-primary w-1/3">{content.comparison.ourProduct}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {content.comparison.points.map((pt, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-semibold text-slate-800">{pt.feature}</td>
                        <td className="p-4">{pt.them}</td>
                        <td className="p-4 text-primary font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          {pt.us}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USE CASES & BENEFITS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            {/* Use Cases */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm">
                <Zap className="w-4 h-4 text-emerald-600" />
                Popular Use Cases
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#001B50] tracking-tight">
                Where to use your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">{content.type.toUpperCase()}</span> QR Code
              </h2>
              
              <div className="space-y-5">
                {content.useCases.map((useCase, idx) => (
                  <div key={idx} className="group relative bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-emerald-600 font-bold">{idx + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                          {useCase.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {useCase.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-sm font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Key Benefits
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#001B50] tracking-tight">
                Why choose this format?
              </h2>
              
              <div className="grid grid-cols-1 gap-5">
                {content.benefits.map((benefit, idx) => (
                  <div key={idx} className="group relative bg-gradient-to-br from-slate-900 to-[#001B50] p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-bl-[100px] group-hover:bg-primary/40 transition-colors duration-500" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/10 group-hover:bg-primary/50 transition-colors">
                        <Sparkles className="w-5 h-5 text-blue-200" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-200 transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA EXAMPLES */}
          {content.ctaExamples && content.ctaExamples.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-[#001B50]">
                  Call-to-Action Examples that Convert
                </h2>
                <p className="text-slate-500 mt-2">Never print a QR code without a reason to scan. Try these proven CTAs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.ctaExamples.map((cta, idx) => (
                  <div key={idx} className="bg-[#001B50] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"/>
                    <h3 className="font-bold text-lg mb-2 text-primary-light">"{cta.title}"</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{cta.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRINT GUIDE */}
          {content.printGuide && (
            <div className="mb-24 bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-sm font-bold mb-4">
                    <Printer className="w-4 h-4" />
                    Print & Design Guide
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#001B50] mb-4">
                    {content.printGuide.title}
                  </h2>
                  <p className="text-slate-600 mb-8">{content.printGuide.description}</p>
                  
                  <div className="space-y-6">
                    {content.printGuide.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                          <Scale className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{tip.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Render the generated image if available */}
                {['instagram', 'facebook', 'whatsapp', 'linkedin', 'snapchat', 'telegram', 'twitter'].includes(content.type) ? (
                  <div className="flex-1 w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                      src={`/assests/LandingPages/${content.type === 'twitter' ? 'x' : content.type}-page.png`}
                      alt={`${content.type} QR Code in action`}
                      width={1536}
                      height={1024}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      loading='lazy'
                    />
                  </div>
                ) : (
                  <div className="flex-1 w-full max-w-sm bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center text-slate-400 p-8 text-center relative overflow-hidden mx-auto">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-bold">Print Size Reference</p>
                    <p className="text-xs mt-2">Visual graphic coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQ SECTION */}
          <div className="max-w-4xl mx-auto mb-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-6 shadow-lg rotate-3">
                <HelpCircle className="w-7 h-7 -rotate-3" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#001B50] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 mt-4 max-w-xl mx-auto">Everything you need to know about generating and using {content.type} QR codes effectively.</p>
            </div>
            
            <div className="space-y-4">
              {content.faq.map((item, idx) => (
                <div key={idx} className="group bg-white/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300" />
                  <h3 className="text-lg font-bold text-[#001B50] mb-3 flex items-start gap-3">
                    <span className="text-primary mt-1 shrink-0"><HelpCircle className="w-5 h-5"/></span>
                    {item.q}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-8">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* OTHER GENERATORS GRID */}
          <div className="max-w-5xl mx-auto border-t border-slate-200 pt-20">
             <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#001B50]">
                Explore Other Free Generators
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {otherGenerators.slice(0, 12).map((gen, idx) => {
                const GenIcon = gen.icon;
                return (
                  <Link 
                    key={idx} 
                    href={`/${gen.slug}`}
                    className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-primary hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <GenIcon className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 capitalize">{gen.name} QR</span>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
