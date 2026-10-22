import type { BlogPost } from "@/data/blogTypes";

export const googleReviewQrBlog: BlogPost = {
  slug: "how-to-create-a-google-review-qr-code",
  seo: {
    title: "How to Create a Google Review QR Code (Direct Link, 2026)",
    description:
      "Get more Google reviews with a QR code that opens the review form, not just Maps. Copy the link, generate a dynamic code, place it on the bill, track which tent works.",
    keywords: [
      "Google review QR code",
      "how to get more Google reviews",
      "QR code for Google reviews",
      "Google review link QR code",
      "increase Google reviews",
      "Google Business Profile QR code",
    ],
    ogImage: "/assests/blogs/google-review-qr-hero.png",
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
    title: "How to Create a Google Review QR Code for Your Business",
    subtitle:
      "Happy customers mean to review you. They do not. A QR on the bill opens the form while they still care.",
    image: "/assests/blogs/google-review-qr-hero.png",
    imageAlt:
      "Google review QR code on a restaurant table card being scanned by a smartphone",
  },
  howTo: {
    name: "How to create a Google review QR code",
    steps: [
      {
        title: "Copy the direct review link",
        text: "From Google Business Profile → Get more reviews, or from Maps → Write a review → copy the URL.",
      },
      {
        title: "Generate a dynamic QR",
        text: "Paste the link in QR Junction. Dynamic so you can track and retarget if Google changes the URL.",
      },
      {
        title: "Mark it as a review code",
        text: "Star icon or “Scan to review on Google” so it is not mistaken for UPI.",
      },
      {
        title: "Place it at the end of a good experience",
        text: "Bill, checkout, takeaway bag — not the front door before they have eaten.",
      },
      {
        title: "Use one code per placement if you want numbers",
        text: "Receipt vs window vs card. Then you know which one to reprint.",
      },
    ],
  },
  relatedSlugs: [
    "how-to-track-qr-code-scans",
    "how-to-create-a-qr-code-menu-for-your-restaurant",
    "how-small-businesses-can-use-qr-codes-to-increase-sales",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "Google reviews are still the cheapest local SEO you can do. The gap is not “people hate us”. The gap is search-your-name-find-the-button. A Google review QR code deletes those steps.",
        "QR Junction also has a [review suite](/dashboard/reviews/new) that can gate low ratings privately and send happy people to Google. This article is the simple version: one link, one square, right place.",
      ],
    },
    {
      id: "get-review-link",
      heading: "Get the direct Google review link",
      content: [
        "Not the Maps pin. The URL that opens Write a review.",
      ],
      list: [
        "Search your business on Google Maps, open it, click Write a review, copy the address bar — or",
        "business.google.com → Get more reviews → copy that link. Cleaner.",
      ],
    },
    {
      id: "create-qr-code",
      heading: "Create the QR code",
      content: [
        "Paste into a URL or review flow. Dynamic. Star in the middle if you want, but keep [logo rules](/blog/how-to-create-a-custom-qr-code-with-logo). SVG for print. Scan until the form actually opens.",
      ],
      image: {
        src: "/assests/blogs/google-review-qr-creation.png",
        alt: "Creating a Google review QR code with a star icon on QR Junction",
        caption: "Paste the direct review link. Make it obvious this is not a payment QR.",
        width: 1200,
        height: 700,
      },
    },
    {
      id: "where-to-place",
      heading: "Where to place it",
      content: ["Catch the good mood."],
      list: [
        "Bill / receipt — usually the winner.",
        "Checkout counter.",
        "Table card — separate from the [menu QR](/blog/how-to-create-a-qr-code-menu-for-your-restaurant).",
        "Back of visiting card, packaging, door on the way out, follow-up email.",
      ],
    },
    {
      id: "what-to-write",
      heading: "What to write next to the QR code",
      content: [
        "Weak: “Leave us a review”. Better: “Had a good visit? Scan for a 30-second Google review — it helps other locals find us.” Time + why. That pair converts.",
      ],
    },
    {
      id: "track-results",
      heading: "Track which placements work",
      content: [
        "Five locations, one static image, zero knowledge. Separate [dynamic codes](/blog/how-to-track-qr-code-scans), same review URL. Retire the dead tent.",
      ],
      image: {
        src: "/assests/blogs/google-review-placement-analytics.png",
        alt: "Analytics comparing Google Review QR code scans from different placements",
        caption: "Separate codes per placement. One image cannot tell you which tent works.",
        width: 1200,
        height: 650,
      },
    },
    {
      id: "final-thoughts",
      heading: "Reviews are not an accident",
      content: [
        "Intention is there. Friction kills it. Put the form one scan away, on the bill, while they still like you.",
      ],
    },
  ],
  faq: [
    {
      q: "How do I get a Google review QR code?",
      a: "Copy the “Get more reviews” link from Google Business Profile, paste it into QR Junction, download SVG or PNG. Prefer a dynamic code.",
    },
    {
      q: "Should the QR go to Maps or the review form?",
      a: "The review form. Maps still makes them hunt for a button.",
    },
    {
      q: "Can I see how many people scanned the review QR?",
      a: "Yes if it is dynamic. Static codes will not tell you. See [QR code tracking](/blog/how-to-track-qr-code-scans).",
    },
    {
      q: "Will this post fake reviews?",
      a: "No. It only shortens the path for real customers. Buying reviews is against Google’s rules and a bad idea.",
    },
    {
      q: "What if someone had a bad experience?",
      a: "A plain review QR still sends them to Google. The [review suite](/dashboard/reviews/new) can collect private feedback below a star threshold instead.",
    },
  ],
  cta: {
    text: "Create your Google review QR code",
    link: "/register",
  },
};
