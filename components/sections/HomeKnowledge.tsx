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
          QR Junction is a free QR code generator built for owners. The restaurant suite turns a
          photo of your paper menu into a phone menu in under a minute, so guests scan a table QR
          and see today’s dishes and prices. The review suite puts one QR on the counter: the guest
          rates the visit and can use a short draft, then edit it, before it reaches Google. Dynamic
          codes can change after print. Several of them can sit in one campaign, and a scan can
          collect a name and email tagged to that code. A website, Wi-Fi, WhatsApp, or visiting-card
          code still downloads with no signup.
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
      </section>

      <section id="how-to" className="scroll-mt-[var(--site-header-offset)]">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            How-to
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-4">
            How do you create a QR code online?
          </h2>
          <p className="text-slate-600 text-[17px] leading-relaxed">
            You do not need design software. Create a QR code online: pick the action you want
            after the scan, fill one form, test with your camera, then download. If you skip the
            phone test, you will only find out the code failed after the flyers are printed.
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

      <section id="no-signup" className="max-w-3xl mx-auto scroll-mt-[var(--site-header-offset)]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          QR code maker, no signup
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          This QR code maker needs no signup for a static code. You create a QR code online,
          download PNG or SVG, and the pattern works without our servers. Open an account only
          if you need scan counts or an editable link after print.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600">
          A watermarked “free” download is not free once it is on a visiting card. Static files
          from this generator are unmarked. The{" "}
          <Link href="/qr" className="text-primary font-semibold hover:underline">
            custom QR code maker
          </Link>{" "}
          adds colours, a logo, and frames in the same no-account flow.
        </p>
      </section>

      <section id="which-qr" className="max-w-3xl mx-auto scroll-mt-[var(--site-header-offset)]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          Which QR code type should you use?
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          Match the code to the job. A restaurant menu QR should open a phone menu you can edit,
          not a photo or a PDF of last month’s card. A review QR should open your own Google
          review page, not a search that lists every shop with a similar name. A vCard QR saves
          your name and number into Contacts. A website QR opens a page. A Wi-Fi QR joins a
          network — it is not a link. A WhatsApp QR starts a chat with a pre-filled line.
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
            How do restaurants and shops use these QR codes?
          </h2>
          <p className="text-slate-600 text-[17px] leading-relaxed">
            These are the setups the product is built for. They are workflows, not customer
            stories. A restaurant starts from the paper menu. A shop starts from the review
            stand. A campaign is how you tell a window poster from a flyer, and how a name and email
            get saved against the right code. Anyone who still hands out visiting cards can put one QR
            on the card.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Restaurant suite</p>
            <h3 className="text-lg font-bold text-[#001B50] mb-3">Paper menu to phone menu</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              You photograph the menu already on the counter, or upload the PDF. Dish names,
              prices, and veg marks come back as a list you can fix. Most menus are ready to
              check in under a minute. Guests then scan a 4–5 cm code on the table tent and
              see today’s card, not a pinch-to-zoom file. At 8 pm you hide a sold-out dish or
              change a price. The printed square stays. When you want it, guests can send the
              order from that same phone menu.
            </p>
            <Link href="/register" className="text-sm font-semibold text-primary hover:underline">
              Start a restaurant menu →
            </Link>
          </article>
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Review suite</p>
            <h3 className="text-lg font-bold text-[#001B50] mb-3">A review QR after the bill</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              You place one code next to UPI once the bill is paid — the phone is already out.
              The guest picks stars. If they want help, a short draft appears and they can
              change any word before it is posted. The code opens your own Google review page,
              not a search full of similarly named shops. You still see every rating and
              comment in one inbox. One listing per outlet. Do not reuse a mall code at a
              second branch.
            </p>
            <Link href="/register" className="text-sm font-semibold text-primary hover:underline">
              Set up a review QR →
            </Link>
          </article>
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Any owner</p>
            <h3 className="text-lg font-bold text-[#001B50] mb-3">Visiting card that stays current</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              You print one QR on the card you already hand out. The other person scans it and
              saves your name, phone, and email into their contacts. No one types a number
              wrong. If you change your mobile, you update it once and the cards already in
              wallets still work. The same idea fits a clinic desk, a salon, or a shop counter.
            </p>
            <Link href="/vcard-qr-code-generator" className="text-sm font-semibold text-primary hover:underline">
              Make a digital card →
            </Link>
          </article>
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Campaigns</p>
            <h3 className="text-lg font-bold text-[#001B50] mb-3">Different codes, one campaign, real leads</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              You print a dynamic QR on the shop window, another on the MG Road flyer, and a third
              on the counter. They belong to one campaign, such as Diwali week. Next week the offer
              changes, so you point the codes at the new page. The printed squares stay. When
              someone scans and leaves a name, email, and phone, that lead is saved with the
              campaign and the exact code they used. You can add a note and move the lead from new
              to contacted.
            </p>
            <Link href="/register" className="text-sm font-semibold text-primary hover:underline">
              Start a campaign →
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
          swap the landing page after print and see scan counts in the dashboard. Put a different
          dynamic code on the window, the flyer, and the counter, then group them as one campaign.
          If the page asks for a name and email, that person is saved as a lead on the code they scanned.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600">
          The full comparison is{" "}
          <Link
            href="/blog/static-vs-dynamic-qr-codes-which-one-do-you-actually-need"
            className="text-primary font-semibold hover:underline"
          >
            dynamic QR code vs static
          </Link>
          . If you need to change the link after print, that is an{" "}
          <Link
            href="/blog/what-is-an-editable-qr-code"
            className="text-primary font-semibold hover:underline"
          >
            editable QR code
          </Link>
          {" "}
          — a changeable QR code link, not a PNG you rewrite. Home Wi-Fi and a stable page can
          stay static here without an account.
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
            People also ask about creating a QR code online
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
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
