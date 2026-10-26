import {
  Link as LinkIcon,
  Contact as ContactIcon,
  FileText,
  Image as ImageLucide,
  Video,
  Wifi,
  Smartphone,
  Star,
} from 'lucide-react';
import type { QRLandingContent } from './types';

export const FREE_GENERATOR_PAGES: Record<string, QRLandingContent> = {
  url: {
    type: 'url',
    tabType: 'url',
    displayName: 'URL / Website',
    title: 'Free URL QR Code Generator | Create a QR Code for Any Website Link',
    description:
      'Create a free URL QR code for a website, landing page, Google Form, payment link, or store. Paste any https link, customise the design, and download a print-ready PNG or SVG. No signup needed.',
    heroHeading: 'Free URL QR Code Generator for Websites and Links',
    heroSubheading:
      'Paste a website URL, Google Form, payment page, or campaign link. Generate a scannable website QR code in seconds, then print it on flyers, packaging, posters, and visiting cards.',
    fact:
      'People almost never type a long web address from a poster. A website QR code turns a printed URL into a two-second camera tap, which is why marketers still use “QR code for website” as one of the highest-volume searches for this tool.',
    icon: LinkIcon,
    keywords: [
      'url qr code generator',
      'qr code for website',
      'create qr code for link',
      'free qr code generator',
      'website qr code',
      'qr code from url',
      'dynamic qr code for url',
    ],
    article: [
      {
        heading: 'What a URL QR code actually encodes',
        paragraphs: [
          'A URL QR code is the simplest and most searched type of QR: it stores a web address inside the black-and-white pattern. When someone opens their phone camera and points it at the code, iOS and Android read that address and offer to open it. There is no special app, no extra login, and no typing.',
          'That is why “QR code for website”, “QR code generator for URL”, and “create QR code for link” dominate Google. Flyers, hoardings, product boxes, restaurant posters, visiting cards, and WhatsApp status images all need a reliable way to send a person from paper (or a screen) to a specific page.',
          'The destination can be almost anything on the open web: your homepage, a product page, a Google Form, a Razorpay or UPI payment page, a YouTube video, a Google Maps pin, a PDF in Drive, or a campaign landing page with UTM tags. The QR does not care what sits at the other end. It only cares that the link is valid, preferably https, and reachable on a phone.',
        ],
      },
      {
        heading: 'How to create a QR code for a website that actually gets scanned',
        paragraphs: [
          'Start with the final page you want people to land on, not a vague homepage. If the flyer is about a Diwali offer, the QR should open the offer page. If the visiting card is for a consultant, open the booking form or portfolio. Every extra tap after the scan costs you people.',
          'Paste the full address, including https://. Bare domains sometimes work, but cameras and older Android versions are more reliable with a complete URL. Then generate the code, scan it from your own phone before you print, and download PNG for digital use or SVG if a printer will enlarge it on a banner.',
          'Add a short line of text next to the code. “Scan to visit our website” is weak. “Scan to book a table”, “Scan to pay”, or “Scan for the full price list” tells the person why they should bother. A QR without a reason is decoration.',
        ],
      },
      {
        heading: 'Static website QR vs a link you can change later',
        paragraphs: [
          'A static URL QR code burns the exact address into the pattern. If you print 5,000 flyers to example.com/offer and later delete that page, those flyers are dead. Static codes never expire, need no account, and work even if our website is down, because the phone opens the destination directly.',
          'If you expect the destination to change — seasonal offers, event dates, a site that will move to a new domain — generate a dynamic QR from the dashboard instead. The printed pattern stays the same; you swap the landing URL later. For a one-off poster with a stable page, static is enough and usually what people mean when they search “free QR code generator”.',
        ],
      },
      {
        heading: 'UTM tags, short links, and what not to put in a website QR',
        paragraphs: [
          'If you care about campaign tracking in Google Analytics, add UTM parameters before you generate: utm_source=poster, utm_medium=qr, utm_campaign=diwali. The QR still opens the same page; your analytics will show that the visit came from print.',
          'Short links (bit.ly and similar) work, but they add a redirect hop and look untrustworthy on some phones. Prefer your own domain. Never encode a link that requires a desktop-only login, a huge unoptimised homepage, or a file that is not publicly shared. Test on both an iPhone and an Android before a print run.',
        ],
      },
    ],
    useCases: [
      {
        title: 'Flyers, posters, and hoardings',
        desc: 'Print a website QR on local ads so people can open the offer page, Google Form, or booking link without typing a long address from a two-wheeler.',
      },
      {
        title: 'Product packaging and inserts',
        desc: 'Link a box or thank-you card to a how-to page, warranty form, or reorder store. This is the most common industrial use of a URL QR code.',
      },
      {
        title: 'Visiting cards and email signatures',
        desc: 'Put a small website QR beside your name so a new contact opens your site or Calendly instead of googling a misspelled brand name.',
      },
      {
        title: 'Payments, forms, and campaigns',
        desc: 'Encode a Razorpay link, Google Form, or UTM-tagged landing page. One scan, one conversion, no typed URL.',
      },
    ],
    benefits: [
      {
        title: 'Works in every native camera',
        desc: 'iPhone and Android read URL QR codes without a third-party scanner. That is the whole point of a website QR.',
      },
      {
        title: 'Any https destination',
        desc: 'Homepage, checkout, Maps pin, Drive file, YouTube, or a form. If a browser can open it, a URL QR can encode it.',
      },
      {
        title: 'Print-ready files',
        desc: 'Download PNG for WhatsApp and Instagram, SVG for banners so the code does not blur when a printer scales it up.',
      },
      {
        title: 'Free, no watermark',
        desc: 'Create a QR code from a URL here without an account. Customise colours and a logo, then scan-test before you print.',
      },
    ],
    mistakes: [
      {
        title: 'Encoding http or a broken page',
        desc: 'Phones warn on insecure http, and a 404 after a scan trains people to ignore your next poster. Always use a live https URL.',
      },
      {
        title: 'Printing too small',
        desc: 'On a visiting card stay at or above 2 cm. On a flyer, 3–4 cm. On a shop board, use the 10:1 rule: 1 cm of code width per 10 cm of scan distance.',
      },
      {
        title: 'No quiet zone or low contrast',
        desc: 'Leave a blank margin around the pattern. Dark dots on a light background scan; yellow on white or white on a photo does not.',
      },
      {
        title: 'Sending people to a desktop-only site',
        desc: 'Almost every scan is from a phone. If your page is not readable on a 6-inch screen, the QR did its job and your website failed.',
      },
    ],
    howToTitle: 'How to create a QR code from a URL',
    howToSteps: [
      { title: 'Copy the live page address', desc: 'Open the destination on your phone, copy the full https link, and confirm the page loads without login walls.' },
      { title: 'Paste it in the generator above', desc: 'Drop the URL into the Website field. Keep UTM tags if you need campaign tracking.' },
      { title: 'Style it for print', desc: 'Match brand colours, add a logo only if you raise error correction, and keep a light background.' },
      { title: 'Scan from a real phone', desc: 'Use the camera on iOS and Android. If the preview bubble shows the right link, you are safe to download.' },
      { title: 'Download PNG or SVG', desc: 'PNG for social and WhatsApp. SVG for flex boards, visiting cards, and any large print.' },
    ],
    comparison: {
      title: 'Typing a URL vs a website QR code',
      theirProduct: 'Printed web address',
      ourProduct: 'URL QR on QR Junction',
      points: [
        { feature: 'Effort', them: 'Type 20–60 characters on a phone', us: 'Open camera, tap the banner' },
        { feature: 'Typos', them: 'Common, especially on long links', us: 'The encoded URL cannot be misspelled' },
        { feature: 'Tracking', them: 'You cannot tell who came from print', us: 'Add UTM tags or use a dynamic QR' },
        { feature: 'Design', them: 'A raw link looks cheap on a poster', us: 'Branded code with a short call to action' },
      ],
    },
    printGuide: {
      title: 'Print sizes for a URL QR code',
      description:
        'A website QR that looks sharp on your laptop can still fail on cheap offset print. Size and contrast matter more than decoration.',
      tips: [
        { title: 'Visiting card', desc: 'Minimum 2 × 2 cm with a white quiet zone. Do not crop the corners.' },
        { title: 'A5 flyer or table tent', desc: '3–5 cm. Place it where a hand can hold the phone 20–40 cm away.' },
        { title: 'Shop vinyl / hoarding', desc: 'Width should be about one-tenth of the farthest scan distance. SVG only.' },
        { title: 'Contrast', desc: 'Near-black modules on white or cream. Avoid photos, busy patterns, and inverted colours.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan to open the offer', desc: 'Use on festival flyers so the QR is tied to a reason, not just “visit website”.' },
      { title: 'Scan to book / pay / register', desc: 'Action words convert better than a naked URL on a poster.' },
      { title: 'Scan for the full catalogue', desc: 'Useful on packaging when the box cannot hold every SKU.' },
    ],
    faq: [
      { q: 'How do I create a QR code for a website for free?', a: 'Paste the full https URL into the generator on this page, customise the design if you want, scan-test it, and download PNG or SVG. You do not need an account for a static website QR.' },
      { q: 'Does a URL QR code expire?', a: 'A static URL QR never expires. It will keep opening the same address for as long as that page exists. If you delete the website, the code still scans — it just lands on an error page.' },
      { q: 'Can I change the link after printing?', a: 'Not with a static code. The URL is baked into the pattern. Create a dynamic QR from the dashboard if you need to swap destinations later without reprinting.' },
      { q: 'Should I use a short link inside the QR?', a: 'You can, but a shortener adds a redirect and sometimes a warning page. A clean https link on your own domain scans faster and looks safer.' },
      { q: 'Will this work on iPhone and Android?', a: 'Yes. Built-in cameras on current iOS and Android read URL QR codes. The person does not install a scanner app.' },
      { q: 'Can I put UTM parameters in the QR?', a: 'Yes. Generate the code from the full campaign URL. Analytics will attribute those sessions to the printed piece.' },
      { q: 'What file should I send to a printer?', a: 'SVG for anything larger than a visiting card. PNG at a high size for WhatsApp, Instagram, and small digital use.' },
      { q: 'Is this the same as a Google search for “QR code generator”?', a: 'Most of those searches are people wanting a URL QR for a website. This page is that tool, locked to website links so the instructions stay specific.' },
    ],
    internalLinks: [
      { anchor: 'Wi-Fi QR code', path: '/wifi-qr-code-generator' },
      { anchor: 'PDF QR code', path: '/pdf-qr-code-generator' },
      { anchor: 'Video QR code', path: '/video-qr-code-generator' },
      { anchor: 'vCard / business card QR', path: '/vcard-qr-code-generator' },
    ],
  },

  vcard: {
    type: 'vcard',
    tabType: 'contact',
    displayName: 'vCard / Business Card',
    title: 'Free vCard QR Code Generator | Digital Business Card QR for Contacts',
    description:
      'Generate a free vCard QR code for a visiting card. One scan saves your name, phone, email, company, and website to iPhone or Android contacts. No app, no typing, no lost paper cards.',
    heroHeading: 'vCard QR Code Generator for Digital Business Cards',
    heroSubheading:
      'Put a contact QR on your visiting card, badge, or email signature. When someone scans it, their phone offers to save you as a contact — name, number, email, address, and site in one tap.',
    fact:
      'Most paper visiting cards are lost or never typed in. A vCard QR (also searched as “QR code for business card” and “digital visiting card QR”) is how salespeople, brokers, and clinic staff actually end up in someone’s phonebook.',
    icon: ContactIcon,
    keywords: [
      'vcard qr code generator',
      'qr code for business card',
      'digital visiting card qr',
      'contact qr code',
      'qr code save contact',
      'mecard vs vcard',
    ],
    article: [
      {
        heading: 'What a vCard QR code puts on someone’s phone',
        paragraphs: [
          'A vCard QR does not open a website. It carries a small contact file (vCard 3.0) inside the pattern: full name, mobile, email, organisation, job title, street address, and website. When the camera reads it, iPhone and Android show “Add to Contacts”. One confirm, and you are in their phonebook even if they never open WhatsApp or LinkedIn.',
          'That is different from a URL QR on a visiting card (which only opens a site) and different from a WhatsApp QR (which only starts a chat). Use a vCard when the job is “save my details”, not “visit my page”.',
        ],
      },
      {
        heading: 'How to make a QR code for a visiting card that both iPhone and Android save',
        paragraphs: [
          'Fill name, mobile with country code (+91…), email, and company. Empty fields are fine; do not invent a fax number to look complete. Keep the payload short. A vCard with a novel-length note and five extra phones becomes a dense, hard-to-scan square on a 9 × 5 cm card.',
          'Generate, then test on both an iPhone and a mid-range Android. iOS is picky about formatting; Android usually opens a preview card. If the name order looks wrong (family name first), edit the name field to the order you want displayed, not the order on your passport.',
          'Print at least 2 × 2 cm on the card, with a white border. Put “Scan to save contact” under it so people do not assume it is a website.',
        ],
      },
      {
        heading: 'vCard QR vs NFC digital cards vs just printing your number',
        paragraphs: [
          'NFC tap cards are neat until the other person has a case that blocks NFC or an older phone. A vCard QR works with the camera they already use. Printing only a phone number still asks them to type, and they often will not.',
          'You can combine: vCard QR on the front of the card, LinkedIn or website QR on the back if you truly need both. Two codes on the front confuse people. One job per side.',
        ],
      },
      {
        heading: 'Why you should not stuff a photo into a static vCard',
        paragraphs: [
          'Photos explode the number of bytes in the QR. The pattern turns into a grey mush that cheap cameras fail to read. If you need a face, logo, and portfolio, use a landing-page QR or a URL to your site, not a static vCard. The contact QR should stay lean so it survives offset printing on cheap card stock.',
        ],
      },
    ],
    useCases: [
      { title: 'Printed visiting cards', desc: 'Replace “type this 10-digit number” with a scan-to-save block on every card you hand out at a trade show.' },
      { title: 'Conference badges', desc: 'Attendees scan your badge between sessions instead of photographing the card and never saving it.' },
      { title: 'Real estate and clinic counters', desc: 'Brochures and appointment slips with a vCard QR mean the next follow-up is already in their contacts.' },
      { title: 'Email signatures and invoices', desc: 'A small contact QR on a PDF invoice helps accounts teams save the billing contact without a retype.' },
    ],
    benefits: [
      { title: 'Saves the whole card, not one field', desc: 'Name, phone, email, company, address, and website land together. No half-saved contacts.' },
      { title: 'Works offline', desc: 'The data sits in the pattern. Basements, factory floors, and exhibition halls with dead Wi-Fi still save the contact.' },
      { title: 'iPhone and Android native', desc: 'No third-party “business card app” required. The stock camera is enough.' },
      { title: 'Fewer typing errors', desc: 'International numbers and long corporate emails survive the handoff intact.' },
    ],
    mistakes: [
      { title: 'Missing country code', desc: 'Save +91 98xxxxxxx, not a local 10-digit string, or overseas scanners cannot call you.' },
      { title: 'Too much data', desc: 'A dense QR on a tiny card will not scan. Keep fields tight; link a website for the rest.' },
      { title: 'Using a URL QR by mistake', desc: 'A website QR does not create a contact. Use this vCard generator when the goal is “save me”.' },
      { title: 'Printing under 2 cm', desc: 'Corners get clipped in cutting. Stay above 2 cm and leave a quiet zone.' },
    ],
    howToTitle: 'How to generate a vCard QR for a business card',
    howToSteps: [
      { title: 'Enter the contact fields', desc: 'Name, mobile with country code, email, company, and website are enough for most cards.' },
      { title: 'Skip the extras you will never use', desc: 'Empty is better than a noisy QR. Add address only if people need to navigate to you.' },
      { title: 'Customise colours carefully', desc: 'Dark code, light background. A logo is optional; raise error correction if you add one.' },
      { title: 'Scan on iPhone and Android', desc: 'Confirm “Add to Contacts” shows the right name and number before you send the file to print.' },
      { title: 'Place it on the card layout', desc: '2 cm minimum, white margin, one short line of text: Scan to save contact.' },
    ],
    comparison: {
      title: 'Paper-only card vs vCard QR',
      theirProduct: 'Number printed in text',
      ourProduct: 'vCard QR on QR Junction',
      points: [
        { feature: 'Saving the contact', them: 'Manual typing, often skipped', us: 'One scan, Add to Contacts' },
        { feature: 'Data included', them: 'Usually just a number', us: 'Name, phone, email, company, site' },
        { feature: 'Offline', them: 'Yes, but unused', us: 'Yes, and actually used' },
        { feature: 'Mistakes', them: 'Wrong digit, lost card', us: 'The payload cannot be mistyped' },
      ],
    },
    printGuide: {
      title: 'Putting a vCard QR on a visiting card',
      description: 'Indian standard cards are tight on space. The code has to earn its millimetres.',
      tips: [
        { title: 'Size', desc: '2–2.5 cm square. If your card is crowded, drop a secondary icon, not the quiet zone.' },
        { title: 'Placement', desc: 'Back-right or front-bottom. Keep it away from foil stamping and heavy texture.' },
        { title: 'Stock', desc: 'Matte or soft-touch scans better than high-gloss laminate that reflects ceiling lights.' },
        { title: 'Label', desc: 'Always write Scan to save contact. A naked QR on a card is ambiguous.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan to save my contact', desc: 'The only line you need on a visiting card.' },
      { title: 'Scan to add on phone', desc: 'Clear for people who have never used a contact QR.' },
      { title: 'Save for later — scan here', desc: 'Useful on a booth when people will not chat now.' },
    ],
    faq: [
      { q: 'What is a vCard QR code?', a: 'It is a QR that stores a contact file. Scanning it lets iPhone and Android save your name, number, email, and other fields without typing.' },
      { q: 'Is a vCard QR the same as a digital visiting card app?', a: 'No. App-based digital cards need the other person to open a link and often to sign up. A vCard QR writes straight into the native Contacts app.' },
      { q: 'Does it work on iPhone?', a: 'Yes. The Camera app recognises vCard payloads and offers to add the contact. Test once before a bulk print.' },
      { q: 'Do people need internet?', a: 'No. The details are inside the QR. Internet is only needed later if they tap the website field.' },
      { q: 'Can I include a profile photo?', a: 'Avoid it on a static vCard. Photos make the code too dense for a small card. Put a photo on your website instead.' },
      { q: 'vCard or LinkedIn QR on my card?', a: 'vCard if you want a phone number in their contacts. LinkedIn if you want a connection request. They solve different jobs.' },
      { q: 'Can I update the number later?', a: 'Not on a static vCard. You reprint, or you use a dynamic landing-page QR that you can edit.' },
      { q: 'Is this free?', a: 'Yes. Generate and download a static vCard QR here without paying or creating an account.' },
    ],
    internalLinks: [
      { anchor: 'LinkedIn QR code', path: '/linkedin-qr-code-generator' },
      { anchor: 'Phone call QR', path: '/phone-qr-code-generator' },
      { anchor: 'Email QR', path: '/email-qr-code-generator' },
      { anchor: 'WhatsApp QR', path: '/whatsapp-qr-code-generator' },
    ],
  },

  pdf: {
    type: 'pdf',
    tabType: 'url',
    displayName: 'PDF',
    title: 'Free PDF QR Code Generator | QR Code for PDF Files, Menus and Brochures',
    description:
      'Create a free QR code for a PDF. Link a menu, brochure, price list, manual, or form so a phone opens the file after one scan. Host the PDF, paste the public link, download the code.',
    heroHeading: 'QR Code Generator for PDF Files',
    heroSubheading:
      'Turn a menu, catalogue, brochure, or user manual into a scannable QR. People open the PDF on their phone instead of taking a paper copy they will lose.',
    fact:
      '“QR code for PDF” is searched by restaurants replacing laminated menus, factories sticking manuals on machines, and schools sharing circulars. The QR is not the PDF — it is a door to a file you host once and can replace later.',
    icon: FileText,
    keywords: [
      'pdf qr code generator',
      'qr code for pdf',
      'qr code for pdf file',
      'menu pdf qr code',
      'brochure qr code',
      'share pdf with qr code',
    ],
    article: [
      {
        heading: 'A PDF QR is a link, not the file stuffed into the square',
        paragraphs: [
          'You cannot usefully encode a 12-page menu inside the QR pattern itself. The code would be unreadably dense. A PDF QR code is a URL QR aimed at a publicly shared file: Google Drive, Dropbox, your own website, or any CDN. The phone downloads or previews that file after the scan.',
          'That design is a feature. Replace the PDF at the same URL when prices change, and every sticker already on the table updates. If you burn a file into a static pattern, you would reprint the whole restaurant.',
        ],
      },
      {
        heading: 'How to make a QR code for a PDF that opens on phones',
        paragraphs: [
          'Upload the PDF to Drive or your site. In Drive, set the file to “Anyone with the link”. Use a direct or preview link, not a login wall. Paste that URL here, generate, and scan from a phone that is not logged into your Google account — that is the test that catches private files.',
          'Keep the PDF lean. A 40 MB scan of a printed brochure crawls on 4G. Export from InDesign or Word at a web-reasonable size, with selectable text if you can. Phones handle multi-page PDFs well; they do not handle 200 dpi full-bleed product shots in one file.',
        ],
      },
      {
        heading: 'When a PDF QR is the wrong tool',
        paragraphs: [
          'If you run a restaurant and want photos, veg filters, and daily specials, a live HTML menu (our Menu QR) beats a static PDF. If you need a single image, use the Image QR page. If you need a fillable form people submit, a Google Form URL is better than a printable PDF form.',
          'Use a PDF QR when the artefact already exists as a PDF: a compliance manual, a rate card, a school circular, an AGM notice, a takeaway menu you already designed in Canva.',
        ],
      },
      {
        heading: 'Drive “preview” vs download vs your own domain',
        paragraphs: [
          'Google Drive preview links open in a viewer; some Android browsers then ask to download. Hosting the PDF on your domain (yourbrand.in/menu.pdf) looks more trustworthy and avoids Google login quirks. Whatever you choose, never rotate the filename if you want old stickers to keep working — overwrite the file at the same path.',
        ],
      },
    ],
    useCases: [
      { title: 'Restaurant and cafe menus', desc: 'A table tent opens today’s PDF menu. Swap the file when the chef changes the board; keep the same QR if the URL is stable.' },
      { title: 'Product manuals on equipment', desc: 'A sticker on a machine opens the 40-page manual. No more missing booklets in a drawer.' },
      { title: 'School and housing society circulars', desc: 'Gate posters and WhatsApp forwards with a PDF QR beat blurry photo dumps of a notice.' },
      { title: 'Sales brochures at stalls', desc: 'Let visitors take the catalogue home on their phone instead of a bag of paper they will throw.' },
    ],
    benefits: [
      { title: 'One file, many prints', desc: 'Update the PDF at the same URL and every printed code stays current.' },
      { title: 'Less paper', desc: 'Menus, manuals, and rate cards do not need a reprint for a typo.' },
      { title: 'Phones already read PDFs', desc: 'Safari and Chrome open PDFs without a special app in most cases.' },
      { title: 'Works with files you already have', desc: 'No need to rebuild a Canva brochure as a website first.' },
    ],
    mistakes: [
      { title: 'Private Drive links', desc: 'If the file is restricted to your account, visitors see a Google login. Set “anyone with the link”.' },
      { title: 'Huge scans', desc: 'Photographing a paper menu into a 25 MB PDF makes the QR feel broken on slow data.' },
      { title: 'Changing the filename after print', desc: 'menu-v3.pdf is a new URL. Overwrite menu.pdf instead.' },
      { title: 'Using PDF when you needed a live menu', desc: 'If items change hourly, an HTML menu QR is kinder than a PDF you forget to re-upload.' },
    ],
    howToTitle: 'How to create a QR code for a PDF file',
    howToSteps: [
      { title: 'Host the PDF publicly', desc: 'Upload to Drive, Dropbox, or your website. Confirm a phone that is not yours can open it.' },
      { title: 'Copy the share link', desc: 'Prefer a stable path you will not rename. Paste it into the generator above.' },
      { title: 'Generate and scan-test', desc: 'Use a second phone. You should see the PDF, not a permission error.' },
      { title: 'Download for print', desc: 'SVG for table tents and posters. PNG for WhatsApp status and Instagram.' },
      { title: 'Label the code', desc: 'Write Scan for PDF menu / brochure / manual so people know it is a document, not a website.' },
    ],
    comparison: {
      title: 'Paper handout vs PDF QR',
      theirProduct: 'Printed booklet',
      ourProduct: 'PDF QR on QR Junction',
      points: [
        { feature: 'Updates', them: 'Reprint everything', us: 'Replace the file at the same link' },
        { feature: 'Cost', them: 'Per copy, every revision', us: 'Print the code once' },
        { feature: 'Carrying it home', them: 'Bulky, often dumped', us: 'Already on their phone' },
        { feature: 'Hygiene / space', them: 'Stacks of menus or manuals', us: 'One sticker' },
      ],
    },
    printGuide: {
      title: 'Printing a PDF QR that still scans after lamination',
      description: 'Table tents and machine stickers live a hard life. Design for glare and grease.',
      tips: [
        { title: 'Size on a table tent', desc: '4–5 cm so someone sitting opposite can scan without standing up.' },
        { title: 'Matte lamination', desc: 'Gloss reflects tube lights and blinds the camera. Matte or uncoated stock is safer.' },
        { title: 'Do not flatten a screenshot', desc: 'Export SVG or a large PNG. A WhatsApp-forwarded screenshot of the QR will fail in print.' },
        { title: 'Quiet zone', desc: 'Keep a white ring around the code even if your tent design is dark.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan for the full PDF menu', desc: 'Honest about the format so people expect a document.' },
      { title: 'Scan to download the brochure', desc: 'Good for stalls where taking paper is a hassle.' },
      { title: 'Scan for the latest circular', desc: 'Housing societies and schools can reuse the same print.' },
    ],
    faq: [
      { q: 'How do I create a QR code for a PDF?', a: 'Upload the PDF somewhere public, copy the link, paste it in this generator, test on a phone, and download the QR. The code stores the link, not the whole file.' },
      { q: 'Can I upload a PDF directly here?', a: 'This page encodes the public URL of your file. Host it on Drive or your site first. That way you can replace the PDF later without reprinting the QR.' },
      { q: 'Will the PDF open on iPhone?', a: 'Yes. Safari previews most PDFs. Large files may download first. Keep the PDF reasonably small.' },
      { q: 'Is a PDF menu better than a restaurant menu QR?', a: 'A PDF is fine for a stable, designed menu. If you change items daily or want photos and filters, use the dedicated Menu QR which opens a live page.' },
      { q: 'Can people download the file?', a: 'Usually yes — the phone’s PDF viewer has a share or save action. You cannot prevent a determined download of a public file.' },
      { q: 'What if Google Drive asks them to sign in?', a: 'The sharing setting is wrong. Switch to anyone with the link, or host the file on your own domain.' },
      { q: 'Does the QR expire?', a: 'The QR does not. The link can, if you delete the file or change Drive permissions.' },
      { q: 'SVG or PNG for a cafe table tent?', a: 'SVG if a print shop is involved. A large PNG is acceptable for a home laser print of a small tent.' },
    ],
    internalLinks: [
      { anchor: 'Restaurant menu QR', path: '/menu-qr-code-generator' },
      { anchor: 'Image QR code', path: '/image-qr-code-generator' },
      { anchor: 'URL / website QR', path: '/url-qr-code-generator' },
      { anchor: 'Wi-Fi QR for the same table', path: '/wifi-qr-code-generator' },
    ],
  },

  image: {
    type: 'image',
    tabType: 'url',
    displayName: 'Image',
    title: 'Free Image QR Code Generator | QR Code That Opens a Photo or Picture',
    description:
      'Create a free QR code for an image. Link a photo, lookbook, floor plan, or event picture so a scan opens the picture on the phone. Host the image, paste the public URL, download the QR.',
    heroHeading: 'QR Code Generator for Images and Photos',
    heroSubheading:
      'Make a QR code that shows a picture when scanned — a wedding photo, product shot, seating chart, before/after, or a high-resolution lookbook that will not fit on a card.',
    fact:
      'People search “QR code for image” and “QR code that shows a picture” when they need one photo to travel with a physical object: a framed print, a gift, a property listing, or a stall poster with a tiny thumbnail.',
    icon: ImageLucide,
    keywords: [
      'image qr code generator',
      'qr code for image',
      'qr code for picture',
      'qr code that shows a photo',
      'photo qr code',
      'qr code for jpeg',
    ],
    article: [
      {
        heading: 'An image QR is a public photo link, not pixels inside the square',
        paragraphs: [
          'A JPEG of a wedding group cannot live inside a QR the size of a coin. The code would be a solid blot. An image QR stores the https address of a hosted picture. After the scan, the phone’s browser opens that JPG, PNG, or WebP full-screen.',
          'Host the file on Google Drive (anyone with the link), Imgur, Cloudinary, or your website. Direct image URLs that end in .jpg / .png are the most reliable. A Google Photos share page can work, but it often opens a gallery UI instead of the picture itself.',
        ],
      },
      {
        heading: 'Where a picture QR earns its place',
        paragraphs: [
          'Wedding and event planners print a small code on the invite so guests open a seating chart or a dress code moodboard. Interior designers put a code on a sample board that opens the full-room render. Clinics show a before/after that is too large for a leaflet. Real-estate flyers cannot fit twenty photos; one QR can open a hosted album cover or a hero shot, with a second URL QR if you need the whole gallery.',
          'Gifts and packaging are the sentimental use: a code inside a hamper that opens a personal photo or a handwritten-note scan. That only stays alive if you do not delete the file.',
        ],
      },
      {
        heading: 'Image QR vs PDF vs video vs website',
        paragraphs: [
          'One photo → this page. A multi-page designed document → PDF QR. A clip or Reel → Video QR. A gallery with many shots and text → a landing page or Google Drive folder URL. Do not force a 30-image album into a single image link; the phone will only show one file.',
        ],
      },
      {
        heading: 'Make the picture actually pleasant on a phone',
        paragraphs: [
          'Export around 1600–2000 px on the long side. A 20 MB DSLR original is slow and wasteful. Use sRGB. Avoid a Drive preview that requires pinch-zoom through a tiny thumbnail. Test in both portrait and landscape because people will scan with the phone however they are holding it.',
        ],
      },
    ],
    useCases: [
      { title: 'Invites and seating charts', desc: 'A wedding or conference card opens a crisp seating image instead of a pixelated WhatsApp forward.' },
      { title: 'Product and lookbook shots', desc: 'Hangtags and stall posters link to a high-res photo you could never print at that size on the tag.' },
      { title: 'Property and interior boards', desc: 'A site board QR opens the elevation or the staged living-room render.' },
      { title: 'Personal gifts', desc: 'A code inside a present opens a private hosted photo. Keep the link unlisted, not public-search indexed, if it is personal.' },
    ],
    benefits: [
      { title: 'Full-resolution on a tiny print', desc: 'The physical piece stays clean; the phone shows the detail.' },
      { title: 'Easy to swap the picture', desc: 'Overwrite the file at the same URL and every printed code shows the new shot.' },
      { title: 'No app to install', desc: 'The browser displays JPG and PNG. That is all this job needs.' },
      { title: 'Works next to other QRs', desc: 'Pair with a vCard or WhatsApp code on a brochure: one for the photo, one for contact.' },
    ],
    mistakes: [
      { title: 'Private or expired hosting', desc: 'Google Photos links rot. Prefer a file you control on Drive or your domain.' },
      { title: 'Encoding the image into the QR', desc: 'That is not how QR works at print size. Always host, then encode the URL.' },
      { title: 'A screenshot of a screenshot', desc: 'Recompressing WhatsApp images into the hosted file looks ugly. Upload the original export.' },
      { title: 'No caption on the print', desc: 'Write Scan to view photo. Otherwise people assume it is a website or Wi-Fi.' },
    ],
    howToTitle: 'How to make a QR code that opens a picture',
    howToSteps: [
      { title: 'Host the image', desc: 'Upload a reasonably sized JPG or PNG. Confirm the link opens in an incognito window.' },
      { title: 'Paste the image URL', desc: 'Direct file links are best. Paste into the generator on this page.' },
      { title: 'Generate and preview', desc: 'Scan with your camera. You should see the picture, not a download of unknown.bin.' },
      { title: 'Download the QR', desc: 'PNG for invites sent on WhatsApp. SVG if a printer will put it on a board.' },
    ],
    comparison: {
      title: 'Printing the photo vs an image QR',
      theirProduct: 'Tiny printed thumbnail',
      ourProduct: 'Image QR on QR Junction',
      points: [
        { feature: 'Detail', them: 'Limited by print size', us: 'Full image on a phone screen' },
        { feature: 'Updates', them: 'Reprint the piece', us: 'Replace the hosted file' },
        { feature: 'Colour', them: 'Offset gamut, often dull', us: 'The actual digital file' },
        { feature: 'Privacy of layout', them: 'Photo dominates the card', us: 'A small code, photo on demand' },
      ],
    },
    printGuide: {
      title: 'Printing an image QR on invites and tags',
      description: 'Invites are often dark or foiled. Protect the code from the design around it.',
      tips: [
        { title: 'Keep a white patch', desc: 'Do not drop a dark QR onto a navy invite without a light plate behind it.' },
        { title: '2.5 cm on invites', desc: 'People scan with one hand while holding a glass. Give the camera room.' },
        { title: 'Test foil and texture', desc: 'Spot UV and heavy cotton stock can hide modules. A flat uncoated patch is safer.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan to view the photo', desc: 'Literal and clear on gifts and frames.' },
      { title: 'Scan for the seating chart', desc: 'Events where the card cannot hold the table map.' },
      { title: 'Scan for high-res look', desc: 'Retail tags and catalogues.' },
    ],
    faq: [
      { q: 'How do I create a QR code for an image?', a: 'Host the picture at a public https URL, paste that URL here, generate the QR, and test the scan. The QR stores the link to the photo.' },
      { q: 'Can the QR display the picture without internet?', a: 'No. Unlike a text QR, an image QR needs the phone to fetch the file. For offline text, use the Text generator instead.' },
      { q: 'Google Drive or Imgur?', a: 'Drive is fine if sharing is set to anyone with the link. A direct CDN or your own domain is more stable for anything you will print in bulk.' },
      { q: 'Can I show several photos?', a: 'One image URL shows one file. For a set, host a folder or a landing page and use a URL QR, or make one QR per hero image.' },
      { q: 'Will Instagram compress it if I share the QR there?', a: 'Instagram will compress the QR graphic. Upload a large PNG and keep the code big in the frame, or share the PNG as a document on WhatsApp instead.' },
      { q: 'Is this free?', a: 'Yes. The generator is free. Hosting the image is on whatever service you already use.' },
    ],
    internalLinks: [
      { anchor: 'PDF QR for multi-page files', path: '/pdf-qr-code-generator' },
      { anchor: 'Video QR', path: '/video-qr-code-generator' },
      { anchor: 'URL QR', path: '/url-qr-code-generator' },
      { anchor: 'Menu QR', path: '/menu-qr-code-generator' },
    ],
  },

  video: {
    type: 'video',
    tabType: 'url',
    displayName: 'Video',
    title: 'Free Video QR Code Generator | QR Code for YouTube, Vimeo and MP4 Links',
    description:
      'Create a free QR code for a video. Link a YouTube video, Shorts, Vimeo, or an MP4 so a scan starts the clip on the phone. Paste the video URL, customise, download PNG or SVG.',
    heroHeading: 'QR Code Generator for Videos',
    heroSubheading:
      'Put a video QR on packaging, posters, textbooks, or a shop display. One scan opens the tutorial, ad, hymn, or product demo — YouTube, Vimeo, or a hosted MP4.',
    fact:
      '“QR code for video” is a different job from a YouTube channel QR. This page is for a specific clip: how-to, testimonial, property walkthrough, class lecture, or a factory safety film stuck on a wall.',
    icon: Video,
    keywords: [
      'video qr code generator',
      'qr code for video',
      'qr code for youtube video',
      'qr code that plays a video',
      'mp4 qr code',
      'vimeo qr code',
    ],
    article: [
      {
        heading: 'What happens when someone scans a video QR',
        paragraphs: [
          'The code contains a URL. YouTube links usually open the YouTube app if it is installed, otherwise the mobile site. Vimeo and self-hosted MP4s open in the browser player. Nothing autoplays at full volume without a tap — phones block that, which is good. Your poster should still say Scan to watch so people expect a clip, not a form.',
          'Use a timestamp if the useful part starts later (?t=45 or &t=45s on YouTube). Do not send people to a 20-minute video when the demo they need is at 12:40 unless you jump them there.',
        ],
      },
      {
        heading: 'YouTube vs Vimeo vs a raw MP4 file',
        paragraphs: [
          'YouTube is right for public tutorials, ads, and anything you already published. It handles buffering on cheap 4G better than most self-hosted files. Vimeo is common for passworded client work and cleaner players without suggested “other videos” from competitors. A raw MP4 on your domain is right for a kiosk or an intranet, but the file must be small enough for mobile data — think a few tens of megabytes, not a 4K master.',
          'If the only goal is “subscribe to my channel”, use the YouTube generator instead. This video page is clip-first.',
        ],
      },
      {
        heading: 'Packaging, classrooms, and shop floors',
        paragraphs: [
          'Appliance boxes with a QR to an unboxing video cut support calls. Coaching centres print a code on homework that opens the day’s explanation. Gyms put a code on a machine that opens the form video. Real-estate boards open a walkthrough filmed on a phone. In all of these, the video should start with the payoff in the first five seconds because people scan standing up.',
        ],
      },
      {
        heading: 'Unlisted vs public, and what not to encode',
        paragraphs: [
          'YouTube unlisted links work in a QR: anyone with the scan can watch, but it is not listed on your channel. That is the usual choice for a client-specific film. Private videos will fail for everyone who is not logged in as you. Do not encode a Google Drive video that still asks for access. Test with a colleague’s phone.',
        ],
      },
    ],
    useCases: [
      { title: 'Product how-to on the box', desc: 'Scan to watch setup. Shorter than a paper manual, and you can update the video later if the URL stays the same.' },
      { title: 'Property and hotel walkthroughs', desc: 'A board outside the gate opens a 60-second tour for people who will not book a visit yet.' },
      { title: 'Classroom and tuition notes', desc: 'A worksheet QR opens the explanation for that exercise, not the whole channel.' },
      { title: 'Shop displays and windows', desc: 'After hours, the shutter can still play your brand film to anyone who scans from the pavement.' },
    ],
    benefits: [
      { title: 'The right clip, not a homepage', desc: 'You control the exact video and even the timestamp.' },
      { title: 'App-aware YouTube links', desc: 'Phones with the YouTube app typically open it natively for a better player.' },
      { title: 'Works with Vimeo and MP4', desc: 'You are not locked to one platform.' },
      { title: 'Print once if the URL is stable', desc: 'Replace the YouTube file or keep the same watch URL and old posters stay valid.' },
    ],
    mistakes: [
      { title: 'Linking a private video', desc: 'Viewers who are not you will see a lock. Use unlisted or public.' },
      { title: 'A 4K file on a poster', desc: 'Self-hosted giants will spin on mobile data. Compress.' },
      { title: 'No context on the print', desc: 'Scan to watch the 45-sec demo converts. A silent QR does not.' },
      { title: 'Using this when you wanted the channel', desc: 'Channel growth belongs on the YouTube QR page.' },
    ],
    howToTitle: 'How to create a QR code for a video',
    howToSteps: [
      { title: 'Copy the watch URL', desc: 'YouTube share link, Vimeo link, or a direct MP4. Add a timestamp if needed.' },
      { title: 'Paste it above', desc: 'This generator treats it as a video destination and keeps the rest of the page about clips, not generic URLs.' },
      { title: 'Scan from cellular data', desc: 'Wi-Fi at your desk hides buffering problems your customers will hit on the street.' },
      { title: 'Download PNG or SVG', desc: 'SVG for packaging print. PNG for stories and slides.' },
    ],
    comparison: {
      title: 'Printed instructions vs a video QR',
      theirProduct: 'Text / diagrams on the box',
      ourProduct: 'Video QR on QR Junction',
      points: [
        { feature: 'Clarity', them: 'Easy to skip or misread', us: 'Someone shows the steps' },
        { feature: 'Language', them: 'One language on pack', us: 'You can host versions per language at different URLs' },
        { feature: 'Updates', them: 'New print run', us: 'New upload, same link if you planned it' },
        { feature: 'Space on pack', them: 'Eats the artwork', us: 'A small labelled code' },
      ],
    },
    printGuide: {
      title: 'Video QR on packaging and posters',
      description: 'People scan these while holding a product or standing in a corridor. Make the first attempt work.',
      tips: [
        { title: 'Contrast on coloured packs', desc: 'Place the code on a white patch, not on a photo of the product.' },
        { title: 'Size on a box', desc: 'At least 2.5 cm. Assembly videos are often scanned at arm’s length.' },
        { title: 'Say it is a video', desc: 'A play-icon in the artwork plus Scan to watch beats a mystery square.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan to watch the demo', desc: 'Product packaging and stall screens.' },
      { title: 'Scan for the 1-minute tour', desc: 'Real estate and hotels.' },
      { title: 'Scan to see how it fits', desc: 'Apparel, furniture, and kits.' },
    ],
    faq: [
      { q: 'How do I make a QR code for a video?', a: 'Copy the YouTube, Vimeo, or MP4 URL, paste it into this generator, test the scan on a phone, and download the image.' },
      { q: 'Will the video play automatically?', a: 'The phone will open the player. Autoplay with sound is usually blocked. The viewer taps play. That is normal.' },
      { q: 'Can I use a YouTube Short or Instagram Reel?', a: 'YouTube Shorts links work. Instagram Reels often require the Instagram app and login; a YouTube or MP4 copy is more reliable on a poster.' },
      { q: 'Video QR vs YouTube QR on this site?', a: 'Video = one clip (any host). YouTube generator = channel or YouTube-specific growth. Use both if you need both jobs.' },
      { q: 'Can I start at a timestamp?', a: 'Yes. Use YouTube’s t= parameter before you generate so the QR includes it.' },
      { q: 'What if I take the video down?', a: 'The QR still scans and then shows a dead player. Keep the clip up, or use a dynamic URL you can retarget.' },
    ],
    internalLinks: [
      { anchor: 'YouTube channel QR', path: '/youtube-qr-code-generator' },
      { anchor: 'Image QR', path: '/image-qr-code-generator' },
      { anchor: 'URL QR', path: '/url-qr-code-generator' },
      { anchor: 'PDF QR', path: '/pdf-qr-code-generator' },
    ],
  },

  wifi: {
    type: 'wifi',
    tabType: 'wifi',
    displayName: 'Wi-Fi',
    title: 'Free WiFi QR Code Generator | Connect to Wi-Fi Without Typing the Password',
    description:
      'Create a free Wi-Fi QR code for home, cafe, office, or Airbnb. Guests scan and join the network without typing a WPA password. Works with iPhone and Android camera apps.',
    heroHeading: 'Wi-Fi QR Code Generator — Scan to Connect',
    heroSubheading:
      'Generate a Wi-Fi QR for your SSID and password. Put it on a table tent, fridge, reception desk, or guest-room card. Visitors join the network without you reading the password aloud.',
    fact:
      '“WiFi QR code generator” is one of the most searched QR tools in the world because WPA2 passwords are long, case-sensitive, and miserable to type from a wall poster. A scan sends the same WIFI: payload iOS and Android already understand.',
    icon: Wifi,
    keywords: [
      'wifi qr code generator',
      'qr code for wifi',
      'wifi qr code',
      'connect to wifi with qr',
      'wpa qr code',
      'guest wifi qr',
    ],
    article: [
      {
        heading: 'What a Wi-Fi QR actually sends to the phone',
        paragraphs: [
          'It is not a website. The pattern stores a WIFI: string: network name (SSID), password, encryption type (usually WPA/WPA2), and whether the network is hidden. iPhone (iOS 11+) and current Android cameras understand that payload and show Join. After the person confirms, the phone saves the network like any other Wi-Fi.',
          'You still choose what they join. A cafe should encode the guest SSID, not the owner’s office VLAN. A home should encode the household network you are willing to share, not the IoT SSID with your cameras.',
        ],
      },
      {
        heading: 'How to create a Wi-Fi QR that does not fail at the table',
        paragraphs: [
          'Type the SSID exactly, including spaces and capitals. Copy-paste the password from the router card; do not retype it from memory. Choose WPA/WPA2 for almost every modern router. Use WEP only for museum-piece hardware. Tick hidden if the network does not broadcast (most home networks should not be hidden — it does not add real security and it makes joining harder).',
          'Generate, then forget the network on your phone and scan the code as a guest would. If you stay logged in, you will never catch a wrong password. Test Android and iPhone; both work, but the Join wording differs.',
        ],
      },
      {
        heading: 'Cafes, PGs, offices, and Airbnbs',
        paragraphs: [
          'Cafes: a 4 cm code on each table beats staff spelling the password 40 times a night. Put Scan for Wi-Fi in English and the local language if your crowd needs it. Offices: a guest network QR at reception, rotated when contractors leave, is cleaner than a password on a whiteboard. Airbnbs: a card on the nightstand; mention it in the welcome WhatsApp so people look for it.',
          'Do not print the plaintext password next to the QR if you care about shoulder surfing. The whole point of the code is that the secret never has to sit on the wall in letters.',
        ],
      },
      {
        heading: 'Security, WPA3, and what a Wi-Fi QR is not',
        paragraphs: [
          'A Wi-Fi QR is as secret as whoever can see the print. Laminate it at a cafe and walk-ins will join — that is the idea. It is not a firewall. Use a guest network with client isolation so visitors cannot see your POS laptop. WPA3 is fine if both the router and phones support it; if older Android devices fail, generate a WPA2 guest SSID for them.',
          'This is also not a “free internet QR” from a public city hotspot that needs a browser login. Captive portals still need a URL QR to the login page after the phone associates, or a simple poster with instructions.',
        ],
      },
    ],
    useCases: [
      { title: 'Cafe and restaurant tables', desc: 'Guests connect before they open your menu QR. Two codes on one tent is a common, good setup.' },
      { title: 'Home and PG living rooms', desc: 'Stop dictating the password to every courier and relative.' },
      { title: 'Office reception and meeting rooms', desc: 'A guest SSID QR on the front desk. Change the password on a schedule; reprint one card.' },
      { title: 'Hotels and Airbnbs', desc: 'Nightstand card plus a note in the listing: Wi-Fi is the QR, not a 16-character scream on WhatsApp.' },
    ],
    benefits: [
      { title: 'No typing, no case errors', desc: 'WPA passwords fail on a single wrong capital. The QR cannot mistype.' },
      { title: 'Password stays off the whiteboard', desc: 'People scan; they do not photograph a wall of characters as easily.' },
      { title: 'Native on iPhone and Android', desc: 'Camera app is enough. No “Wi-Fi helper” app.' },
      { title: 'Hidden SSIDs supported', desc: 'Tick hidden if you actually use a non-broadcast network.' },
    ],
    mistakes: [
      { title: 'Wrong encryption dropdown', desc: 'Selecting WEP on a WPA2 router makes Join fail with a useless error.' },
      { title: 'SSID typo or extra space', desc: 'Copy from the router admin page. “Cafe_Guest” and “Cafe Guest” are different networks.' },
      { title: 'Printing the main office SSID', desc: 'Give visitors a guest VLAN. Isolation exists for a reason.' },
      { title: 'Tiny code on a dark wood table tent', desc: 'Light background, 4 cm, matte lamination.' },
    ],
    howToTitle: 'How to generate a Wi-Fi QR code',
    howToSteps: [
      { title: 'Read the SSID and password from the router', desc: 'Do not guess. Use the sticker or the admin page.' },
      { title: 'Fill the form above', desc: 'SSID, password, WPA/WPA2 in most homes and shops, hidden only if it truly is.' },
      { title: 'Forget the network on your phone', desc: 'Then scan as a new guest would. Confirm Join works.' },
      { title: 'Download and print', desc: 'Table tent, fridge magnet, reception acrylic. Label it Scan for Wi-Fi.' },
    ],
    comparison: {
      title: 'Password on a board vs a Wi-Fi QR',
      theirProduct: 'Written password',
      ourProduct: 'Wi-Fi QR on QR Junction',
      points: [
        { feature: 'Time to join', them: '1–3 minutes of typing', us: 'A few seconds and a Join tap' },
        { feature: 'Errors', them: 'Constant, especially symbols', us: 'None if you copied the password once' },
        { feature: 'Staff time', them: 'Repeating the password all evening', us: 'Point at the tent' },
        { feature: 'Look', them: 'A messy whiteboard', us: 'A small branded card' },
      ],
    },
    printGuide: {
      title: 'Wi-Fi QR table tents that survive tea stains',
      description: 'This is the QR that lives next to cups. Design for wet tables and low light.',
      tips: [
        { title: '4 cm on tables', desc: 'People scan sitting down, often with one hand. Bigger is kinder.' },
        { title: 'Matte, not glossy', desc: 'Overhead LEDs plus gloss equals a white blob on camera.' },
        { title: 'Reprint when you rotate the password', desc: 'A guest network you never rotate is a gift to whoever photographed the tent last year.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan to join Wi-Fi', desc: 'Universal. Put it in English plus the local script if needed.' },
      { title: 'Guest Wi-Fi — scan here', desc: 'Makes it obvious this is not the staff network.' },
      { title: 'No password typing — scan', desc: 'Useful in Airbnbs for tired arrivals.' },
    ],
    faq: [
      { q: 'How do I create a QR code for Wi-Fi?', a: 'Enter the network name, password, and encryption (usually WPA) in the form on this page. Download the QR and test by forgetting the network on your phone, then scanning.' },
      { q: 'Does iPhone support Wi-Fi QR codes?', a: 'Yes, from iOS 11 onward the Camera app offers Join. Android’s default camera does the same on current versions.' },
      { q: 'Is it safe to put my Wi-Fi in a QR?', a: 'Anyone who can see the print can join, same as a written password. Use a guest network with isolation in shops and offices.' },
      { q: 'WPA, WPA2, or WPA3?', a: 'Pick what the router actually uses. WPA/WPA2 covers most Indian home and cafe routers. WPA3 if you have enabled it and your guests’ phones support it.' },
      { q: 'Hidden network?', a: 'Tick the hidden box so the phone knows to look for that SSID. Hidden SSIDs are not strong security.' },
      { q: 'Will this work without mobile data?', a: 'Joining Wi-Fi does not need mobile data. That is the point — they may have no data until they join.' },
      { q: 'Can I change the password later?', a: 'Then the printed QR is wrong. Generate a new one. Dynamic website QRs cannot update a WIFI: payload on a static print.' },
      { q: 'Why does Join fail?', a: 'Wrong password, wrong encryption, extra space in the SSID, or you encoded 5 GHz vs 2.4 GHz names that do not match what the phone can see. Recheck the router page.' },
    ],
    internalLinks: [
      { anchor: 'Restaurant menu QR', path: '/menu-qr-code-generator' },
      { anchor: 'URL QR', path: '/url-qr-code-generator' },
      { anchor: 'vCard QR', path: '/vcard-qr-code-generator' },
      { anchor: 'PDF menu QR', path: '/pdf-qr-code-generator' },
    ],
  },

  'app-store': {
    type: 'app-store',
    tabType: 'app_download',
    displayName: 'App Store',
    title: 'Free App Store QR Code Generator | One QR for iOS App Store and Google Play',
    description:
      'Create a free app download QR code. One scan sends iPhone users to the App Store and Android users to Google Play. Add a fallback URL for desktops. Boost offline app installs from posters and packaging.',
    heroHeading: 'App Store QR Code — One Code for iPhone and Android',
    heroSubheading:
      'Stop printing two store badges. Generate a smart app QR with your iOS link, Play Store link, and a website fallback. Packaging, ads, and stall standees stay clean.',
    fact:
      '“App Store QR code” and “QR code for app download” get searched by product teams who are tired of splitting print space between Apple and Google badges. One code, store detection, fewer confused scans.',
    icon: Smartphone,
    keywords: [
      'app store qr code generator',
      'qr code for app download',
      'play store qr code',
      'ios android qr code',
      'smart app qr',
      'app install qr code',
    ],
    article: [
      {
        heading: 'Why two store URLs need one QR',
        paragraphs: [
          'Apple’s App Store link 404s on Android. Google Play links open a browser page on iPhone that cannot install. Printing both badges eats the pack. A smart app QR is a short cloud link: our server reads the phone’s user-agent and redirects to the iOS URL, the Android URL, or your fallback website for laptops.',
          'That is the entire product. You paste both store links once. You print one square.',
        ],
      },
      {
        heading: 'How to build an app download QR that does not bounce',
        paragraphs: [
          'Copy the App Store URL from App Store Connect or the public product page (apps.apple.com/…). Copy the Play Store URL from Play Console (play.google.com/store/apps/details?id=…). Add a fallback — usually your marketing site’s download page — for people who scan with a webcam or iPad browser.',
          'Test with a real iPhone and a real Android, not only your laptop preview. Also open the fallback on a desktop. If either store URL is a country-locked page, visitors abroad may see an empty store; use the international product URL.',
        ],
      },
      {
        heading: 'Packaging, OOH, and in-store',
        paragraphs: [
          'IoT devices that need a companion app should put this QR on the lid, not buried in a booklet. Retail counters can stand a small acrylic with Scan to get the loyalty app. Transit ads work if the code is huge and the promise is one sentence: Scan to install. Do not send people to a brand film first; send them to the store listing.',
        ],
      },
      {
        heading: 'What this QR cannot promise',
        paragraphs: [
          'A scan is not an install. Store conversion still depends on screenshots, ratings, and size of the APK/IPA. Our analytics (on dynamic codes) count scans and platform split; Apple and Google still own the install number. Also, Huawei phones without Play Store will hit your fallback — make that fallback useful, not a dead homepage.',
        ],
      },
    ],
    useCases: [
      { title: 'Product packaging', desc: 'Companion apps, fintech cards, and gadgets that are useless until the app is installed.' },
      { title: 'Store counters and food halls', desc: 'Loyalty and ordering apps. One code beside the billing desk.' },
      { title: 'Print and outdoor ads', desc: 'A single square instead of two store badges on a bus back.' },
      { title: 'Event badges and talks', desc: 'Speakers put one code on the last slide: Scan to get the app we just demoed.' },
    ],
    benefits: [
      { title: 'Platform detection', desc: 'iOS → App Store. Android → Play. Desktop → fallback URL.' },
      { title: 'One print asset', desc: 'Designers stop arguing about badge size on a 4-colour pack.' },
      { title: 'Fallback for odd devices', desc: 'Huawei, desktop, and tablets are not left on a 404.' },
      { title: 'Cleaner creative', desc: 'A labelled QR plus your icon often outperforms two official badges people ignore.' },
    ],
    mistakes: [
      { title: 'Pasting a tracking-wrapped link that breaks on mobile', desc: 'Use the canonical store URLs. Add campaign parameters only if you have tested them on both phones.' },
      { title: 'Empty fallback', desc: 'Someone will scan from a laptop. Give them a page with both buttons.' },
      { title: 'Region-locked listings', desc: 'A US-only App Store URL fails for an Indian iPhone. Use the right territory link.' },
      { title: 'Code too small on OOH', desc: 'Billboards need a large code and time to scan at a signal, not at highway speed.' },
    ],
    howToTitle: 'How to create an App Store / Play Store QR',
    howToSteps: [
      { title: 'Copy both store URLs', desc: 'App Store product page and Play Store details page, plus a website fallback.' },
      { title: 'Paste them in the app fields above', desc: 'iOS, Android, fallback. Generate the smart code.' },
      { title: 'Test three ways', desc: 'iPhone, Android, and a laptop browser. Confirm each lands correctly.' },
      { title: 'Download for production', desc: 'SVG for packaging. PNG for slides and ads.' },
    ],
    comparison: {
      title: 'Two badges vs one app QR',
      theirProduct: 'App Store + Play badges',
      ourProduct: 'App QR on QR Junction',
      points: [
        { feature: 'Print space', them: 'Two logos, two URLs', us: 'One square' },
        { feature: 'Wrong-store taps', them: 'iPhone users hitting Play by mistake', us: 'Detection routes them' },
        { feature: 'Desktop scans', them: 'Dead end', us: 'Fallback page' },
        { feature: 'Design', them: 'Badge guidelines are rigid', us: 'Your colours, your logo in the code' },
      ],
    },
    printGuide: {
      title: 'App QR on packs and posters',
      description: 'Install intent is impatient. If the first scan fails, they will not try a second store badge either.',
      tips: [
        { title: 'White quiet zone on coloured packs', desc: 'Do not reverse the code out of a photo of the product.' },
        { title: 'Say which app', desc: 'Scan to install {App name} — not a generic square.' },
        { title: 'Keep store listings ready', desc: 'A QR to an “item not available in your country” page is wasted print.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan to install the app', desc: 'Default line on packaging.' },
      { title: 'Scan for iOS and Android', desc: 'Reassures people they will get the right store.' },
      { title: 'Get the loyalty app — scan', desc: 'Retail counters.' },
    ],
    faq: [
      { q: 'How does one QR send people to the right store?', a: 'The code opens a smart link. The server checks whether the device looks like iOS or Android and redirects to the URL you pasted for that platform.' },
      { q: 'What if someone scans with a computer?', a: 'They hit the fallback URL, which should be a download page with both store buttons.' },
      { q: 'Can I track installs?', a: 'We can count scans and, on dynamic codes, platform. Apple and Google still report actual installs in their consoles. Use store campaign parameters if you need that join.' },
      { q: 'Is this free?', a: 'Generating the code is free to try here. Smart routing uses the app-download tab so both store URLs are stored with the code.' },
      { q: 'Huawei / phones without Play Store?', a: 'They typically receive the fallback. If you have a Huawei listing, put that URL in fallback or on the fallback page.' },
      { q: 'Can I change store URLs after printing?', a: 'Only if you used a dynamic / smart code whose destination you can edit. A fully static double-URL print cannot be patched.' },
    ],
    internalLinks: [
      { anchor: 'URL QR', path: '/url-qr-code-generator' },
      { anchor: 'Landing page QR', path: '/landing-page-qr-code-generator' },
      { anchor: 'Video QR', path: '/video-qr-code-generator' },
      { anchor: 'Google Review QR', path: '/google-review-qr-code-generator' },
    ],
  },

  'google-review': {
    type: 'google-review',
    tabType: 'review',
    displayName: 'Google Review',
    title: 'Free Google Review QR Code Generator | Get More Google Maps Reviews',
    description:
      'Create a free Google Review QR code for your shop, restaurant, clinic, or hotel. Customers scan, land on your Maps review flow, and leave a rating. The fastest offline way to grow Google reviews in India.',
    heroHeading: 'Google Review QR Code Generator for Shops and Restaurants',
    heroSubheading:
      'Print a review QR for your billing counter, table tent, or parcel bag. Happy customers scan and open your Google Business review page instead of promising they will “do it later”.',
    fact:
      '“Google review QR code” is one of the highest-intent local searches because Maps ratings decide who gets the call. A code at the counter beats a verbal ask that people forget the moment they step outside.',
    icon: Star,
    keywords: [
      'google review qr code generator',
      'qr code for google reviews',
      'google maps review qr',
      'review qr code',
      'increase google reviews',
      'google business qr code',
    ],
    article: [
      {
        heading: 'What a Google Review QR should open',
        paragraphs: [
          'It should open your public Google review write URL (the “Write a review” link from Google Business Profile), not a generic search for your brand name. A search still makes people pick between similarly named shops. The write-review link is unique to your location.',
          'On this generator you also set the business name and optional messages. The review tab can route very unhappy ratings to private feedback first so a one-star rant is not the only path. That is a product choice: public Maps for genuine praise, a quieter form when someone is angry at the table.',
        ],
      },
      {
        heading: 'Where to put the code so reviews actually happen',
        paragraphs: [
          'Billing counter, after the bill is paid, while they still have the phone in hand. Table tents in cafes with Scan to review us on Google. Parcel stickers for cloud kitchens. Clinic discharge summaries. Hotel pillows are too late; the front-desk card as they check out is on time.',
          'Ask when the experience was good. Do not tape a review QR over a complaint. Staff can still say, “If you had a good time, this code opens Google in ten seconds.”',
        ],
      },
      {
        heading: 'How to copy the correct Google review link',
        paragraphs: [
          'Open Google Business Profile, find the option to get a review link, or search your business on Maps, open the listing, and use the share / review entry that points at your place ID. Test the link in incognito on a phone. You should see your business name and a star widget, not a list of competitors.',
        ],
      },
      {
        heading: 'Reviews, filtering, and what Google still decides',
        paragraphs: [
          'Google may not show every review. QR codes do not bypass Maps policies. Fake-review schemes will hurt you. What the QR does is remove the friction for real customers who already wanted to rate you and then opened Instagram instead.',
        ],
      },
    ],
    useCases: [
      { title: 'Restaurant and cafe counters', desc: 'A 4 cm code beside the UPI stand. Natural moment: they are already paying on the phone.' },
      { title: 'Clinics, salons, and gyms', desc: 'Front desk after a good session, not during a wait for a late doctor.' },
      { title: 'Hotels and homestays', desc: 'Checkout card and a follow-up WhatsApp with the same destination if they missed the card.' },
      { title: 'Retail and service shops', desc: 'Electronics, tailors, and local services where Maps is how the next customer finds you.' },
    ],
    benefits: [
      { title: 'Opens the write-review screen', desc: 'Not a scavenger hunt through Maps search.' },
      { title: 'Optional private path for low stars', desc: 'The review tool can catch complaints before they go public, if you configure it.' },
      { title: 'Works with the phone they are holding', desc: 'No “search our name on Google” speech.' },
      { title: 'Print anywhere you already take payment', desc: 'The same square of counter real estate as your QR for UPI.' },
    ],
    mistakes: [
      { title: 'Linking a Google search, not the review URL', desc: 'People will review the wrong branch or give up.' },
      { title: 'Asking too early', desc: 'A review QR on the empty table before food arrives collects impatient one-stars.' },
      { title: 'Incentives that violate Google rules', desc: 'Do not buy five-stars. Ask for honest reviews after good service.' },
      { title: 'One code for five outlets', desc: 'Each location needs its own Maps listing and its own review URL.' },
    ],
    howToTitle: 'How to create a Google Review QR code',
    howToSteps: [
      { title: 'Copy your Google review link', desc: 'From Business Profile. Confirm it opens your listing’s star widget on a phone.' },
      { title: 'Enter business name and the link above', desc: 'Add optional welcome text so the flow feels like your shop, not a raw Maps page.' },
      { title: 'Generate and test', desc: 'Scan from a personal Gmail phone, not only the owner account.' },
      { title: 'Print for the counter', desc: '4 cm, Scan to review us on Google, next to payment — not in a dark corner.' },
    ],
    comparison: {
      title: 'Verbal ask vs a Google Review QR',
      theirProduct: '“Please google us”',
      ourProduct: 'Review QR on QR Junction',
      points: [
        { feature: 'Follow-through', them: 'Most people forget', us: 'They are already on the phone' },
        { feature: 'Wrong listing', them: 'Common with similar names', us: 'Exact review URL' },
        { feature: 'Staff effort', them: 'Repeat the speech', us: 'Point at the standee' },
        { feature: 'Timing', them: 'After they left', us: 'At the bill' },
      ],
    },
    printGuide: {
      title: 'Review QR at the counter',
      description: 'This code competes with UPI apps and change-counting. Make it obvious and large.',
      tips: [
        { title: 'Sit it next to payment', desc: 'The phone is already out. That is your window.' },
        { title: 'Name the destination', desc: 'Scan for a Google review — not a mystery QR beside three other mystery QRs.' },
        { title: 'One listing per print', desc: 'Chain outlets: generate a code per Maps location.' },
      ],
    },
    ctaExamples: [
      { title: 'Scan to review us on Google', desc: 'The line that matches the search query people use.' },
      { title: 'Happy with your visit? Scan', desc: 'Soft ask at cafes.' },
      { title: '30 seconds to rate us', desc: 'Clinics and salons at checkout.' },
    ],
    faq: [
      { q: 'How do I create a QR code for Google reviews?', a: 'Paste your Google Business “write a review” link into this generator with your business name, test the scan, and print it for the counter.' },
      { q: 'Where do I find my Google review link?', a: 'Google Business Profile → ask for reviews / get a review link. Test it on a phone that is not the owner account.' },
      { q: 'Does this work if they do not have the Google Maps app?', a: 'The link opens in the browser or the app if installed. They still need a Google account to post, which Google requires anyway.' },
      { q: 'Can I filter one-star reviews?', a: 'The review tab lets you send low ratings to private feedback first. Google still forbids fake or incentivised public reviews.' },
      { q: 'One QR for two branches?', a: 'No. Each Maps listing has its own place ID. Make one code per outlet.' },
      { q: 'Is it free?', a: 'Generating the QR is free. Google does not charge to receive reviews.' },
    ],
    internalLinks: [
      { anchor: 'WhatsApp QR', path: '/whatsapp-qr-code-generator' },
      { anchor: 'Menu QR', path: '/menu-qr-code-generator' },
      { anchor: 'URL QR', path: '/url-qr-code-generator' },
      { anchor: 'vCard QR', path: '/vcard-qr-code-generator' },
    ],
  },
};
