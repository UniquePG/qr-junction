import type { BlogPost } from "@/data/blogTypes";

export const qrSafetyBlog: BlogPost = {
  slug: "are-qr-codes-safe-common-myths-and-real-facts",
  seo: {
    title: "Are QR Codes Safe? Quishing, Fake Stickers & How to Scan Smart",
    description:
      "Are QR codes safe to scan? Why they are not viruses, how quishing and table-tent swaps work, and a short checklist for customers and shop owners in 2026.",
    keywords: [
      "are QR codes safe",
      "QR code security",
      "QR code scam",
      "quishing",
      "QR code phishing",
      "fake QR code sticker",
      "safe QR scanning",
    ],
    ogImage: "/assests/blogs/qr-safety-hero.png",
  },
  author: {
    name: "QR Junction Team",
    bio: "We build QR tools that restaurants actually print and use.",
    avatar: "/NewLogo/logo-192x192.png",
  },
  publishedAt: "2026-02-15",
  updatedAt: "2026-10-22",
  readTime: 8,
  hero: {
    title: "Are QR Codes Safe? Common Myths, Quishing, and Real Facts",
    subtitle:
      "The square is not malware. The website can be. Quishing is just phishing that arrived through a camera instead of an email.",
    image: "/assests/blogs/qr-safety-hero.png",
    imageAlt: "Person scanning QR code safely with smartphone, checking the URL banner",
  },
  howTo: {
    name: "How to scan a QR code safely",
    steps: [
      {
        title: "Prefer codes that belong to the place you are in",
        text: "A tent printed with the restaurant name beats a fresh sticker on glass in a parking lot.",
      },
      {
        title: "Read the URL banner before you tap",
        text: "If it is not the brand you expected, stop. Do not type OTP, PIN, or card numbers.",
      },
      {
        title: "Look for a sticker on top of a sticker",
        text: "That overlay is the usual restaurant and parking scam.",
      },
      {
        title: "Use the built-in camera",
        text: "You do not need a random “QR scanner” app from an unknown publisher.",
      },
    ],
  },
  relatedSlugs: [
    "what-is-a-qr-code-and-why-everyone-is-using-it",
    "how-to-create-a-qr-code-menu-for-your-restaurant",
    "how-to-make-a-wifi-qr-code",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "A forward on the family WhatsApp group said QR codes steal your bank. Then you paid for chai with a scan. Both things exist. The panic is aimed at the wrong object.",
        "Are QR codes safe? The format is passive data, same as handwriting a URL. Quishing — QR phishing — is when someone points that data at a fake site. Emails have done this for twenty years. The camera is just a new envelope.",
      ],
    },
    {
      id: "myth1",
      heading: "Myth: QR codes are viruses",
      content: [
        "False. Scanning does not install software, open your gallery, or send your contacts. The code cannot “run” on the phone. It hands over a string. Calling QR codes viruses is like calling phone numbers viruses. What matters is who answers.",
      ],
    },
    {
      id: "real-risk",
      heading: "The real risk: the destination (quishing)",
      content: [
        "A malicious square can open a clone of your bank, a fake UPI collect page, or a “verify your card to see the menu” form. If you type secrets there, that is phishing. The square only delivered the address.",
        "Table-tent swaps are the restaurant version: a sticker over the real menu QR, pointing at a payment page. Print your shop name under the real code. Staff should glance at tents when they wipe tables. Guests should compare the domain on the banner with the name on the wall.",
      ],
      image: {
        src: "/assests/blogs/qr-security-warning.png",
        alt: "Warning illustration showing safe vs unsafe QR code scanning and quishing",
        width: 1200,
        height: 800,
      },
    },
    {
      id: "how-to-stay-safe",
      heading: "How to stay safe while scanning",
      content: [
        "You do not need a special app. You need the habits you already use on links in SMS.",
      ],
      list: [
        "Skip mystery stickers in public, especially overlays.",
        "Read the URL before entering anything. Typosquat domains are the tell.",
        "Never share OTP or PIN on a page you reached from a code you did not expect.",
        "Ask staff if a restaurant or parking QR looks freshly pasted.",
        "Generate your own business codes on a platform you trust — some throwaway tools wrap a redirect you do not control.",
      ],
    },
    {
      id: "business-safety",
      heading: "Are QR codes safe for businesses?",
      content: [
        "Hospitals, airports, and banks use them daily. If the format were poison, boarding passes would not exist. Your job as an owner is the destination: your own site, your own review form, your own [WiFi](/blog/how-to-make-a-wifi-qr-code) or [menu](/blog/how-to-create-a-qr-code-menu-for-your-restaurant) page — and physical codes that are hard to peel.",
        "Create codes at [QR Junction](/qr). Point them at pages you own. Inspect tents. That is the security program.",
      ],
    },
    {
      id: "final-thoughts",
      heading: "Drive carefully. Do not ban roads.",
      content: [
        "Scan from a source that matches the room you are in. Check the URL. Do not type bank secrets into a surprise form. Do that, and the square is as safe as any other link — which is to say, as safe as your next tap.",
      ],
    },
  ],
  faq: [
    {
      q: "Are QR codes safe to scan?",
      a: "Yes to read them. Danger starts if you enter passwords, OTPs, or card numbers on a site you do not recognise. Check the URL banner first.",
    },
    {
      q: "What is quishing?",
      a: "Phishing delivered by a QR code. The code opens a fake login or payment page. The scam is the page, not the pattern.",
    },
    {
      q: "Can a QR code steal my UPI PIN?",
      a: "Only if you type the PIN on a fake app or website after the scan. Legitimate UPI collect requests still need your confirmation in your real app.",
    },
    {
      q: "How do restaurants stop fake menu QRs?",
      a: "Print the restaurant name under the code, use inserts that tear if peeled, and check tents during service. Guests should see a domain that matches the shop.",
    },
    {
      q: "Do I need a special scanner app?",
      a: "No. The built-in iPhone or Android camera is enough and safer than unknown scanner apps.",
    },
  ],
  cta: {
    text: "Generate QR codes on a platform you control",
    link: "/qr",
  },
};
