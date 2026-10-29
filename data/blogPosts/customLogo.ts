import type { BlogPost } from "@/data/blogTypes";

export const customLogoBlog: BlogPost = {
  slug: "how-to-create-a-custom-qr-code-with-logo",
  seo: {
    title: "How to Create a Custom QR Code with Logo (That Still Scans)",
    description:
      "Add a logo to a QR code without killing the scan. Error correction, quiet zone, contrast, SVG vs PNG, and a test you should run before any print run.",
    keywords: [
      "custom QR code with logo",
      "custom QR code",
      "QR code with logo",
      "QR code generator with logo",
      "branded QR code design",
      "QR code color customization",
      "branded QR code",
      "color QR code",
      "does a logo break a QR code",
      "QR code SVG vs PNG",
    ],
    ogImage: "/assests/blogs/custom-qr-logo-hero.png",
  },
  author: {
    name: "QR Junction Team",
    bio: "We build QR tools that restaurants actually print and use.",
    avatar: "/NewLogo/logo-192x192.png",
  },
  publishedAt: "2026-10-22",
  updatedAt: "2026-10-29",
  readTime: 10,
  hero: {
    title: "How to Create a Custom QR Code with Your Logo (That Still Scans)",
    subtitle:
      "A logo in the middle is fine. Covering a finder square, going light-grey on cream, or quoting “30% logo coverage” as gospel is how print jobs bounce back.",
    image: "/assests/blogs/custom-qr-logo-hero.png",
    imageAlt:
      "Custom QR code with a brand logo in the centre, high contrast, print-ready on a desk",
  },
  howTo: {
    name: "How to create a custom QR code with a logo",
    steps: [
      {
        title: "Start with a short destination",
        text: "Shorter data means a quieter pattern, which leaves more room for a logo.",
      },
      {
        title: "Set error correction to H",
        text: "Level H is what you want once a centre logo covers part of the modules.",
      },
      {
        title: "Keep the logo small and on a light plate",
        text: "Aim nearer 15–20% of the area, not a giant badge. Do not sit it on a finder square.",
      },
      {
        title: "Use dark modules on a light background",
        text: "Brand colours are fine if contrast stays high. Skip inverted light-on-dark unless you test hard.",
      },
      {
        title: "Export SVG for print, PNG for screens, then scan both",
        text: "Test iPhone and Android at the printed size, in dim light, before you send the file to the printer.",
      },
    ],
  },
  relatedSlugs: [
    "how-to-make-a-wifi-qr-code",
    "qr-codes-for-business-cards-the-complete-guide",
    "static-vs-dynamic-qr-codes-which-one-do-you-actually-need",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "A baker in Jaipur sent us a gold QR on a kraft sleeve. Looked expensive. Did not scan unless you stood under the tube light and held your breath. The logo was huge, the modules were the same brown as the paper, and error correction was left on M because the generator defaulted there.",
        "A custom QR code is still a machine-readable grid. You can colour it, round the dots, drop a mark in the centre. You cannot negotiate with the three big squares in the corners. Those are finder patterns. Cover one and a lot of cameras shrug.",
        "Here is how to make a QR code with a logo that survives a real print, using the [free designer on QR Junction](/qr).",
      ],
    },
    {
      id: "anatomy",
      heading: "What you can decorate, and what you cannot",
      content: [
        "The three finder squares tell the camera where the code starts, even if you hold the phone crooked. Leave them dark, complete, and high-contrast. Corner dots inside them can change shape a little. Do not hide them under the brand mark.",
        "The quiet zone is the empty margin. Crop it in Figma to “make the code bigger” and you steal the thing scanners use to lock on. Keep at least four modules of clear space.",
        "The centre is the only comfortable place for a logo, and only because error correction can rebuild missing modules. That is also why the internet’s favourite line — “logos can cover 30%” — is sloppy. 30% is a figure for scattered damage at level H, not a solid sticker parked in the middle.",
      ],
      image: {
        src: "/assests/blogs/custom-qr-logo-anatomy.png",
        alt: "Anatomy of a QR code with logo showing finder squares, quiet zone, and safe logo area",
        caption: "Finder squares stay clear. Logo sits small in the centre on a light plate.",
        width: 1200,
        height: 675,
      },
    },
    {
      id: "custom-with-logo",
      heading: "Custom QR code with logo",
      content: [
        "A custom QR code with logo is this recipe: short payload, error correction H, logo 15–20% in the centre on a light plate, finder squares left alone. The [QR code maker](/qr) is the file. This page is why the baker’s gold-on-kraft sleeve failed.",
      ],
    },
    {
      id: "branded-design",
      heading: "Branded QR code design",
      content: [
        "Branded QR code design is still a machine-readable grid. Match brand navy. Do not match brand yellow on cream. Frames labelled Scan for menu or WiFi help humans more than cameras. Keep the frame outside the quiet zone. Pretty is a constraint, not the goal.",
      ],
    },
    {
      id: "logo-size",
      heading: "Logo size vs error correction",
      content: [
        "Set error correction to H before you upload anything. Level L is for clean industrial codes with no logo. M is a default. Q and H are what branded codes need.",
        "Keep the logo around 15–20% of the full square, with a little white padding so dark modules do not collide with dark artwork. If the mark is a detailed illustration, simplify it. A wordmark at 8 pt inside a QR is ego, not branding.",
        "Hide background dots behind the logo if your generator offers it. That punches a clean hole instead of speckles showing through the PNG. Then scan. If it fails, shrink the logo. Do not crank contrast on the photo of the logo and hope.",
      ],
    },
    {
      id: "colour",
      heading: "QR code color customization",
      content: [
        "QR code color customization is dark modules on a light background. That is the whole colour theory. Deep navy on white is safer than brand yellow on cream. Gradients on the dots look nice in a Dribbble shot and muddy the edges cameras need.",
        "Light modules on a dark background (inverted) fail on a surprising number of cheap Androids. If the campaign is black-on-black luxury, put the QR on a white sticker inside the dark design. Do not invert the code to match the poster and pray.",
        "Frames around the code — “Scan for menu”, “WiFi”, a coloured border — help humans more than machines. They also steal quiet zone if you draw them tight. Keep the frame outside the margin, not on top of it.",
      ],
    },
    {
      id: "formats",
      heading: "SVG vs PNG vs JPEG for a branded QR code",
      content: [
        "SVG is a vector. The squares stay sharp from a visiting card to a 6-foot standee. Send SVG to anyone doing offset or large-format work.",
        "PNG is a bitmap. Use it for Instagram, WhatsApp, slides. Export large (at least 1000 px, 2× or 3× if the tool allows) so nobody upscales a 300 px file in Canva.",
        "JPEG is a last resort. It adds compression artefacts on the module edges. Do not give a printer a JPEG QR and then ask why it “sometimes” scans.",
      ],
      table: {
        headers: ["File", "Use it for", "Avoid"],
        rows: [
          ["SVG", "Print, signage, packaging dies", "Email clients that strip SVG"],
          ["PNG", "Screens, stories, web", "Blowing up a tiny PNG for a hoarding"],
          ["JPEG", "Almost nothing QR-related", "Any print file"],
        ],
      },
      image: {
        src: "/assests/blogs/custom-qr-formats.png",
        alt: "SVG vs PNG vs JPEG comparison for printing a custom QR code with logo",
        caption: "If a printer asks for JPEG, send SVG and a large PNG and let them convert.",
        width: 1200,
        height: 675,
      },
    },
    {
      id: "test",
      heading: "The test that saves a reprint",
      content: [
        "Generate the custom QR on [qrjunction.in/qr](/qr). Print one copy at the final size on the final stock. Then:",
      ],
      list: [
        "Scan with an iPhone camera at 30 cm.",
        "Scan with an Android at about a metre, if that is the real distance.",
        "Dim the lights. Glossy cards fail here.",
        "Cover a corner of the logo with your thumb. If the code dies, the logo is too hungry.",
        "Try a slightly dirty camera lens. Guests have those.",
      ],
    },
    {
      id: "dynamic",
      heading: "Brand it, but keep it editable",
      content: [
        "A beautiful static code on 2,000 sleeves is still a brick if the URL changes. For packaging and visiting cards, generate a [dynamic QR](/blog/static-vs-dynamic-qr-codes-which-one-do-you-actually-need), then style it. The logo sits on a code you can retarget later.",
        "The designer on the public /qr page is the full styling playground (dots, corners, frames, logo). Dashboard codes start simpler and pick up frames in the design modal. Either way, test the downloaded file, not only the on-screen preview.",
      ],
    },
    {
      id: "final",
      heading: "Pretty is a constraint, not the goal",
      content: [
        "If the scan takes two tries, the logo lost. Shrink it, darken the modules, export SVG, print one, scan it in the worst light you have. Then print the rest.",
        "That is a custom QR code with a logo. Everything else is decoration.",
      ],
    },
  ],
  faq: [
    {
      q: "How do I create a custom QR code with logo?",
      a: "Generate on the [QR code maker](/qr), set error correction to H, keep the logo around 15–20% in the centre, leave finder squares clear, export SVG, scan a printed proof.",
    },
    {
      q: "What is branded QR code design?",
      a: "Branded QR code design is colour, logo, and a frame that still scans. Dark modules, light background. The maker is /qr. This page is the scan physics.",
    },
    {
      q: "What is QR code color customization?",
      a: "QR code color customization means dark-on-light modules. Gradients and inverted codes fail on cheap cameras. Navy on white is safer than brand yellow on cream.",
    },
    {
      q: "Does a logo break a QR code?",
      a: "It can, if it is large, low-contrast, or sitting on a finder square. With error correction H and a small centre mark, most cameras still read the code. Always scan a printed proof.",
    },
    {
      q: "What error correction should I use with a logo?",
      a: "H. Lower levels do not leave enough spare data once you punch a hole in the middle.",
    },
    {
      q: "Can I use a transparent background?",
      a: "Yes for digital placements on a light layout. On print, transparent on dark paper is an inverted-code problem. Put a white plate behind the code.",
    },
    {
      q: "What DPI should a QR code be for print?",
      a: "Do not think in DPI for vectors — send SVG. If you must send PNG, export at the physical size at 300 DPI (a 4 cm code is roughly 470 px at 300 DPI; go larger).",
    },
    {
      q: "Can I use my brand colour instead of black?",
      a: "Yes if the modules stay clearly darker than the background. Navy, maroon, charcoal work. Pastel on pastel does not.",
    },
    {
      q: "Should I add a frame around a branded QR code?",
      a: "A frame with a short instruction (“Scan for WiFi”) helps people. Keep it outside the quiet zone so you do not clip the code.",
    },
  ],
  cta: {
    text: "Design a custom QR code with your logo",
    link: "/qr",
  },
};
