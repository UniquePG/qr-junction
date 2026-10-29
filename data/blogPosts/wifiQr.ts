import type { BlogPost } from "@/data/blogTypes";

export const wifiQrBlog: BlogPost = {
  slug: "how-to-make-a-wifi-qr-code",
  seo: {
    title: "How to Make a WiFi QR Code (Guests Connect Without Asking)",
    description:
      "Create a WiFi QR code that joins iPhone and Android to your network. SSID, WPA2, hidden networks, cafe placements, and when a static code is enough.",
    keywords: [
      "wifi QR code",
      "how to make a WiFi QR code",
      "share wifi password qr",
      "guest wifi qr code",
      "QR code for WiFi password",
      "connect to WiFi with QR code",
      "WiFi QR code iPhone",
      "WiFi QR code Android",
      "WiFi QR code generator",
    ],
    ogImage: "/assests/blogs/wifi-qr-hero.png",
  },
  author: {
    name: "QR Junction Team",
    bio: "We build QR tools that restaurants actually print and use.",
    avatar: "/NewLogo/logo-192x192.png",
  },
  publishedAt: "2026-10-22",
  updatedAt: "2026-10-29",
  readTime: 9,
  hero: {
    title: "How to Make a WiFi QR Code So Guests Connect Without Asking",
    subtitle:
      "The password is inside the square. Their phone asks “Join Cafe-Guest?” and you stop spelling WPA keys across the counter.",
    image: "/assests/blogs/wifi-qr-hero.png",
    imageAlt:
      "Cafe table tent with a WiFi QR code, smartphone showing a join-network prompt",
  },
  howTo: {
    name: "How to make a WiFi QR code",
    steps: [
      {
        title: "Get the exact SSID and password",
        text: "Copy them from the router or WiFi settings. Capital letters matter.",
      },
      {
        title: "Choose the security type",
        text: "WPA/WPA2 for almost every modern router. Use WEP only on ancient hardware. Open if there is truly no password.",
      },
      {
        title: "Generate the WiFi QR",
        text: "Enter SSID, password, and encryption in a WiFi QR code generator. Mark hidden if the network does not broadcast.",
      },
      {
        title: "Print and place it where people already sit",
        text: "Table tent, reception, guest-room card. 4 cm minimum. Matte, not a glossy sticker under a spotlight.",
      },
      {
        title: "Scan with iPhone and Android before you tape it down",
        text: "Confirm the join prompt appears. If it does not, the SSID is wrong or the security type does not match the router.",
      },
    ],
  },
  relatedSlugs: [
    "how-to-create-a-custom-qr-code-with-logo",
    "how-to-create-a-qr-code-menu-for-your-restaurant",
    "are-qr-codes-safe-common-myths-and-real-facts",
  ],
  sections: [
    {
      id: "intro",
      content: [
        "Every salon, clinic waiting room, and cafe hears the same sentence: “What’s the WiFi?” Then someone shouts a password with three capital letters and a hash, and a guest types it wrong twice. A WiFi QR code ends that conversation. Scan, join, done.",
        "You do not need an app to make one. You do need the real network name, the real password, and a print that cameras can see. Use the [WiFi QR code generator](/wifi-qr-code-generator) if you want that in the browser in under a minute.",
      ],
    },
    {
      id: "share-password",
      heading: "Share a WiFi password with a QR code",
      content: [
        "Share a WiFi password with a QR code by encoding SSID + WPA key in a WIFI: payload — not a webpage that displays the password in 48 pt type. Guests scan, tap Join, and stop asking the counter. The generator for that file is the [WiFi QR code generator](/wifi-qr-code-generator). This page is the how-to: fields, iPhone vs Android, and when a static square is enough.",
      ],
    },
    {
      id: "guest-wifi",
      heading: "Guest WiFi QR code",
      content: [
        "A guest WiFi QR code should encode the visitor SSID, not the office LAN or the owner’s IoT network. Cafes, PGs, clinics, and Airbnbs print a guest WiFi QR so staff stop spelling WPA keys. Client isolation on the router. Rotate that guest password when contractors leave. A static Wi-Fi QR cannot be edited — you reprint the one card.",
      ],
    },
    {
      id: "what-it-stores",
      heading: "What a WiFi QR code stores",
      content: [
        "It is not a link to a website. The pattern holds a small text recipe phones already understand:",
      ],
      code: {
        language: "text",
        code: "WIFI:T:WPA;S:YourNetworkName;P:YourPassword;H:false;;",
      },
    },
    {
      id: "what-it-stores-2",
      content: [
        "T is the security type (WPA, WEP, or nopass). S is the SSID. P is the password. H is whether the network is hidden. After a scan, iOS and Android show a system prompt to join. They do not need WhatsApp, they do not need your website, and they do not need a QR scanner app.",
        "That also means anyone who photographs the printed square has the password. Treat a WiFi QR like a Post-it on the fridge, just tidier.",
      ],
    },
    {
      id: "steps",
      heading: "How to make a WiFi QR code, field by field",
      content: [
        "Open the generator and pick the WiFi tab. Do not paste a URL. URLs open browsers. WiFi codes open the join sheet.",
      ],
      list: [
        "Step 1: Type the SSID exactly — Cafe_Guest is not Cafe-Guest. Check the router sticker or a phone that is already connected.",
        "Step 2: Paste the password — no extra space at the end. If you rotated the key last week, use the new one.",
        "Step 3: Set security to WPA/WPA2 — that covers WPA2 and, on most phones, WPA3 mixed networks. Pick WEP only if the router is from another decade. Pick nopass only for an open network you actually want open.",
        "Step 4: Tick hidden if the SSID does not broadcast — otherwise the phone will look for a name it cannot see.",
        "Step 5: Download PNG for a table tent file you will print today, SVG if a designer is putting it on a menu card — then scan it from the printed size, not only from the laptop screen.",
      ],
      image: {
        src: "/assests/blogs/wifi-qr-fields.png",
        alt: "WiFi QR code generator fields for SSID, password, and WPA security next to a live QR preview",
        caption: "Wrong SSID is the usual reason a WiFi QR “doesn’t work”.",
        width: 1200,
        height: 675,
      },
    },
    {
      id: "iphone-android",
      heading: "iPhone vs Android when you scan",
      content: [
        "iPhone: Camera app, hold still, tap the banner that offers to join the network. Older iOS versions were picky; current ones handle standard WIFI: payloads.",
        "Android: Camera or Google Lens, same banner. Some skins need WiFi scanning enabled in settings. If nothing happens, the payload is wrong or the phone is already on a different network and ignoring the prompt — toggle WiFi off and on and scan again.",
        "A laptop webcam will not join WiFi from a QR. Neither will a desktop. This is a phone feature.",
      ],
      image: {
        src: "/assests/blogs/wifi-qr-scan-connect.png",
        alt: "Guest scanning a cafe WiFi QR code on a table tent to connect without typing the password",
        caption: "The win is the join prompt, not a webpage that displays the password in 48 pt type.",
        width: 1200,
        height: 675,
      },
    },
    {
      id: "static-vs-dynamic",
      heading: "When static is enough, and when it is not",
      content: [
        "Home, a single office guest network, a password you change once a year: static is fine. The password lives in the image. No server. No expiry. That is the honest use of a static WiFi QR code.",
        "A cafe that also wants a “leave your email for the code” gate should use a dynamic WiFi flow. QR Junction can send scans to a small page that shows the network details and, if you want, a lead form. That is a different product from encoding WIFI: in the squares. Use it when the password changes often or you care about [scan counts](/blog/how-to-track-qr-code-scans).",
        "Do not encode a password you would not shout in a queue, then stick the square on a street-facing window. Inside the shop, on the table, is the usual place.",
      ],
    },
    {
      id: "placement",
      heading: "Where a WiFi QR code belongs",
      content: [
        "Put it where people already have their phones out and want the network: tables, the waiting-room side table, the Airbnb nightstand, the reception clip. Write “Scan to join WiFi” so it is not mistaken for a payment code. Mixing UPI and WiFi on one standee is how someone pays the wrong person.",
      ],
      list: [
        "Cafe / restaurant — guest WiFi QR on a table tent, 4 cm+, away from the [menu QR](/blog/how-to-create-a-qr-code-menu-for-your-restaurant) so jobs stay separate.",
        "Salon or clinic — counter and each bay. Repeat guests will still ask once, then never again.",
        "Office visitor network — a guest WiFi QR at reception, not the all-hands Slack. Guest SSID, not the corporate one.",
        "Homestay — card next to the kettle. Static code. Change it when you change the key.",
      ],
    },
    {
      id: "security",
      heading: "Security, without the panic",
      content: [
        "A WiFi QR is as secret as the paper it is printed on. Staff Instagram stories that zoom on the tent leak the key. If that bothers you, use a guest VLAN and rotate the password when someone leaves.",
        "The code cannot “hack the phone.” It offers a network. The guest still taps Join. For the broader scare stories, read [are QR codes safe](/blog/are-qr-codes-safe-common-myths-and-real-facts).",
        "If you add a logo, keep contrast high and error correction on H. Same rules as any [custom QR with a logo](/blog/how-to-create-a-custom-qr-code-with-logo).",
      ],
    },
    {
      id: "final",
      heading: "Spell the SSID once, on paper that scans",
      content: [
        "Copy the name. Copy the password. Generate the WiFi QR code. Print one copy. Join from a phone that is not already on that network. Then print the rest.",
        "You will still get asked “what’s the WiFi?” by people who refuse to look down. Point at the tent. That is progress.",
      ],
    },
  ],
  faq: [
    {
      q: "How do I share a WiFi password with a QR code?",
      a: "Enter SSID, password, and WPA in the [WiFi QR code generator](/wifi-qr-code-generator). Download, scan-test from a phone that is not already on the network, then print. The camera offers Join. No website opens.",
    },
    {
      q: "What is a guest WiFi QR code?",
      a: "A guest WiFi QR encodes the visitor network, not staff Wi-Fi. Print it on a tent or nightstand. Use client isolation. Reprint if you rotate the password — a static Wi-Fi payload cannot be edited.",
    },
    {
      q: "Does a WiFi QR code work on iPhone?",
      a: "Yes. Open Camera, point at the code, tap the join banner. You do not need the WhatsApp QR scanner or a third-party app.",
    },
    {
      q: "Will it work if my network is hidden?",
      a: "Yes if you mark the network as hidden when you generate the code. If you leave that off, the phone looks for a broadcast SSID it will never see.",
    },
    {
      q: "Should I choose WPA2 or WPA3?",
      a: "Most generators label it WPA/WPA2, which is correct for typical routers. WPA3-only networks can be fussy on older phones. If scans fail, confirm the router’s actual mode.",
    },
    {
      q: "Can I change the WiFi password without reprinting?",
      a: "Not with a static WiFi QR — the password is inside the image. Reprint, or use a dynamic page that shows the current details. Static is still the right default for a stable guest network.",
    },
    {
      q: "Is it safe to print a WiFi QR in a cafe?",
      a: "It is as safe as writing the password on a chalkboard, which cafes already do. Use a guest network. Do not publish the office LAN.",
    },
    {
      q: "Why does the code scan but the phone will not join?",
      a: "SSID mismatch, extra space in the password, wrong security type, or the phone is ignoring the prompt because it is already connected elsewhere. Recopy the values from a device that is online.",
    },
  ],
  cta: {
    text: "Make a WiFi QR code",
    link: "/wifi-qr-code-generator",
  },
};
