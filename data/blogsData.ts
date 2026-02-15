// src/data/blogs.ts

export interface BlogPost {
  slug: string;
  seo: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
  author?: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  publishedAt?: string;
  updatedAt?: string;
  readTime?: number;
  hero: {
    title: string;
    subtitle: string;
    image?: string;
    imageAlt?: string;
  };
  sections: {
    id: string;
    heading?: string;
    content: string[];
    list?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    image?: {
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    };
    images?: {
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    }[];
    code?: {
      language: string;
      code: string;
    };
    quote?: {
      text: string;
      author?: string;
    };
  }[];
  cta: {
    text: string;
    link: string;
  };
}

export const blogs: Record<string, BlogPost> = {
  "what-is-a-qr-code-and-why-everyone-is-using-it": {
    slug: "what-is-a-qr-code-and-why-everyone-is-using-it",

    seo: {
      title:
        "What Is a QR Code? Meaning, Uses & Why QR Codes Are Everywhere in 2025",
      description:
        "What is a QR code and why is everyone using it in 2025? Learn how QR codes work, their uses, benefits, and how you can create one easily using QRJunction.",
      keywords: [
        "QR code",
        "QR code generator",
        "what is QR code",
        "QR code uses",
        "QR code benefits",
        "create QR code",
      ],
      ogImage: "/assests/og-image.png",
    },

    author: {
      name: "QR Junction Team",
      bio: "Experts in QR code technology and digital solutions",
    },

    publishedAt: "2025-01-27",
    readTime: 5,

    hero: {
      title: "What Is a QR Code and Why Everyone Is Using It in 2025",
      subtitle:
        "A simple, human-friendly guide to QR codes, their uses, and why they’re suddenly everywhere.",
    },

    sections: [
      {
        id: "introduction",
        content: [
          "Be honest — when was the last time you scanned a QR code?",
          "Yesterday? This morning? Five minutes ago while ordering food?",
          "QR codes have quietly become part of our daily lives. From restaurant menus and payments to event tickets and Instagram profiles — they’re everywhere.",
          "And yet, many people still ask: “What exactly is a QR code, and why is everyone suddenly obsessed with it?”",
          "Relax. You’re in the right place. Let’s break it down without technical headaches and in a way that actually makes sense.",
        ],
      },

      {
        id: "what-is-qr",
        heading: "What Is a QR Code? (Simple Explanation)",
        content: [
          "A QR Code (Quick Response Code) is a type of barcode that stores information like website links, phone numbers, text, payment details, WiFi passwords, PDFs, images, and more.",
          "Instead of typing long URLs or sharing files manually, a QR code lets you do everything with one simple scan using your smartphone camera.",
          "Scan → Open → Done. That’s it. No magic. No drama.",
        ],
      },

      {
        id: "why-quick-response",
        heading: "Why Is It Called a “Quick Response” Code?",
        content: [
          "Because it’s fast. Like really fast.",
          "Unlike old-school barcodes that store very little data, QR codes can store much more information and can be scanned from almost any angle.",
          "That means faster scanning, less effort, and a better user experience.",
        ],
      },

      {
        id: "why-popular-2025",
        heading: "Why Are QR Codes So Popular in 2025?",
        content: [
          "QR codes didn’t become popular overnight. A few real-world changes pushed them into the spotlight.",
        ],
        list: [
          "Everyone has a smartphone now — your camera is the scanner.",
          "Contactless interactions became the new normal.",
          "Now Businesses want speed and less printing cost.",
          "Marketers love connecting offline users to online platforms.",
        ],
      },

      {
        id: "use-cases",
        heading: "Common Uses of QR Codes (Real-Life Examples)",
        content: [
          "QR codes are not theoretical tools. People use them daily across industries.",
        ],
        list: [
          "Small businesses: payments, reviews, locations",
          "Restaurants: digital menus, orders, feedback",
          "Events: tickets, check-ins, guest info",
          "Students & teachers: notes, attendance, projects",
          "Professionals: portfolios, resumes, digital business cards",
        ],
      },

      {
        id: "safety",
        heading: "Are QR Codes Safe?",
        content: [
          "Short answer: Yes, if used correctly.",
          "QR codes themselves are safe. The risk depends on where the QR code leads.",
          "That’s why you should always use trusted QR code generators and avoid scanning unknown QR codes.",
        ],
      },

      {
        id: "static-vs-dynamic",
        heading: "Static vs Dynamic QR Codes",
        content: ["Here’s a quick comparison to clear the confusion."],
        table: {
          headers: ["Type", "Meaning"],
          rows: [
            ["Static QR Code", "Content cannot be changed after creation"],
            ["Dynamic QR Code", "Content can be updated anytime"],
          ],
        },
      },

      {
        id: "why-you-should-use",
        heading: "Why Should You Use QR Codes?",
        content: [
          "QR codes save time, reduce errors, improve user experience, and make you look professional.",
          "If information needs to be shared quickly and cleanly, QR codes are the answer.",
        ],
      },

      {
        id: "how-to-create",
        heading: "How to Create a QR Code Easily",
        content: [
          "This is where QRJunction.in comes in.",
          "With QRJunction, you can generate QR codes in seconds, without sign-up, and for multiple use cases.",
        ],
      },

      {
        id: "final-thoughts",
        heading: "Final Thoughts",
        content: [
          "QR codes aren’t a trend. They’re a tool.",
          "And in 2025, not using QR codes is simply making life harder for yourself.",
        ],
      },
    ],

    cta: {
      text: "Create your free QR code now at qrjunction.in",
      link: process.env.NEXT_PUBLIC_CLIENT_URL || "https://qrjunction.in",
    },
  },
 "how-qr-codes-actually-work-explained-like-youre-10": {
    slug: "how-qr-codes-actually-work-explained-like-youre-10",

    seo: {
      title:
        "How QR Codes Actually Work (Explained Like You're 10) – Simple Guide 2025",
      description:
        "Ever wondered how QR codes actually work? Learn in a simple, fun way how QR codes store data, how scanners read them, and what happens after you scan one.",
      keywords: [
        "how QR codes work",
        "QR code explained",
        "how QR scanner works",
        "QR code technology",
        "QR code data storage",
      ],
      ogImage: "/assests/qr-how-it-works-og.png",
    },

    author: {
      name: "QR Junction Team",
      bio: "Experts in QR code technology and digital solutions",
    },

    publishedAt: "2026-02-15",
    readTime: 6,

    hero: {
      title: "How QR Codes Actually Work (Explained Like You're 10)",
      subtitle:
        "No technical jargon. No boring theory. Just a simple explanation of how those little black squares magically open websites.",
      image: "/assests/blogs/how-qr-works-hero.png",
      imageAlt:
        "Illustration showing how a QR code works with scanner and website connection",
    },

    sections: [
      {
        id: "intro",
        content: [
          "Okay, imagine you're holding your phone. You see a weird black-and-white square printed on a menu, a poster, or a product box. You open your camera, point it at the square, and boom — a website opens.",
          "Feels like magic, right?",
          "But it's not magic. It's not some mysterious technology either. It's just really smart design — the kind of smart that makes your life easier without you even noticing.",
          "Once you understand how QR codes actually work, you'll realize they are one of the simplest inventions around. And you'll also start seeing them everywhere — because honestly, once you know what they do, they're incredibly useful.",
          "Let's explain this like you're 10 years old. Deal?",
        ],
      },

      {
        id: "what-is-inside",
        heading: "What Is Actually Inside a QR Code?",
        content: [
          "A QR code is basically a tiny box filled with data. That's really all it is.",
          "That data could be a website link, plain text, a phone number, a payment ID, a WiFi password, your business contact card, or literally anything else that can be written down digitally.",
          "Now here's the interesting part — those small black squares you see inside the QR code? Each one of them represents binary data. Binary means 0s and 1s. Think of each black square as a '1' and each white space as a '0'. Together, those patterns of 0s and 1s form a code that your phone can read and translate.",
          "The QR code was actually invented in 1994 by a Japanese company called Denso Wave. They originally designed it to track car parts in factories. Today, billions of people use them every day without even thinking about it.",
          "But don't worry. You don't need to understand binary numbers, Japanese engineering history, or any complicated stuff to use QR codes. Your phone does all the hard work — automatically, in less than a second.",
        ],
        image: {
          src: "/assests/blogs/qr-grid-structure.png",
          alt: "Close up visual breakdown of QR code grid structure",
          width: 1200,
          height: 800,
        },
      },

      {
        id: "how-scanner-reads",
        heading: "How Does Your Phone Read It?",
        content: [
          "When you point your camera at a QR code, the first thing your phone does is recognize the square shape. Those three big square corners you always see in QR codes? Those are called finder patterns. They exist specifically so your phone can instantly identify where the QR code begins and ends — no matter which angle you're holding your phone at.",
          "Once the camera locks on, your phone analyzes the full pattern of black and white boxes inside. It reads each row and column systematically, almost like how you'd read words on a page — just much, much faster.",
          "The scanner then converts those visual patterns into digital data — turning the squares back into the original information that was encoded into the QR code.",
          "If that data happens to be a website link, your phone simply passes it to your browser and opens it automatically.",
          "If it's a phone number, it prepares a call. If it's a WiFi password, it connects. The phone knows what to do because the data itself tells it what type of information it is.",
          "So technically, your phone is just doing a very fast translation job — squares in, information out.",
        ],
      },

      {
        id: "why-it-works-fast",
        heading: "Why Is It So Fast?",
        content: [
          "QR codes were specifically designed to be scanned at speed — in busy factories, on moving products, and in real-world conditions where things aren't always perfect.",
          "One of the most impressive features of QR codes is their built-in error correction. This means even if part of the QR code is scratched, smudged, torn, or partially covered, your phone can still read it correctly. The code contains extra, redundant data that allows it to reconstruct missing pieces on the fly.",
          "Depending on the error correction level chosen when the QR code was created, a QR code can remain fully scannable even when up to 30% of it is damaged or hidden. That's why you sometimes see QR codes with a logo placed right in the middle — the logo covers part of the code, but error correction fills in the gaps.",
          "This combination of smart design and error correction is why scanning feels instant. Your phone doesn't struggle. It just reads.",
        ],
        list: [
          "Can be scanned from any angle — the finder patterns guide your camera automatically",
          "Works even if partially damaged — built-in error correction recovers missing data",
          "Stores significantly more data than traditional barcodes — up to 4,000 characters",
          "Readable in low light conditions — most phone cameras handle this easily",
        ],
      },

      {
        id: "what-happens-after",
        heading: "What Happens After You Scan?",
        content: [
          "Here's the part most people don't think about — what actually happens in those milliseconds after your phone reads the QR code.",
          "After scanning, your phone decodes the data stored in the QR code. Then it looks at what type of data it is and performs the action that matches.",
          "If it's a URL → your browser opens and loads the website.",
          "If it's contact info → a pop-up appears asking if you want to save the contact to your phone.",
          "If it's WiFi credentials → your phone asks if you want to connect to that network automatically.",
          "If it's a payment link → your payments app opens, pre-filled with the amount and recipient details.",
          "If it's plain text → it simply displays the text on your screen.",
          "The important thing to understand is this: the QR code itself does nothing active. It's passive. It just stores instructions quietly, waiting to be read. Your phone is the one that actually performs the action.",
          "Think of the QR code like a note someone left on your desk. The note doesn't do anything on its own. But when you read it and follow the instructions, things happen.",
        ],
      },

      {
        id: "simple-analogy",
        heading: "Think of It Like This",
        content: [
          "A QR code is like a shortcut button — except instead of being on your keyboard or phone screen, it's printed in the real world.",
          "Imagine you had to type out a 60-character website address every time you wanted to visit a site. That would be annoying and slow. A QR code lets you skip all that. You scan, and you're there.",
          "It's the same reason we use bookmarks in browsers. We don't want to type the same address again and again. A QR code is just a physical version of that same idea — a bookmark that exists in the real world, on paper, on screens, on packaging, and on walls.",
          "Scan → Action happens. That's the whole story.",
        ],
        quote: {
          text: "QR codes don't perform actions. They simply tell your device what action to perform.",
        },
      },

      {
        id: "final-thoughts",
        heading: "Final Thoughts",
        content: [
          "QR codes are not complicated. They're not mysterious. They're not some advanced technology that only engineers understand. They are simply visual containers for digital information — a way to store a link, a message, or data in a shape that any camera can read.",
          "Once you understand that, they stop feeling magical — and start feeling powerful. Because now you realize you can use them for almost anything. Sharing your business contact. Sending someone to your website. Connecting guests to your WiFi. Offering a discount. Collecting feedback. The possibilities are genuinely endless.",
          "And the best part? You can create your own QR code in literally seconds. No technical knowledge required.",
        ],
      },
    ],

    cta: {
      text: "Try creating your own QR code now at qrjunction.in",
      link: process.env.NEXT_PUBLIC_CLIENT_URL || "https://qrjunction.in",
    },
  },
  "how-small-businesses-can-use-qr-codes-to-increase-sales": {
    slug: "how-small-businesses-can-use-qr-codes-to-increase-sales",

    seo: {
      title: "How Small Businesses Can Use QR Codes to Increase Sales in 2025",
      description:
        "Discover powerful ways small businesses can use QR codes to increase sales, get more customers, boost reviews, and improve marketing results.",
      keywords: [
        "QR codes for small business",
        "increase sales with QR code",
        "QR code marketing",
        "QR code for shop",
        "QR code for business growth",
      ],
    },

    author: {
      name: "QR Junction Team",
    },

    publishedAt: "2026-02-15",
    readTime: 7,

    hero: {
      title: "How Small Businesses Can Use QR Codes to Increase Sales",
      subtitle:
        "Simple strategies that turn a small black square into a serious sales machine.",
      image: "/assests/blogs/qr-business-hero.png",
      imageAlt: "Shop owner using QR code for customer payments and marketing",
    },

    sections: [
      {
        id: "intro",
        content: [
          "If you run a small business, you already know one thing — competition is everywhere. The shop next door is offering the same products. The online store is offering lower prices. And somehow, you're expected to stand out.",
          "Big brands have big budgets. They spend lakhs on advertising, hire full marketing teams, and run campaigns across every platform. But you? You need smart strategies — the kind that cost almost nothing but deliver real results.",
          "And guess what? QR codes are one of the cheapest and smartest tools available to any small business owner today. A single printed QR code can replace your brochure, collect customer reviews, grow your social following, drive repeat purchases, and even build your marketing database — all at the same time.",
          "Here are the most effective ways to use QR codes to grow your business and increase sales.",
        ],
      },

      {
        id: "google-reviews",
        heading: "1. Get More Google Reviews Instantly",
        content: [
          "Online reviews are the new word-of-mouth. Before anyone visits your shop, tries your food, or buys your product, they check Google reviews. And businesses with more reviews — especially recent ones — consistently get more customers than those without.",
          "The problem? Most happy customers don't leave reviews simply because they forget to, or because it feels like too much effort to search your business, find the review button, and type something out.",
          "Here's the fix. Place a QR code right at your billing counter, at the exit, on your packaging, or on the receipt — anywhere the customer sees it at the end of a positive experience. The QR code links directly to your Google review page. One scan, and they're already on the review form.",
          "No searching. No navigating. Just scan and done.",
          "The easier you make it, the more reviews you'll collect. And more reviews mean more trust, higher rankings on Google Maps, and more new customers walking through your door.",
        ],
      },

      {
        id: "offer-discounts",
        heading: "2. Share Exclusive Discounts",
        content: [
          "Everyone loves feeling like they got a special deal. It's one of the most powerful motivators in customer behavior.",
          "Print a QR code on your product packaging, inside a carry bag, or on the receipt that unlocks an exclusive discount on the customer's next purchase. When they scan it, they land on a page showing a discount code, a special offer, or a limited-time deal meant just for them.",
          "Customers feel rewarded and appreciated — like they're part of an inner circle. That feeling creates loyalty. And loyalty is what drives repeat purchases, which are far more profitable than constantly chasing new customers.",
          "You can also update the discount offer anytime without reprinting anything — just change what the QR code links to. That flexibility alone makes it far smarter than traditional printed coupons.",
        ],
        image: {
          src: "/assests/blogs/qr-discount-offer.png",
          alt: "Product packaging with QR code for discount offer",
          width: 1200,
          height: 800,
        },
      },

      {
        id: "collect-leads",
        heading: "3. Collect Customer Leads",
        content: [
          "Most small businesses have no way to reach their customers after they leave. Once a customer walks out, the connection is gone. You have no phone number, no email, no way to send them offers or updates.",
          "QR codes can fix that.",
          "Use a QR code that links to a simple, clean form — just a name, phone number, and email. Tell customers they'll receive early access to new products, exclusive discounts, or seasonal offers. Most people are happy to share their details in exchange for genuine value.",
          "Now you have a direct marketing channel. Instead of spending money on ads to reach strangers, you can send WhatsApp messages, SMS, or emails to people who have already bought from you — the people most likely to buy again.",
          "A well-maintained customer list is one of the most valuable assets any small business can build. QR codes make collecting it effortless.",
        ],
      },

      {
        id: "digital-catalog",
        heading: "4. Show Digital Catalog",
        content: [
          "Printed catalogs are expensive. They go out of date quickly. If you add a new product or change a price, you have to reprint the whole thing. And most customers don't even take them home — they leave them on the counter or throw them away.",
          "Instead, share one QR code that links to your full digital catalog.",
          "Customers scan it, browse your entire product range on their phone, see real photos, updated prices, and descriptions — all in one place. They can bookmark it, share it with family members, or revisit it later when they're ready to buy.",
          "You save on printing costs, you can update the catalog anytime without any extra expense, and your customers get a far better browsing experience than flipping through a paper booklet.",
          "For restaurants, this works as a digital menu. For clothing stores, it's a lookbook. For service businesses, it's a service list with pricing. Whatever your business, a digital catalog QR code makes your offerings look more professional and accessible.",
        ],
      },

      {
        id: "increase-social-followers",
        heading: "5. Grow Social Media Followers",
        content: [
          "Every customer who walks into your shop is a potential social media follower. But most of them will never find your Instagram or Facebook page on their own — because they simply don't think to search for it after they leave.",
          "A QR code placed at your counter, on your packaging, or on a table card can change that. Customers scan it, land directly on your Instagram profile or WhatsApp Business chat, and follow or message you in seconds.",
          "Your offline customers become your online audience. That means every time you post a new product, run a sale, or share an update, they see it — and they're already people who like your business and trust you.",
          "That's long-term brand growth without spending a single rupee on advertising.",
        ],
        list: [
          "Instagram profile QR — grow followers who already know and like your business",
          "WhatsApp chat link — let customers message you directly for orders and enquiries",
          "Facebook page link — build a community and share updates easily",
          "YouTube channel QR — share product demos, tutorials, or behind-the-scenes content",
        ],
      },

      {
        id: "final-thoughts",
        heading: "Final Thoughts",
        content: [
          "QR codes are not just payment tools. That's actually the least exciting thing about them for small businesses.",
          "They are marketing shortcuts — tiny printed bridges between your physical space and your digital presence. They connect your customers to your reviews, your discounts, your catalog, your social media, and your database — all without any expensive setup, complicated software, or technical knowledge.",
          "For small businesses, smart shortcuts mean higher sales, stronger relationships, and more loyal customers. And a QR code is one of the smartest shortcuts you have.",
          "Start with just one use case. See the results. Then add more.",
        ],
      },
    ],

    cta: {
      text: "Create a QR code for your business now at qrjunction.in",
      link: process.env.NEXT_PUBLIC_CLIENT_URL || "https://qrjunction.in",
    },
  },
  "are-qr-codes-safe-common-myths-and-real-facts": {
    slug: "are-qr-codes-safe-common-myths-and-real-facts",

    seo: {
      title: "Are QR Codes Safe? Common Myths and Real Facts Explained (2025)",
      description:
        "Are QR codes safe to scan? Learn the real security facts, common myths, and how to safely use QR codes for payments, websites, and business.",
      keywords: [
        "are QR codes safe",
        "QR code security",
        "QR code scam",
        "safe QR scanning",
        "QR code myths",
      ],
    },

    author: {
      name: "QR Junction Team",
    },

    publishedAt: "2026-02-15",
    readTime: 6,

    hero: {
      title: "Are QR Codes Safe? Common Myths & Real Facts",
      subtitle: "Let's separate internet fear from actual facts.",
      image: "/assests/blogs/qr-safety-hero.png",
      imageAlt: "Person scanning QR code safely with smartphone",
    },

    sections: [
      {
        id: "intro",
        content: [
          `You've probably heard someone say: "Don't scan random QR codes. They're dangerous." Maybe a relative forwarded you a WhatsApp message warning about QR code scams. Maybe you saw a news headline and started second-guessing every black-and-white square you come across.`,
          "So are QR codes actually risky?",
          "Or are we just blaming the square for something that has nothing to do with the square itself?",
          "The truth is somewhere in the middle — and understanding it will help you use QR codes confidently without unnecessary fear.",
          "Let's clear this up properly.",
        ],
      },

      {
        id: "myth1",
        heading: "Myth #1: QR Codes Are Viruses",
        content: [
          "False. Completely false.",
          "A QR code is just data. It's the same as a web address written on a piece of paper — except in a format your camera can read.",
          "Scanning a QR code does not install anything on your phone. It cannot access your files, contacts, messages, or camera on its own. It cannot run code. It cannot transmit your personal data by simply being scanned.",
          "The act of scanning a QR code is no more dangerous than reading a sign on the street. The QR code itself is completely passive. It only directs your device somewhere.",
          "Calling QR codes viruses is like calling phone numbers viruses. The number itself isn't dangerous — what matters is who picks up when you call.",
        ],
      },

      {
        id: "real-risk",
        heading: "The Real Risk",
        content: [
          "Now, here's the honest part — there is a real risk. It just isn't the QR code itself.",
          "The risk comes from where the QR code leads. A malicious person can create a QR code that links to a fake website — one designed to look like your bank, a payment app, or a trusted service. If you enter your details on that fake site, your information can be stolen.",
          "This is called phishing. And it's not a QR code problem. Phishing happens through emails, text messages, fake websites, and phone calls too. QR codes are just another delivery method for the same old trick.",
          "Think of it this way: if someone handed you a fake phone number for your bank, and you called it and gave away your PIN, you wouldn't blame the phone. You'd blame the fake number — and the person who gave it to you.",
          "The same logic applies here. The problem isn't the QR code format. It's the destination it points to.",
        ],
        image: {
          src: "/assests/blogs/qr-security-warning.png",
          alt: "Warning illustration showing safe vs unsafe QR code scanning",
          width: 1200,
          height: 800,
        },
      },

      {
        id: "how-to-stay-safe",
        heading: "How to Stay Safe While Scanning QR Codes",
        content: [
          "The good news is that staying safe while using QR codes is genuinely simple. You don't need any special app, any technical knowledge, or any reason to be paranoid. Just a few common-sense habits will protect you almost every time.",
          "Here's how you protect yourself:",
        ],
        list: [
          "Avoid scanning unknown stickers in public places — particularly if a sticker has been placed over an existing QR code, as this is a known tampering method",
          "Check the website URL before entering any personal details — most phones show you the link before opening it. If the URL looks strange or doesn't match the brand, don't proceed",
          "Use trusted QR generators when creating your own QR codes for business — cheap or unknown tools sometimes insert their own redirect links",
          "Never share your OTP, banking PIN, or passwords on any website you reached through a QR code that you weren't expecting",
          "If a QR code at a restaurant or store looks like it has been tampered with — like a sticker placed on top — ask a staff member before scanning",
        ],
      },

      {
        id: "business-safety",
        heading: "Are QR Codes Safe for Businesses?",
        content: [
          "Absolutely yes — when they are generated from a reliable source and used responsibly.",
          "Businesses around the world use QR codes every single day for payments, customer reviews, digital menus, event check-ins, loyalty programs, and marketing campaigns. Hospitals use them for patient records. Banks use them for authentication. Airports use them for boarding passes.",
          "If QR codes were genuinely dangerous, none of this would be possible at scale.",
          "The safety of a QR code in a business context depends entirely on where it was created and where it leads. A QR code generated from a trusted platform, pointing to a verified business website or payment gateway, is as safe as any other digital tool.",
          "Security depends on how responsibly they are used — not on the technology itself.",
        ],
      },

      {
        id: "final-thoughts",
        heading: "Final Thoughts",
        content: [
          "QR codes are tools. Simple, powerful, incredibly useful tools.",
          "Like any tool, they are safe when used correctly — and they can be misused when handled carelessly. A kitchen knife is useful for cooking and dangerous in the wrong hands. The knife isn't the problem. Neither is the QR code.",
          "Blaming QR codes for scams is like blaming roads for traffic accidents. Yes, accidents happen on roads. That doesn't mean we stop using roads — we just drive carefully.",
          "Scan from trusted sources. Check URLs. Don't share sensitive information unless you're certain of where you are. Do that, and QR codes are not just safe — they're one of the most convenient tools in your daily life.",
        ],
      },
    ],

    cta: {
      text: "Generate safe and secure QR codes at qrjunction.in",
      link: process.env.NEXT_PUBLIC_CLIENT_URL || "https://qrjunction.in",
    },
  },

};
