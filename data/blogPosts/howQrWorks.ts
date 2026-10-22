import type { BlogPost } from "@/data/blogTypes";

export const howQrWorksBlog: BlogPost = {
  slug: "how-qr-codes-actually-work-explained-like-youre-10",
  seo: {
    title: "How QR Codes Work: Finder Patterns, Scanning & Error Correction",
    description:
      "How do QR codes work? Finder patterns, binary modules, what your camera does after a scan, and why a logo in the middle still reads. Simple 2026 explainer.",
    keywords: [
      "how QR codes work",
      "how does a QR code work",
      "QR code explained",
      "QR code finder pattern",
      "QR code error correction",
      "how QR scanner works",
    ],
    ogImage: "/assests/qr-how-it-works-og.png",
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
    title: "How QR Codes Actually Work (Explained Like You're 10)",
    subtitle:
      "The square is a note. Your phone is the reader. Finder patterns, 0s and 1s, and error correction are why it still works when the print is a bit scuffed.",
    image: "/assests/blogs/how-qr-works-hero.png",
    imageAlt:
      "Illustration showing how a QR code works with scanner and website connection",
  },
  howTo: {
    name: "What happens when you scan a QR code",
    steps: [
      {
        title: "The camera finds the three big corners",
        text: "Finder patterns tell the phone where the code starts, even if you hold it at an angle.",
      },
      {
        title: "Modules are read as 0s and 1s",
        text: "Dark and light squares become the original payload: a URL, WIFI: string, vCard, and so on.",
      },
      {
        title: "Error correction fills gaps",
        text: "Scratches, a small logo, or a thumb over a corner can still leave enough data to rebuild the message.",
      },
      {
        title: "The phone runs the matching action",
        text: "Browser, join-WiFi sheet, save-contact, or a WhatsApp chat. The square itself never “runs code”.",
      },
    ],
  },
  relatedSlugs: [
    "what-is-a-qr-code-and-why-everyone-is-using-it",
    "how-to-create-a-custom-qr-code-with-logo",
    "are-qr-codes-safe-common-myths-and-real-facts",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "You point the camera at a menu tent. A website opens. It feels like a trick. It is closer to a very fast photocopy of a note somebody left on the table.",
        "If you only needed the meaning of the word, start at [what is a QR code](/blog/what-is-a-qr-code-and-why-everyone-is-using-it). This page is the mechanism: what is inside the grid, how the phone reads it, and why a logo in the middle does not automatically kill the scan.",
      ],
    },
    {
      id: "what-is-inside",
      heading: "What is actually inside a QR code?",
      content: [
        "A QR code is a box of data. That data might be a website, a WiFi password, a phone number, a payment string, or a vCard.",
        "Each small square is a bit. Dark is usually 1, light is 0. Row by row, those bits rebuild the original text. Denso Wave designed this in 1994 so factory scanners could read parts from any angle. Your camera is doing the same job, just prettier.",
        "You do not need to know binary to [generate a QR code](/qr). The generator draws the grid. The phone undoes the drawing.",
      ],
      image: {
        src: "/assests/blogs/qr-grid-structure.png",
        alt: "Close up visual breakdown of QR code grid structure and finder patterns",
        width: 1200,
        height: 800,
      },
    },
    {
      id: "how-scanner-reads",
      heading: "How does your phone read it?",
      content: [
        "First it looks for the three big corner squares — finder patterns. They mark “this is a QR, here is up.” That is why a slightly tilted scan still works.",
        "Then it reads the modules, including alignment patterns on larger codes, and converts the grid back into text. If that text is a URL, the browser opens. If it is a `WIFI:…` payload, you get a join prompt. If it is `BEGIN:VCARD`, you get save contact. The type is in the data, not in the ink.",
      ],
    },
    {
      id: "why-it-works-fast",
      heading: "Why it is so fast (and why logos still scan)",
      content: [
        "QR codes were built for factories, not Instagram. They include error correction: spare data so the phone can rebuild missing pieces. Levels go L, M, Q, H. H is what you want if you put a mark in the centre.",
        "People quote “30% can be damaged.” That is for scattered damage at high correction, not a giant sticker. Keep logos smaller than that myth. Practical rules: [custom QR code with logo](/blog/how-to-create-a-custom-qr-code-with-logo).",
      ],
      list: [
        "Any angle — finder patterns tell the camera where the edges are.",
        "Partial damage — error correction rebuilds missing modules.",
        "More data than a 1D barcode — thousands of characters if you really want them (shorter is easier to scan).",
        "Low light — modern cameras cope; glossy lamination still wins at ruining contrast.",
      ],
    },
    {
      id: "what-happens-after",
      heading: "What happens after you scan?",
      content: [
        "Decode. Choose an action. That is it. The QR does not install an app. It does not “hack” the phone. It hands over a string. Phishing websites are a destination problem, not a square problem — see [QR code safety](/blog/are-qr-codes-safe-common-myths-and-real-facts).",
      ],
      list: [
        "URL — browser or in-app webview.",
        "vCard — save contact.",
        "WiFi — join network prompt.",
        "wa.me link — WhatsApp chat.",
        "Plain text — show the text.",
      ],
    },
    {
      id: "simple-analogy",
      heading: "Think of it like a bookmark in the real world",
      content: [
        "You would not retype a 60-character URL off a poster. A QR code is the poster’s bookmark. Scan, action. The square is the note. The phone is the person who reads it.",
      ],
      quote: {
        text: "QR codes don't perform actions. They simply tell your device what action to perform.",
      },
    },
    {
      id: "final-thoughts",
      heading: "Once it is not magic, it is useful",
      content: [
        "You can put almost any short instruction in a grid and tape it to a wall. Menu, WiFi, review form, chat. Generate one, print one, scan it in bad light. If that works, print the rest.",
      ],
    },
  ],
  faq: [
    {
      q: "How does a QR code work?",
      a: "The camera finds the three corner squares, reads dark and light modules as bits, rebuilds a string of data, then opens the matching action (link, WiFi, contact, chat).",
    },
    {
      q: "Why do QR codes have three squares in the corners?",
      a: "Those are finder patterns. They tell the scanner where the code is and which way is up, so you can scan at an angle.",
    },
    {
      q: "How can a QR code still scan with a logo in the middle?",
      a: "Error correction stores spare data. A small centre logo is usually fine at level H. A huge logo covering a finder square is not.",
    },
    {
      q: "Does scanning a QR code put a virus on my phone?",
      a: "No. Scanning only reads data. Harm comes from a fake website you then type secrets into, the same as a phishing SMS.",
    },
  ],
  cta: {
    text: "Create a QR code and see the grid yourself",
    link: "/qr",
  },
};
