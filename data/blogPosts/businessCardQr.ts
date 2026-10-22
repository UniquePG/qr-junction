import type { BlogPost } from "@/data/blogTypes";

export const businessCardQrBlog: BlogPost = {
  slug: "qr-codes-for-business-cards-the-complete-guide",
  seo: {
    title: "QR Code on a Business Card: vCard, LinkedIn, Size & Dynamic Links",
    description:
      "How to add a QR code to a business card: what to link (vCard, LinkedIn, WhatsApp, calendar), 2cm minimum size, SVG, and why the code should be dynamic.",
    keywords: [
      "QR code for business card",
      "business card QR code",
      "vCard QR code",
      "add QR code to business card",
      "digital business card QR",
      "QR code size business card",
    ],
    ogImage: "/assests/blogs/business-card-qr-hero.png",
  },
  author: {
    name: "QR Junction Team",
    bio: "We build QR tools that restaurants actually print and use.",
    avatar: "/NewLogo/logo-192x192.png",
  },
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-22",
  readTime: 9,
  hero: {
    title: "QR Codes for Business Cards: The Complete Guide",
    subtitle:
      "The card is the handshake. The QR is the save-to-phone. Link it at something useful — vCard, LinkedIn, WhatsApp — and make it dynamic so a job change does not kill 200 prints.",
    image: "/assests/blogs/business-card-qr-hero.png",
    imageAlt: "Professional business card with QR code on the back",
  },
  howTo: {
    name: "How to add a QR code to a business card",
    steps: [
      {
        title: "Pick the destination",
        text: "vCard, LinkedIn, portfolio, calendar, or WhatsApp — not a generic homepage by default.",
      },
      {
        title: "Generate a dynamic QR",
        text: "You will change jobs or URLs. The paper should not care.",
      },
      {
        title: "Download SVG",
        text: "Place it at 100% size, at least 2 cm, with a quiet zone.",
      },
      {
        title: "Put a one-line CTA under it",
        text: "“Scan to save contact” beats a naked square.",
      },
      {
        title: "Print one proof and scan it",
        text: "Then send the file to the printer.",
      },
    ],
  },
  relatedSlugs: [
    "how-to-create-a-custom-qr-code-with-logo",
    "how-to-create-a-whatsapp-qr-code-for-business",
    "static-vs-dynamic-qr-codes-which-one-do-you-actually-need",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "Cards still get handed over. They also still die when you change roles. A QR on the back is how the paper keeps working: the card stays, the destination moves.",
        "Generate the contact type on the [vCard QR generator](/vcard-qr-code-generator) or a dynamic URL to a [landing page](/dashboard/pages/new).",
      ],
    },
    {
      id: "what-to-link-to",
      heading: "What should a business card QR link to?",
      content: [
        "Homepage is the lazy default. After a handshake they want to save you, stalk you professionally, or book you.",
      ],
      list: [
        {
          text: "vCard or digital card — The save-to-phone option",
          sublist: [
            "Contact details, socials, one tap to save.",
            "Use the [vCard generator](/vcard-qr-code-generator) or a hosted page with a save button.",
          ],
        },
        {
          text: "LinkedIn — Trust for B2B",
          sublist: ["Networking events. Use [LinkedIn QR](/linkedin-qr-code-generator)."],
        },
        {
          text: "Portfolio site — For people who make things",
          sublist: ["Let the work talk. Dynamic URL if the domain might change."],
        },
        {
          text: "Calendar / booking — For services",
          sublist: ["Skip the email tennis."],
        },
        {
          text: "WhatsApp — For India-first follow-up",
          sublist: [
            "Pre-filled “Hi, we met at…” — [WhatsApp QR guide](/blog/how-to-create-a-whatsapp-qr-code-for-business).",
          ],
        },
      ],
      image: {
        src: "/assests/blogs/business-card-qr-destinations.png",
        alt: "Options for a business card QR code: vCard, LinkedIn, portfolio, calendar, WhatsApp",
        caption: "Match the destination to the meeting, not to your homepage out of habit.",
        width: 1200,
        height: 680,
      },
    },
    {
      id: "how-to-add",
      heading: "How to add the QR to the card",
      content: ["Tech is easy. Print is where cards fail."],
      list: [
        "Step 1: Lock the destination first.",
        "Step 2: Dynamic QR on QR Junction.",
        "Step 3: SVG, not a screenshot.",
        "Step 4: Back of the card is standard.",
        "Step 5: One-line CTA.",
        "Step 6: At least 2 cm. Smaller and cheap cameras struggle.",
        "Step 7: Scan a printed proof.",
      ],
    },
    {
      id: "design-considerations",
      heading: "Design tips",
      content: [
        "A clashy QR looks sloppy. Match brand colours, keep dark-on-light, small centre mark, never squash the file in Canva. [Custom QR with logo](/blog/how-to-create-a-custom-qr-code-with-logo) covers the scan physics.",
      ],
    },
    {
      id: "why-dynamic",
      heading: "Why business card QRs should be dynamic",
      content: [
        "Job change, new site, new WhatsApp. Static cards become litter. Dynamic: update the dashboard. Bonus: you see which events actually got scans. That is not creepy. That is whether the room was worth the travel.",
      ],
    },
    {
      id: "digital-business-cards",
      heading: "Physical card + digital card",
      content: [
        "Minimal paper. Mobile page with photo, links, save contact. QR is the bridge. QR Junction landing pages are built for that hub.",
      ],
      image: {
        src: "/assests/blogs/physical-plus-digital-card.png",
        alt: "Physical business card QR code opening a digital business card on a smartphone",
        caption: "Paper for the impression. Page for the save. QR in between.",
        width: 1200,
        height: 700,
      },
    },
    {
      id: "final-thoughts",
      heading: "Give them a reason to scan",
      content: [
        "A card that only sits in a drawer already lost. A card that opens your work, your calendar, or your number is a follow-up you did not have to write.",
      ],
    },
  ],
  faq: [
    {
      q: "What is the best QR code for a business card?",
      a: "vCard if you want save-to-phone. LinkedIn or a digital card page if you want a richer follow-up. Always dynamic.",
    },
    {
      q: "How big should a QR code be on a business card?",
      a: "At least 2 cm × 2 cm plus quiet zone. Test the printed card on iPhone and Android.",
    },
    {
      q: "Can I use a vCard QR instead of a URL?",
      a: "Yes. A vCard payload saves the contact without a website. Generate one at the [vCard QR code generator](/vcard-qr-code-generator).",
    },
    {
      q: "Will inverted (white-on-dark) QRs scan on cards?",
      a: "Sometimes. Many cameras hate them. Dark modules on a light patch is safer. Test.",
    },
  ],
  cta: {
    text: "Create a business card QR code",
    link: "/vcard-qr-code-generator",
  },
};
