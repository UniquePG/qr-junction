import { HOME_FAQS, HOME_HOW_TO } from "@/lib/homeSeo";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  HelpCircle,
  Quote,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HomeKnowledge() {
  return (
    <div className="max-w-7xl mx-auto px-6 space-y-24 pb-8">
      <section id="what-is-qr-junction" className="max-w-3xl mx-auto scroll-mt-[var(--site-header-offset)]">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Definition</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          What is QR Junction?
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-700 mb-4">
          QR Junction is a free QR code generator and tracking platform for Indian businesses
          and anyone who needs a print-ready code. You create a website, Wi-Fi, vCard, WhatsApp,
          PDF, restaurant menu, or Google Review QR in the browser, scan-test it on your phone,
          and download PNG or SVG without paying or signing up for a static code.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          A QR code is a two-dimensional barcode specified in{" "}
          <a
            href="https://www.iso.org/standard/62021.html"
            className="text-primary font-medium underline-offset-2 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            ISO/IEC 18004
          </a>
          . Denso Wave published the format;{" "}
          <a
            href="https://en.wikipedia.org/wiki/QR_code"
            className="text-primary font-medium underline-offset-2 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Wikipedia’s QR code article
          </a>{" "}
          is a clear public overview. Apple’s Camera app has read QR codes since iOS 11; current
          Android cameras do the same, which is why you should not tell customers to install a
          scanner app.
        </p>
        <p className="text-sm text-slate-500">
          Written by the{" "}
          <Link href="/about" className="text-primary font-semibold hover:underline">
            QR Junction team
          </Link>
          {" · "}
          India{" · "}
          Updated 28 October 2026{" · "}
          <Link href="/changelog" className="hover:underline">
            Changelog
          </Link>
        </p>
      </section>

      <section id="how-to" className="scroll-mt-[var(--site-header-offset)]">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            How-to
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-4">
            How do you create a free QR code?
          </h2>
          <p className="text-slate-600 text-[17px] leading-relaxed">
            You do not need design software. Pick the action you want after the scan, fill one
            form, test with your camera, then download. If you skip the phone test, you will
            only find out the code failed after the flyers are printed.
          </p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 list-none p-0 m-0">
          {HOME_HOW_TO.map((step, idx) => (
            <li
              key={step.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative pt-10"
            >
              <span className="absolute -top-3 left-5 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <h3 className="font-bold text-[#001B50] mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="which-qr" className="max-w-3xl mx-auto scroll-mt-[var(--site-header-offset)]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          Which QR code type should you use?
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          You should match the code to the job. A website QR opens a page. A Wi-Fi QR joins a
          network (it is not a link). A vCard QR saves your name and number into Contacts. A
          WhatsApp QR starts a chat with a pre-filled line. A PDF or menu QR opens a document
          or live menu. A Google Review QR should open your Maps write-review link, not a
          generic search for your shop name.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600">
          If you are unsure, start with a{" "}
          <Link href="/url-qr-code-generator" className="text-primary font-semibold hover:underline">
            URL QR
          </Link>{" "}
          for any https page, or open the dedicated{" "}
          <Link href="/wifi-qr-code-generator" className="text-primary font-semibold hover:underline">
            Wi-Fi
          </Link>
          ,{" "}
          <Link href="/vcard-qr-code-generator" className="text-primary font-semibold hover:underline">
            vCard
          </Link>
          ,{" "}
          <Link href="/menu-qr-code-generator" className="text-primary font-semibold hover:underline">
            menu
          </Link>
          , or{" "}
          <Link href="/google-review-qr-code-generator" className="text-primary font-semibold hover:underline">
            Google Review
          </Link>{" "}
          generator so the instructions stay specific.
        </p>
      </section>

      <section id="iphone-android" className="max-w-3xl mx-auto scroll-mt-[var(--site-header-offset)]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          Do QR codes work on iPhone and Android?
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          Yes. You point the built-in camera at the code and tap the system banner. Apple
          documents Camera QR support in iOS; Google’s Android camera and Lens read the same
          ISO pattern. WhatsApp, Instagram, YouTube, and Google Maps then take over if the
          payload is a link those apps understand.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600">
          What fails is almost never “the phone cannot scan.” It is a code printed too small,
          low contrast, a private Google Drive file, a missing +91 on a WhatsApp number, or a
          Wi-Fi QR with the wrong encryption. Test both operating systems from the distance a
          guest will actually stand.
        </p>
      </section>

      <section id="case-studies" className="scroll-mt-[var(--site-header-offset)]">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5" />
            Example workflows
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-4">
            How do Indian shops use QR codes?
          </h2>
          <p className="text-slate-600 text-[17px] leading-relaxed">
            These are product workflows we built for, not invented testimonials. You can copy
            the same setup today with the free generators and, if you need scan counts, a
            dashboard account.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Cafe / restaurant</p>
            <h3 className="text-lg font-bold text-[#001B50] mb-3">Table-tent menu plus Wi-Fi</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              You print a 4–5 cm menu QR on a matte tent so guests open today’s card on their
              phone instead of sharing a sticky paper menu. A second Wi-Fi QR on the same tent
              joins the guest network without you spelling the password. If dishes change at
              8 pm, you update the hosted menu or PDF at the same URL; the printed square stays.
            </p>
            <Link href="/menu-qr-code-generator" className="text-sm font-semibold text-primary hover:underline">
              Menu QR generator →
            </Link>
          </article>
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Retail / clinic</p>
            <h3 className="text-lg font-bold text-[#001B50] mb-3">Google review at the counter</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              You place a Google Review QR next to UPI after the bill is paid — the phone is
              already out. The code must open your Business Profile write-review link, not a
              Maps search that lists similarly named shops. Ask when the visit went well. One
              listing per outlet; do not reuse a mall code at a second branch.
            </p>
            <Link href="/google-review-qr-code-generator" className="text-sm font-semibold text-primary hover:underline">
              Google Review QR →
            </Link>
          </article>
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Local services</p>
            <h3 className="text-lg font-bold text-[#001B50] mb-3">WhatsApp orders from a flyer</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              You print a WhatsApp QR with country code 91 and a pre-filled line such as “Hi, I
              want to order from the MG Road flyer.” The guest does not save your number first.
              Your inbox stays sortable because every scan arrives with the same source text.
              A phone-call QR is a different tool — only use it if you actually want a voice call.
            </p>
            <Link href="/whatsapp-qr-code-generator" className="text-sm font-semibold text-primary hover:underline">
              WhatsApp QR →
            </Link>
          </article>
        </div>
      </section>

      <section id="static-vs-dynamic" className="max-w-3xl mx-auto scroll-mt-[var(--site-header-offset)]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          What is a static QR code vs a dynamic QR code?
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          A static QR encodes the destination in the black-and-white pattern. Nobody can change
          it without printing a new image. That is why it never “expires” and why it still works
          if our website is down. A dynamic QR encodes a short redirect you control. You can
          swap the landing page after print and see scan counts in the dashboard.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600">
          If your Diwali offer URL will die in November, do not burn it into 5,000 flyers as a
          static code. If you are encoding a stable homepage, Wi-Fi password, or vCard, static
          is enough and you can generate it here without an account.
        </p>
      </section>

      <section id="sources" className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-4">
          <BookOpen className="w-4 h-4" />
          Sources we cite
        </div>
        <h2 className="text-2xl font-extrabold text-[#001B50] mb-4">
          Where does QR technology come from?
        </h2>
        <ul className="space-y-3 text-slate-600 text-[15px] leading-relaxed">
          <li>
            <CheckCircle2 className="w-4 h-4 text-primary inline mr-2 align-text-bottom" />
            <a href="https://www.iso.org/standard/62021.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              ISO/IEC 18004
            </a>{" "}
            — the international QR Code specification.
          </li>
          <li>
            <CheckCircle2 className="w-4 h-4 text-primary inline mr-2 align-text-bottom" />
            <a href="https://en.wikipedia.org/wiki/QR_code" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Wikipedia, “QR code”
            </a>{" "}
            — history (Denso Wave, 1994) and how modules, error correction, and cameras work.
          </li>
          <li>
            <CheckCircle2 className="w-4 h-4 text-primary inline mr-2 align-text-bottom" />
            Apple Camera (iOS 11+) and Google Android Camera / Lens — native QR reading, which
            is why a website or Wi-Fi QR does not need a third-party scanner app.
          </li>
          <li>
            <CheckCircle2 className="w-4 h-4 text-primary inline mr-2 align-text-bottom" />
            Google Business Profile review links, WhatsApp click-to-chat, and Instagram profile
            URLs — the destinations our specialised generators encode.
          </li>
        </ul>
      </section>

      <section id="home-faq" className="max-w-3xl mx-auto scroll-mt-[var(--site-header-offset)]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight">
            People also ask about free QR codes
          </h2>
          <p className="text-slate-500 mt-3">
            Direct answers you can use before you generate. More detail lives on the{" "}
            <Link href="/faq" className="text-primary font-semibold hover:underline">
              FAQ page
            </Link>
            .
          </p>
        </div>
        <div className="space-y-3">
          {HOME_FAQS.map((item) => (
            <details
              key={item.q}
              className="group bg-white border border-slate-200 rounded-2xl px-5 py-4 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-bold text-[#001B50] text-[17px] flex items-start justify-between gap-4">
                <h3 className="text-[17px] font-bold m-0 leading-snug">{item.q}</h3>
                <span className="text-slate-400 group-open:rotate-45 transition-transform text-2xl leading-none">
                  +
                </span>
              </summary>
              <p className="text-slate-600 text-sm leading-relaxed mt-3 pr-8">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <aside className="max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 flex gap-4">
        <Quote className="w-8 h-8 text-primary shrink-0" />
        <div>
          <p className="text-slate-700 leading-relaxed mb-2">
            QR Junction is built in India for print that has to work the first time: cafes,
            counters, visiting cards, and packaging. If a scan fails, it is usually size,
            contrast, or the destination — not the phone.
          </p>
          <p className="text-sm text-slate-500">
            <Link href="/about" className="font-semibold text-primary hover:underline">
              About the team
            </Link>
            {" · "}
            <Link href="/changelog" className="hover:underline">
              Product changelog
            </Link>
            {" · "}
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
