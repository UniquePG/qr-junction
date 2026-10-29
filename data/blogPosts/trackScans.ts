import type { BlogPost } from "@/data/blogTypes";

export const trackScansBlog: BlogPost = {
  slug: "how-to-track-qr-code-scans",
  seo: {
    title: "QR Code Scan Tracking: How to Track QR Code Scans (Analytics Dashboard)",
    description:
      "QR code scan tracking: how to track QR code scans, what a QR code analytics dashboard actually logs, when you can track QR code scans free, and how to print a trackable QR code.",
    keywords: [
      "qr code scan tracking",
      "track QR code scans",
      "track qr code scans free",
      "qr code analytics dashboard",
      "trackable qr code print",
      "qr code tracking",
      "qr code analytics",
      "QR code UTM",
      "can QR codes be tracked",
      "dynamic QR code tracking",
      "unique vs total QR scans",
    ],
    ogImage: "/assests/blogs/qr-tracking-hero.png",
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
    title: "QR Code Scan Tracking: How to Track QR Code Scans (And Stop Guessing Which Poster Worked)",
    subtitle:
      "If the code encodes the website itself, Google Analytics will call every scan Direct. Tracking only exists when the square hits a short link you control first.",
    image: "/assests/blogs/qr-tracking-hero.png",
    imageAlt:
      "QR code analytics dashboard showing scan tracking, locations, and device breakdown",
  },
  howTo: {
    name: "How to track QR code scans",
    steps: [
      {
        title: "Use a dynamic QR code, not a static one",
        text: "The printed pattern must open a short redirect URL you own, not the final website baked into the image.",
      },
      {
        title: "Create one code per placement",
        text: "Window, flyer, packaging, and table each get their own short code pointing at the same destination.",
      },
      {
        title: "Add UTM parameters",
        text: "Set utm_source, utm_medium, and utm_campaign so scans also show up correctly in GA4 instead of Unassigned.",
      },
      {
        title: "Read scans vs unique scans",
        text: "Total scans count every hit. Unique scans count new visitor cookies. Staff testing will inflate both if you do not account for it.",
      },
      {
        title: "Watch the dashboard after the first week",
        text: "Kill the placements that never scan. Reprint the ones that do.",
      },
    ],
  },
  relatedSlugs: [
    "what-is-an-editable-qr-code",
    "static-vs-dynamic-qr-codes-which-one-do-you-actually-need",
    "bitly-vs-qr-tiger",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "A salon in Andheri ran three posters for the same offer: one in the lift, one on the glass door, one inside a Diwali flyer. At the month-end meeting someone asked which poster worked. Nobody knew. The QR on all three was the same static image from a free generator. GA4 showed a bump in Direct. That was the entire report.",
        "QR code tracking is not a mystery feature. It is a redirect with a log. The phone hits your short link, you record device, city, time, and a visitor cookie, then you send the person to the real page. If you skip the short link, there is nothing to count except whatever the destination site happens to see — usually “Direct / none”.",
        "This is how to track QR code scans without lying to yourself about the numbers.",
      ],
    },
    {
      id: "scan-tracking",
      heading: "QR code scan tracking",
      content: [
        "QR code scan tracking only exists when the square hits a short link you control first. The phone opens qrjunction.in/q/…, we log the hit, then we send the person to the real page. If the PNG encodes the website itself, there is no scan tracking — only whatever the destination site files as Direct.",
      ],
    },
    {
      id: "track-free",
      heading: "Track QR code scans free",
      content: [
        "Track QR code scans free only if the code is dynamic and the free tier includes analytics. A no-account static PNG from any generator — including ours — leaves no log. That is not a missing button. Static files have nowhere to write. Sign in, create a dynamic QR, then the dashboard starts counting. “Free tracking on a downloaded JPEG” is a pitch, not a product.",
      ],
    },
    {
      id: "can-they-be-tracked",
      heading: "Can QR codes be tracked?",
      content: [
        "Static codes cannot, not in any useful way. The destination is painted into the squares. Your server never sees the scan. The restaurant website might see a visit. It will not know it came from the window versus the visiting card.",
        "Dynamic codes can. The square stores something like qrjunction.in/q/ab12cd. That request is yours. You can attach [UTMs](/blog/static-vs-dynamic-qr-codes-which-one-do-you-actually-need), change the destination later, and keep a history of scans.",
        "People mix this up with “the QR code spies on the phone.” It does not. Tracking is the same idea as a branded short link on a billboard. You see that the link was opened. You do not get the person’s name unless they fill a form afterwards.",
      ],
    },
    {
      id: "what-gets-logged",
      heading: "QR code analytics dashboard",
      content: [
        "A QR code analytics dashboard is the log of that short link. On QR Junction a scan stores: time, a visitor id in a cookie, device type, browser, OS, approximate city from IP, and UTM fields. Unique scans increment when we have not seen that cookie before. Total scans increment every time.",
      ],
      table: {
        headers: ["Metric", "What it means", "What it does not mean"],
        rows: [
          ["Total scans", "How many times the short link was opened", "Not orders, not footfall, not “people”"],
          ["Unique scans", "New visitor cookies", "Not a legal identity; same person on two phones counts twice"],
          ["Device / OS", "Mobile vs desktop mix", "Not which staff member tested the code"],
          ["City / map", "Where the IP looked like it was", "Not a street address"],
          ["Conversions / leads", "Form submits or clicks you wired", "Not automatic just because someone scanned"],
        ],
      },
      image: {
        src: "/assests/blogs/qr-tracking-dashboard.png",
        alt: "QR code tracking dashboard with scan trends, heatmap, and device analytics",
        caption: "Scans are visits to the short link. Pair them with your till if you want sales.",
        width: 1200,
        height: 675,
      },
    },
    {
      id: "ga4-direct",
      heading: "Why static QR codes show up as Direct in GA4",
      content: [
        "A camera opening a bare URL looks like someone typed it. No referrer. No campaign. GA4 files it under Direct. If you did add UTMs but used a medium GA4 does not recognise, you get Unassigned, which is worse because you did the work and still lost the channel.",
        "Print and packaging have no built-in GA4 channel. You have to invent one and stick to it. We default to utm_source=qr_junction, utm_medium=qr_scan, and utm_campaign as the QR name. Keep the casing identical. Email and email are two campaigns.",
        "QR Junction can stamp those parameters on the way out. You can still add extra query params on the destination if your ads team has a house style. Just do not generate four static images with four UTM strings and then change the landing page — you will reprint.",
      ],
    },
    {
      id: "one-per-placement",
      heading: "Trackable QR code print",
      content: [
        "A trackable QR code print is one dynamic square per physical object: window, flyer, packaging, visiting card. Same offer page. Separate short links. That is the only tactic that makes QR code tracking worth doing.",
        "After two weeks you will usually find one placement is theatre. The flyer nobody took home will sit at zero. The billing counter will carry the campaign. That is the report the Andheri salon did not have.",
      ],
      image: {
        src: "/assests/blogs/qr-tracking-utm-placements.png",
        alt: "Four QR code placements — window, flyer, packaging, visiting card — with separate scan tracking",
        caption: "If every placement shares one image, you are back to guessing.",
        width: 1200,
        height: 675,
      },
    },
    {
      id: "unique-vs-total",
      heading: "Unique vs total scans",
      content: [
        "Total scans go up when the same guest scans twice, when a waiter tests the tent, when you open the short link on your laptop. Unique scans try to count new cookies. Ours last a year. Clear cookies, new phone, or in-app browsers and you get another unique.",
        "Do not present unique scans as “customers.” Present them as “distinct devices we have seen.” If a restaurant wants per-table honesty, give each table its own code. That is how the [QR code menu](/blog/how-to-create-a-qr-code-menu-for-your-restaurant) setup avoids lumping the whole floor into one number.",
      ],
    },
    {
      id: "conversions",
      heading: "Scans are not conversions",
      content: [
        "A scan means the short link loaded. A conversion is a later event you choose: WiFi lead form, landing-page email, a button click. If you never fire those events, your conversion rate is a decoration.",
        "We log form submits and some clicks when you use hosted pages. Purchases, bookings, and call clicks only appear if you actually send them. Do not copy a dashboard screenshot into a pitch deck and call it revenue.",
      ],
    },
    {
      id: "privacy",
      heading: "What you should tell people, briefly",
      content: [
        "You are not reading their photos. You are logging that a public link was opened, with coarse location from IP. If you collect a name on a form, that is a lead, and you treat it like any other form on a website.",
        "Do not put tracking codes on things that should stay private — a personal WiFi password at home does not need analytics. A festival banner does.",
      ],
    },
    {
      id: "setup",
      heading: "A tracking setup that takes one afternoon",
      content: [
        "Register, create a dynamic QR for the campaign, fill UTM source/medium/campaign, duplicate the QR for each physical placement, download SVGs, print a test, scan from the real distance, then replace the old static squares.",
        "If you already printed static codes, you cannot bolt analytics onto them. Generate new dynamic ones and swap the stickers. Painful once. Then you stop guessing.",
      ],
      list: [
        "Name codes after the object, not the offer — “Mall-window-B2” beats “SummerSale”.",
        "Keep destinations identical so you are comparing placement, not two different pages.",
        "Look at the first seven days before you reprint 500 flyers.",
        "Staff test scans: do them from one known phone and ignore that spike, or use a paused code for internal tests.",
      ],
    },
    {
      id: "final",
      heading: "If you cannot see the scan, the print is a hunch",
      content: [
        "QR code analytics will not tell you if the chai was good. They will tell you the poster near the lift was a waste of vinyl. That is usually enough to change what you print next month.",
        "Start with dynamic codes. Split placements. Read unique versus total without pretending they are people. Then decide what to reprint.",
      ],
    },
  ],
  faq: [
    {
      q: "Can I track QR code scans free?",
      a: "Only on a dynamic code whose plan includes analytics. Static PNGs from no-account tools leave no log. QR Junction static downloads are free and untracked. Dashboard tracking needs an account. Details: [create a dynamic QR](/register).",
    },
    {
      q: "What is a QR code analytics dashboard?",
      a: "A QR code analytics dashboard is the log of the short link: time, unique vs total scans, device, approximate city, UTMs. It is not orders or footfall unless you wire those events.",
    },
    {
      q: "What is a trackable QR code print?",
      a: "Print a different dynamic QR for each placement. One shared image cannot tell you which poster worked. Same destination, separate codes.",
    },
    {
      q: "Can QR codes be tracked?",
      a: "Dynamic ones can, because they open a short link you control. Static ones encode the final URL and leave no scan log. Details are in our [static vs dynamic guide](/blog/static-vs-dynamic-qr-codes-which-one-do-you-actually-need).",
    },
    {
      q: "What is the difference between unique scans and total scans?",
      a: "Total counts every open of the short link. Unique counts new visitor cookies. The same person scanning twice is two totals and usually one unique, unless they switched phones or cleared cookies.",
    },
    {
      q: "Will QR code tracking show up in Google Analytics?",
      a: "Yes if the destination URL carries UTMs that GA4 understands. Without UTMs, scans often land in Direct. Use a consistent utm_medium such as qr_scan.",
    },
    {
      q: "Does tracking QR codes identify the person who scanned?",
      a: "No. You get a cookie id, device, and approximate city. A name only appears if they submit a form after the scan.",
    },
    {
      q: "How do I track which poster or table performed better?",
      a: "Print a different dynamic QR for each placement, all pointing at the same page. Compare scan counts per code. One shared image cannot answer that.",
    },
    {
      q: "Do I need a paid tool to track QR code scans?",
      a: "You need a platform that owns the redirect. A PNG from a no-account generator will not grow a dashboard later. [Create a dynamic QR](/register) if you plan to measure anything.",
    },
  ],
  cta: {
    text: "Create a dynamic QR and watch the scans",
    link: "/register",
  },
};
