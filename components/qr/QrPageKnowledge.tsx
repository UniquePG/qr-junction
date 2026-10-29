import { QR_PAGE_FAQS } from "@/lib/qrPageSeo";
import { HelpCircle } from "lucide-react";
import Link from "next/link";

export default function QrPageKnowledge() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-16 pt-8 pb-4">
      <section id="create-online">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          Create a QR code online
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          Create a QR code online in this maker: pick URL, Wi-Fi, vCard, WhatsApp, or
          another type, fill the field, generate, then style. The homepage is the
          quick{" "}
          <Link href="/" className="text-primary font-semibold hover:underline">
            free QR code generator
          </Link>
          . This page is the same engine with colours, logo, frames, and SVG export.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600">
          Scan-test on an iPhone and an Android before you send a file to print. A
          logo that looks fine on a laptop often fails on a mid-range phone in cafe
          light.
        </p>
      </section>

      <section id="no-signup">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          QR code maker, no signup
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          This QR code maker needs no signup for a static code. The pattern is the
          data. It still scans if our site is down. Open an account only if you need
          scan counts or a destination you can change after the flyers are printed.
        </p>
        <p className="text-[17px] leading-[1.75] text-slate-600">
          Dynamic codes, restaurant menus, and review flows live in the{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            dashboard
          </Link>
          . They are a different product, not a lock on this download.
        </p>
      </section>

      <section id="custom-logo">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          Custom QR code with logo
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          Create a custom QR code with logo on this maker: generate first, set error
          correction to H, keep the mark small in the centre on a light plate. Cover
          a finder square and cheap cameras shrug. The how-to with print tests is{" "}
          <Link
            href="/blog/how-to-create-a-custom-qr-code-with-logo"
            className="text-primary font-semibold hover:underline"
          >
            custom QR code with logo
          </Link>
          . This page is the file.
        </p>
      </section>

      <section id="branded-design">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          Branded QR code design
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          Branded QR code design is still a scannable grid. Match brand navy, not
          brand yellow on cream. Frames labelled Scan for menu or WiFi help humans.
          They must sit outside the quiet zone. Pretty is a constraint, not the goal.
        </p>
      </section>

      <section id="color-customization">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight mb-5">
          QR code color customization
        </h2>
        <p className="text-[17px] leading-[1.75] text-slate-600 mb-4">
          QR code color customization here means dark modules on a light background.
          Gradients muddy edges. Inverted (light-on-dark) codes fail on a surprising
          number of Androids. Download SVG for print, PNG for stories, then scan a
          proof — not only the laptop preview.
        </p>
      </section>

      <section id="qr-faq">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#001B50] tracking-tight">
            QR code maker FAQs
          </h2>
        </div>
        <div className="space-y-3">
          {QR_PAGE_FAQS.map((item) => (
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
    </div>
  );
}
