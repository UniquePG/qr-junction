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
              [
                "Static QR Code",
                "Content cannot be changed after creation",
              ],
              [
                "Dynamic QR Code",
                "Content can be updated anytime",
              ],
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
        link: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://qrjunction.in',
      },
    },
  };
  