export const HOME_TITLE = 'Free QR Code Generator | Custom QR Codes - QR Junction';

export const HOME_DESCRIPTION =
  'QR Junction is a free QR code generator for websites, Wi-Fi, vCards, WhatsApp, PDFs, and restaurant menus. Create a custom QR in your browser, scan-test it, and download PNG or SVG. No signup required.';

export const HOME_HOW_TO = [
  {
    title: 'Pick what the scan should do',
    text: 'Choose a website URL, Wi-Fi network, contact card, WhatsApp chat, PDF, menu, or Google review. One job per code works better than stuffing everything into one square.',
  },
  {
    title: 'Enter the live destination',
    text: 'Paste an https link, SSID and password, phone number with country code, or your Google review URL. Test that destination on your own phone first.',
  },
  {
    title: 'Style it for print, then scan-test',
    text: 'Keep dark dots on a light background. Add a logo only if the code still scans. Open the camera on an iPhone and an Android before you send a file to print.',
  },
  {
    title: 'Download PNG or SVG',
    text: 'PNG is fine for WhatsApp and Instagram. SVG is the file you send a printer for visiting cards, table tents, and boards so the pattern does not blur.',
  },
];

export const HOME_FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I create a QR code for free?',
    a: 'Open QR Junction, pick a type (URL, Wi-Fi, vCard, WhatsApp, and others), fill the field, customise colours if you want, and download PNG or SVG. You do not need an account for a static code. Always scan it with your phone camera before you print.',
  },
  {
    q: 'What is a QR code?',
    a: 'A QR code is a two-dimensional barcode (ISO/IEC 18004) that a phone camera can read. It can store a website, Wi-Fi login, contact file, or short text. After you scan it, iPhone and Android show a banner so you can open the link, join the network, or save the contact.',
  },
  {
    q: 'Do free QR codes expire?',
    a: 'A static QR code from this generator does not expire. The pattern is the data. If you encoded a website that you later delete, the code still scans and then hits a dead page. Dynamic codes in the dashboard stay editable until you change or remove them.',
  },
  {
    q: 'Can I make a QR code for Wi-Fi?',
    a: 'Yes. Use the Wi-Fi generator, enter the network name (SSID), password, and WPA/WPA2 in most homes and cafes. iPhone and Android cameras offer Join. Put the code on a table tent instead of writing the password on a board.',
  },
  {
    q: 'How do I scan a QR code on iPhone or Android?',
    a: 'Open the built-in Camera app, point it at the code, and tap the banner. You do not need a third-party scanner on current iOS or Android. For Wi-Fi codes, the phone asks you to join the network rather than opening a website.',
  },
  {
    q: 'What size should I print a QR code?',
    a: 'Keep at least 2 cm on a visiting card, 3–5 cm on a flyer or table tent, and larger on a shop board (about 1 cm of code width per 10 cm of scan distance). Leave a white quiet zone around the pattern. Matte stock scans better than glossy laminate.',
  },
  {
    q: 'What is the difference between a static and a dynamic QR code?',
    a: 'Static codes bake the URL or Wi-Fi payload into the image. They work without our servers. Dynamic codes point at a short link you can retarget and measure. Use static for a stable page; use dynamic if the offer, menu, or number will change after print.',
  },
  {
    q: 'Can I put a logo in the QR code?',
    a: 'Yes, in the advanced generator. Raise error correction so cameras can still read the covered modules. Do not invert colours or drop a dark code on a photo. If a mid-range Android fails the scan, remove the logo or print the code larger.',
  },
  {
    q: 'Is QR Junction free? Do I need to register?',
    a: 'Generating and downloading a static QR is free and does not require a login. Create an account if you want scan analytics, editable destinations, restaurant menus, or review flows. We do not put a watermark on the static download.',
  },
  {
    q: 'Which QR code should a restaurant or shop use?',
    a: 'Menus: a menu QR or a PDF QR if the card rarely changes. Reviews: a Google Review QR at the counter after payment. Guest internet: a Wi-Fi QR on the table. Orders on chat: a WhatsApp QR with a pre-filled message. Do not print one mystery square for all four jobs.',
  },
];
