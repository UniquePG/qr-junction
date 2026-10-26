import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QRGenerator from "@/components/QRGenerator";
import {
  landingDisplayName,
  qrLandingContent,
} from "@/lib/qrLandingContent";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Printer,
  Scale,
  Sparkles,
  Zap,
} from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

const BASE_URL = "https://www.qrjunction.in";

export function generatorMetadata(typeStr: string): Metadata {
  const content = qrLandingContent[typeStr];
  if (!content) {
    return { title: "QR Junction" };
  }

  const canonicalUrl = `${BASE_URL}/${typeStr}-qr-code-generator`;
  const name = landingDisplayName(content);

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: content.title,
      description: content.description,
      url: canonicalUrl,
      siteName: "QR Junction",
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
    robots: { index: true, follow: true },
  };
}

export default function GeneratorSeoPage({ typeStr }: { typeStr: string }) {
  const content = qrLandingContent[typeStr];
  if (!content) notFound();

  const Icon = content.icon;
  const name = landingDisplayName(content);
  const canonicalUrl = `${BASE_URL}/${typeStr}-qr-code-generator`;
  const howToHeading =
    content.howToTitle || `How to create a ${name} QR code`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${name} QR Code Generator by QR Junction`,
        url: canonicalUrl,
        applicationCategory: "UtilityApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        description: content.description,
      },
      {
        "@type": "Article",
        headline: content.heroHeading,
        description: content.description,
        author: { "@type": "Organization", name: "QR Junction" },
        publisher: { "@type": "Organization", name: "QR Junction" },
        mainEntityOfPage: canonicalUrl,
      },
      content.faq?.length
        ? {
            "@type": "FAQPage",
            mainEntity: content.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }
        : null,
      content.howToSteps?.length
        ? {
            "@type": "HowTo",
            name: howToHeading,
            step: content.howToSteps.map((step, idx) => ({
              "@type": "HowToStep",
              url: `${canonicalUrl}#step-${idx + 1}`,
              name: step.title,
              itemListElement: [
                { "@type": "HowToDirection", text: step.desc },
              ],
            })),
          }
        : null,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: `${name} QR Generator`,
            item: canonicalUrl,
          },
        ],
      },
    ].filter(Boolean),
  };

  const relatedFromLinks = (content.internalLinks || [])
    .map((link) => {
      const key = link.path.replace(/^\//, "").replace(/-qr-code-generator$/, "");
      const target = qrLandingContent[key];
      if (!target) return null;
      return {
        name: landingDisplayName(target),
        slug: `${key}-qr-code-generator`,
        icon: target.icon,
      };
    })
    .filter(Boolean) as { name: string; slug: string; icon: typeof Icon }[];

  const relatedFallback = Object.keys(qrLandingContent)
    .filter((k) => k !== typeStr)
    .map((k) => ({
      name: landingDisplayName(qrLandingContent[k]),
      slug: `${k}-qr-code-generator`,
      icon: qrLandingContent[k].icon,
    }));

  const seen = new Set(relatedFromLinks.map((g) => g.slug));
  const otherGenerators = [
    ...relatedFromLinks,
    ...relatedFallback.filter((g) => !seen.has(g.slug)),
  ].slice(0, 12);

  const socialPrintTypes = [
    "instagram",
    "facebook",
    "whatsapp",
    "linkedin",
    "snapchat",
    "telegram",
    "twitter",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none mt-4" />
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#001B50]/5 blur-[150px] pointer-events-none" />

      <Header />

      <main className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="text-xs text-slate-500 mb-8 pt-6 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{name} QR Code</span>
          </nav>

          <div className="text-center max-w-4xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Icon className="w-4 h-4" />
              <span>Free {name} QR code generator</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#001B50] tracking-tight mb-6 leading-[1.15]">
              {content.heroHeading}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {content.heroSubheading}
            </p>

            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 inline-flex items-start sm:items-center gap-4 text-left shadow-sm max-w-3xl mx-auto">
              <div className="bg-amber-100 p-3 rounded-full shrink-0">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Why people search this</p>
                <p className="text-sm text-slate-600 leading-snug">{content.fact}</p>
              </div>
            </div>
          </div>

          <div className="mb-20 relative">
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

          {content.article && content.article.length > 0 && (
            <article className="mb-24 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-8">
                <BookOpen className="w-4 h-4" />
                A practical guide to {name} QR codes
              </div>
              <div className="space-y-12">
                {content.article.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#001B50] tracking-tight mb-4 leading-snug">
                      {section.heading}
                    </h2>
                    <div className="space-y-4">
                      {section.paragraphs.map((p) => (
                        <p
                          key={p.slice(0, 48)}
                          className="text-[17px] leading-[1.75] text-slate-600"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          )}

          {content.howToSteps && content.howToSteps.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-[#001B50]">{howToHeading}</h2>
                <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
                  Generate, scan-test on a real phone, then download. Do not print a first draft.
                </p>
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none p-0">
                {content.howToSteps.map((step, idx) => (
                  <li
                    key={step.title}
                    id={`step-${idx + 1}`}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative pt-10"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm absolute -top-3 left-5 shadow-md">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-[#001B50] mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {content.mistakes && content.mistakes.length > 0 && (
            <div className="mb-24 max-w-4xl mx-auto">
              <h2 className="text-3xl font-extrabold text-[#001B50] mb-3">
                Mistakes that make a {name} QR fail
              </h2>
              <p className="text-slate-500 mb-8">
                Most “this QR doesn’t work” complaints are print or destination problems, not the generator.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.mistakes.map((item) => (
                  <div
                    key={item.title}
                    className="bg-amber-50/80 border border-amber-100 rounded-2xl p-5 flex gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                      <th className="p-4 font-bold text-slate-500 w-1/4">
                        {content.comparison.theirProduct}
                      </th>
                      <th className="p-4 font-bold text-primary w-1/3">
                        {content.comparison.ourProduct}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {content.comparison.points.map((pt) => (
                      <tr key={pt.feature} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-slate-800">{pt.feature}</td>
                        <td className="p-4">{pt.them}</td>
                        <td className="p-4 text-primary font-medium">
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {pt.us}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm">
                <Zap className="w-4 h-4 text-emerald-600" />
                Where this QR is used
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#001B50] tracking-tight">
                Practical uses for a {name} QR code
              </h2>
              <div className="space-y-5">
                {content.useCases.map((useCase, idx) => (
                  <div
                    key={useCase.title}
                    className="group relative bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-emerald-600 font-bold">{idx + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{useCase.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{useCase.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-sm font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Why this format
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#001B50] tracking-tight">
                What you get from a {name} QR
              </h2>
              <div className="grid grid-cols-1 gap-5">
                {content.benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="relative bg-gradient-to-br from-slate-900 to-[#001B50] p-6 rounded-2xl border border-slate-800 text-white overflow-hidden"
                  >
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {content.ctaExamples && content.ctaExamples.length > 0 && (
            <div className="mb-24 max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-[#001B50]">
                  Call-to-action lines that get scanned
                </h2>
                <p className="text-slate-500 mt-2">
                  A QR without a sentence next to it is a mystery box. Print the reason.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.ctaExamples.map((cta) => (
                  <div
                    key={cta.title}
                    className="bg-[#001B50] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden"
                  >
                    <h3 className="font-bold text-lg mb-2 text-blue-200">“{cta.title}”</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{cta.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.printGuide && (
            <div className="mb-24 bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-sm font-bold mb-4">
                    <Printer className="w-4 h-4" />
                    Print &amp; design
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#001B50] mb-4">
                    {content.printGuide.title}
                  </h2>
                  <p className="text-slate-600 mb-8">{content.printGuide.description}</p>
                  <div className="space-y-6">
                    {content.printGuide.tips.map((tip) => (
                      <div key={tip.title} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                          <Scale className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{tip.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {socialPrintTypes.includes(content.type) ? (
                  <div className="flex-1 w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                      src={`/assests/LandingPages/${content.type === "twitter" ? "x" : content.type}-page.png`}
                      alt={`${name} QR code used on print`}
                      width={1536}
                      height={1024}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto mb-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-6 shadow-lg">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#001B50] tracking-tight">
                {name} QR code — frequently asked questions
              </h2>
              <p className="text-slate-500 mt-4 max-w-xl mx-auto">
                Straight answers for print, iPhone vs Android, and whether the code can be changed later.
              </p>
            </div>

            <div className="space-y-4">
              {content.faq.map((item) => (
                <div
                  key={item.q}
                  className="bg-white/80 p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-[#001B50] mb-3">{item.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto border-t border-slate-200 pt-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#001B50]">
                Other free QR generators
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                Each page is written for that job — Wi-Fi is not a website, a vCard is not WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {otherGenerators.map((gen) => {
                const GenIcon = gen.icon;
                return (
                  <Link
                    key={gen.slug}
                    href={`/${gen.slug}`}
                    className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-primary hover:shadow-md transition-all group no-underline"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <GenIcon className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{gen.name} QR</span>
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
