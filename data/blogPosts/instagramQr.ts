import type { BlogPost } from "@/data/blogTypes";

export const instagramQrBlog: BlogPost = {
  slug: "how-to-create-an-instagram-qr-code",
  seo: {
    title: "How to Create an Instagram QR Code (Free, Camera-Scan, 2026)",
    description:
      "Create an Instagram QR code that opens your profile from any camera — not just Instagram’s in-app Nametag. Steps, print size, CTA copy, and dynamic tracking.",
    keywords: [
      "Instagram QR code",
      "how to create Instagram QR code",
      "Instagram profile QR code",
      "Instagram Nametag vs QR code",
      "QR code for Instagram",
      "social media QR code",
    ],
    ogImage: "/assests/blogs/instagram-qr-hero.png",
  },
  author: {
    name: "QR Junction Team",
    bio: "We build QR tools that restaurants actually print and use.",
    avatar: "/NewLogo/logo-192x192.png",
  },
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-22",
  readTime: 8,
  hero: {
    title: "How to Create an Instagram QR Code (Free, in Under 2 Minutes)",
    subtitle:
      "Stop spelling your handle. A camera-scan Instagram QR opens the profile. Instagram’s own Nametag only works if they already have the app open.",
    image: "/assests/blogs/instagram-qr-hero.png",
    imageAlt: "Smartphone showing Instagram profile opened by scanning a QR code",
  },
  howTo: {
    name: "How to create an Instagram QR code",
    steps: [
      {
        title: "Copy your profile URL",
        text: "instagram.com/yourusername — from the browser or Share profile in the app.",
      },
      {
        title: "Paste it into the Instagram or URL generator",
        text: "Use QR Junction’s Instagram QR page so the code is built for that job.",
      },
      {
        title: "Style it, keep contrast high",
        text: "Brand colour is fine. A huge logo covering a finder square is not.",
      },
      {
        title: "Use dynamic if this is for a shop",
        text: "You will want scan counts and a chance to change the URL if you rename the account.",
      },
      {
        title: "Download SVG for print, test with Camera",
        text: "Not with Instagram already open. The whole point is Camera.",
      },
    ],
  },
  relatedSlugs: [
    "how-to-create-a-whatsapp-qr-code-for-business",
    "qr-codes-for-business-cards-the-complete-guide",
    "how-to-create-a-custom-qr-code-with-logo",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "Every time someone asks for your Instagram, a slice of them types it wrong or never types it. An Instagram QR code is the adult version of spelling it twice.",
        "Make one on the [Instagram QR code generator](/instagram-qr-code-generator). This guide is where it goes, why Nametag is the wrong tool for a poster, and what to write next to the square.",
      ],
    },
    {
      id: "why-instagram-qr",
      heading: "Why an Instagram QR code is worth having",
      content: [
        "Instagram’s built-in code (Nametag) wants Instagram already open. A stranger at a stall has Camera open. A proper code encodes instagram.com/yourusername. Any camera, any phone. Same split as [WhatsApp’s in-app QR vs wa.me](/blog/how-to-create-a-whatsapp-qr-code-for-business).",
      ],
    },
    {
      id: "step-by-step",
      heading: "How to create your Instagram QR code",
      content: ["Under two minutes. Account only if you want it dynamic."],
      list: [
        "Step 1: Copy instagram.com/yourusername.",
        "Step 2: Open the [Instagram QR generator](/instagram-qr-code-generator) (or URL type on [/qr](/qr)).",
        "Step 3: Paste the profile URL.",
        "Step 4: Colours / small logo — see [custom QR with logo](/blog/how-to-create-a-custom-qr-code-with-logo).",
        "Step 5: Dynamic if you care about [scan tracking](/blog/how-to-track-qr-code-scans).",
        "Step 6: SVG for print, PNG for stories.",
        "Step 7: Test with the Camera app, not Instagram.",
      ],
      image: {
        src: "/assests/blogs/instagram-qr-steps.png",
        alt: "Step by step process of creating an Instagram QR code on QR Junction",
        caption: "Creating an Instagram QR code on QR Junction takes under two minutes.",
        width: 1200,
        height: 750,
      },
    },
    {
      id: "where-to-use",
      heading: "Where to actually use it",
      content: ["Close the gap between offline and a follow."],
      list: [
        "Visiting cards — handle readable, square scannable.",
        "Packaging — D2C, the product is already in their hands.",
        "Cafe tables — “Follow for daily specials”, separate from the [menu QR](/blog/how-to-create-a-qr-code-menu-for-your-restaurant).",
        "Booths, windows, thank-you cards, email signatures.",
      ],
    },
    {
      id: "tips-for-better-results",
      heading: "What actually makes it convert",
      content: [
        "The square is plumbing. The line next to it is the pitch. “Scan for the lookbook” beats “follow us”. Size: ~2.5 cm on a card, 5–6 cm on a poster seen from a metre. Dynamic if you want to know whether the window or the bag won.",
      ],
    },
    {
      id: "instagram-nametag-vs-qrjunction",
      heading: "Instagram Nametag vs a camera QR",
      content: [
        "Nametag: in-app only. Camera QR: any camera, optional analytics, you can point it at a Reel, a post, or a highlight later if the code is dynamic. For print, camera QR wins.",
      ],
    },
    {
      id: "final-thoughts",
      heading: "Stop making people type the handle",
      content: [
        "Create it, put it where the brand already is, track the scans, reprint the placements that work.",
      ],
    },
  ],
  faq: [
    {
      q: "How do I create an Instagram QR code for free?",
      a: "Copy your profile URL and paste it into the [Instagram QR code generator](/instagram-qr-code-generator). Download PNG or SVG. No account for a static code.",
    },
    {
      q: "Is Instagram’s built-in QR the same thing?",
      a: "No. Nametag is meant to be scanned inside Instagram. A camera QR works from the default Camera app, which is how strangers scan posters.",
    },
    {
      q: "Can I link to a Reel or a post instead of my profile?",
      a: "Yes. Paste that URL instead. Use a dynamic code if you might swap the destination later.",
    },
    {
      q: "What size should an Instagram QR be on a business card?",
      a: "About 2–2.5 cm with a quiet zone. Test the printed card, not only the screen preview.",
    },
  ],
  cta: {
    text: "Create your Instagram QR code",
    link: "/instagram-qr-code-generator",
  },
};
