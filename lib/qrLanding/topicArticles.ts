import type { QRLandingContent } from './types';

type ArticleExtra = Pick<
  QRLandingContent,
  'article' | 'mistakes' | 'keywords' | 'howToTitle' | 'howToSteps' | 'displayName'
> & { extraFaq?: QRLandingContent['faq'] };

export const TOPIC_ARTICLES: Record<string, ArticleExtra> = {
  text: {
    displayName: 'Text',
    howToTitle: 'How to create a plain-text QR code',
    howToSteps: [
      { title: 'Write the short message', desc: 'A serial, coupon, or instruction — not a website URL and not an essay.' },
      { title: 'Generate and check density', desc: 'If the preview looks like a grey square, shorten the text or print it larger.' },
      { title: 'Scan offline', desc: 'Turn on airplane mode and scan. The note should still appear. That is the test that proves it is a text QR.' },
      { title: 'Print with a label', desc: 'Write what the code contains. Nobody scans a mystery square on a warehouse rack.' },
    ],
    keywords: ['text qr code generator', 'qr code for text', 'offline qr code', 'qr code with message'],
    article: [
      {
        heading: 'When a text QR is the right tool (and when it is not)',
        paragraphs: [
          'A text QR stores the characters themselves inside the pattern. After a scan, the phone shows a note — a serial number, a Wi-Fi hint you should not have used this for, a coupon code, a machine shutdown step. No website opens. No internet is required. That is the whole product, and it is why warehouses and event games still search for “QR code for text”.',
          'Do not use it for a website, a PDF, or a photo. Those need a URL. Do not use it for a novel: past a few hundred characters the square turns into a grey fog that cheap cameras refuse. Keep messages short, like a label, not like an email.',
        ],
      },
      {
        heading: 'Capacity, density, and printing a text QR that still scans',
        paragraphs: [
          'The spec allows thousands of characters. Your printer and the guest’s lens do not. For a 3 cm sticker, stay well under a few hundred characters. Raise error correction if you add a logo. Print dark-on-light. Test from the distance people will actually stand, especially on metal shelves that glare.',
        ],
      },
    ],
    mistakes: [
      { title: 'Pasting a URL into a text QR', desc: 'The phone may show the address as text instead of opening it. Use the URL generator for links.' },
      { title: 'A paragraph on a tiny sticker', desc: 'Dense codes fail. Shorten the message or move the essay to a PDF QR.' },
    ],
  },
  instagram: {
    displayName: 'Instagram',
    howToTitle: 'How to create an Instagram QR code',
    keywords: ['instagram qr code generator', 'qr code for instagram', 'instagram profile qr', 'qr code for instagram reel'],
    article: [
      {
        heading: 'Instagram profile QR vs a Reel or post link',
        paragraphs: [
          'Most shops want a profile QR: scan, land on the grid, follow. That is a username. A Reel, a product post, or a highlight needs the full share URL from Instagram, not the handle. Mixing those up is the usual reason a “Scan our Instagram” poster opens the wrong place.',
          'Instagram’s own yellow-and-gradient code from the app only points at the profile and downloads as a soft screenshot. Fine for a story. Weak on a 4-colour menu. This generator gives you SVG, brand colours, and a logo that matches the rest of the print.',
        ],
      },
      {
        heading: 'Where Instagram QRs convert in Indian shops',
        paragraphs: [
          'Cafe tents next to the Wi-Fi QR, salon mirrors while colour processes, boutique carry bags, gym fronts. The call to action has to be specific: Scan for today’s specials on Instagram beats Scan for IG. If you change your username, a static profile QR dies — freeze the handle or use a dynamic URL QR that you can retarget.',
        ],
      },
    ],
    mistakes: [
      { title: 'Changing the Instagram username after print', desc: 'Static codes follow the old URL. Reprint, or use a dynamic link you control.' },
      { title: 'Using Instagram’s in-app code on a banner', desc: 'It is low-res and profile-only. Export SVG from here for anything a printer will enlarge.' },
    ],
  },
  facebook: {
    displayName: 'Facebook',
    howToTitle: 'How to create a Facebook Page QR code',
    keywords: ['facebook qr code generator', 'qr code for facebook page', 'facebook page qr'],
    article: [
      {
        heading: 'Facebook Page, Group, or profile — pick one job',
        paragraphs: [
          'A Page QR is for local shops that still live on Facebook for reviews, hours, and events. A Group QR is for communities (alumni, housing, hobby). A profile QR is personal. Print the Page URL from facebook.com/yourpage, not a share link that expires, and not a search for the brand name that lists three similarly named cafes.',
        ],
      },
    ],
    mistakes: [
      { title: 'Encoding a temporary share URL', desc: 'Copy the canonical Page address from the browser bar while logged into the Page.' },
    ],
  },
  whatsapp: {
    displayName: 'WhatsApp',
    howToTitle: 'How to create a WhatsApp QR code with a pre-filled message',
    keywords: [
      'whatsapp qr code generator',
      'qr code for whatsapp',
      'whatsapp click to chat qr',
      'prefilled whatsapp message qr',
    ],
    article: [
      {
        heading: 'How a WhatsApp QR starts a chat without saving your number',
        paragraphs: [
          'The code uses WhatsApp’s click-to-chat link: country code + number + an optional pre-filled message. The other person does not add you as a contact first. Their WhatsApp opens with your chat and the text already typed. They still tap Send — that is required so you cannot spam them by scan alone.',
          'In India this is how kiranas, brokers, tuition teachers, and clinics take inbound messages from a poster. A phone QR only dials. A vCard only saves. WhatsApp is the conversation.',
        ],
      },
      {
        heading: 'Write the pre-filled line so your inbox is sortable',
        paragraphs: [
          '“Hi” is useless at 200 scans a day. Use Hi, I want to order from the MG Road flyer or Property enquiry — Bannerughatta board. Your staff can see the source. Keep it under a sentence; people can edit before sending, and a speech feels pushy.',
          'Always include the country code (91 for India) without plus or spaces in the number field. Missing 91 is why WhatsApp QRs “don’t work” for people whose phone locale is not India.',
        ],
      },
    ],
    mistakes: [
      { title: 'Forgetting the country code', desc: '91 + 10 digits. Not a leading zero. Not the + in the number field if the form already expects digits.' },
      { title: 'Personal WhatsApp for a shop that never sleeps', desc: 'Use a business number you can hand to staff. Do not print your private chat on 2,000 flyers.' },
    ],
  },
  linkedin: {
    displayName: 'LinkedIn',
    howToTitle: 'How to create a LinkedIn QR code',
    keywords: ['linkedin qr code generator', 'qr code for linkedin', 'linkedin profile qr'],
    article: [
      {
        heading: 'Profile QR for humans, Company Page QR for brands',
        paragraphs: [
          'Recruiters scanning a CV want /in/yourname. A booth wants /company/yourco. LinkedIn’s in-app QR is a conference toy and a weak print file. Put an SVG from this page on the resume corner (2.5 cm) or the last slide of a talk, labelled Scan to connect on LinkedIn so it is not mistaken for a portfolio site.',
          'Need a number saved to Contacts? That is a [digital business card QR code](/vcard-qr-code-generator) (vCard), not LinkedIn. Print-size rules for a visiting card: [QR codes for business cards](/blog/qr-codes-for-business-cards-the-complete-guide).',
        ],
      },
    ],
  },
  telegram: {
    displayName: 'Telegram',
    howToTitle: 'How to create a Telegram QR code',
    keywords: ['telegram qr code generator', 'qr code for telegram channel', 'telegram group qr'],
    article: [
      {
        heading: 'Channel, group, or username — scams live in search',
        paragraphs: [
          'Crypto and trading crowds still join the wrong Telegram because search is full of clones. A QR with your t.me link (or the private invite) is the honest door. Label it Official Telegram so people know why they should not type the name instead.',
        ],
      },
    ],
  },
  snapchat: {
    displayName: 'Snapchat',
    howToTitle: 'How to create a Snapchat QR code',
    keywords: ['snapchat qr code generator', 'qr code for snapchat', 'snapcode alternative'],
    article: [
      {
        heading: 'Why a normal QR beats a yellow Snapcode on print',
        paragraphs: [
          'Snapcodes want the Snapchat camera. A standard QR on this page opens from the iPhone or Android camera, then hands off to Snapchat. That matters on a college fest banner where half the crowd will not open Snap first. You also get real print files instead of a yellow screenshot.',
        ],
      },
    ],
  },
  twitter: {
    displayName: 'X (Twitter)',
    howToTitle: 'How to create an X (Twitter) QR code',
    keywords: ['twitter qr code generator', 'x qr code', 'qr code for twitter profile'],
    article: [
      {
        heading: 'Profile follow vs a specific post',
        paragraphs: [
          'A handle QR is for “follow me after this talk”. A specific post or thread belongs in the URL generator with the full x.com/…/status/… link. Speakers should leave the profile QR on screen for 30 seconds; a flash at the end of the slide is how you get zero follows.',
        ],
      },
    ],
  },
  phone: {
    displayName: 'Phone',
    howToTitle: 'How to create a tap-to-call QR code',
    howToSteps: [
      { title: 'Enter the number with country code', desc: '+91 and the 10 digits for India. No spaces if the field strips them anyway — be consistent.' },
      { title: 'Generate and scan', desc: 'The dialer should open with the number filled. You still press Call. That is expected.' },
      { title: 'Label the print', desc: 'Scan to call {team}. People should know they are about to phone you, not open WhatsApp.' },
      { title: 'Download SVG for vans and boards', desc: 'Vehicle graphics need a vector file. PNG is for digital and small stickers.' },
    ],
    keywords: ['phone qr code generator', 'call qr code', 'tap to call qr', 'qr code for phone number'],
    article: [
      {
        heading: 'A phone QR opens the dialer — it does not place the call',
        paragraphs: [
          'The pattern stores a tel: number. The phone pre-fills the dialer; the human still presses Call. That is a safety rule, not a bug. Use it on vans, machinery, emergency posters, and direct-mail where a conversation beats a form.',
          'Always encode +countrycode. A 10-digit local number fails for roaming guests and for people whose SIM is not Indian. This is not a WhatsApp QR: if your customers only chat, use that page instead.',
        ],
      },
    ],
    mistakes: [
      { title: 'Encoding WhatsApp’s number as a phone QR', desc: 'They will call, not chat. Use the WhatsApp generator for click-to-chat.' },
      { title: 'No country code', desc: 'Start with +91 (or the right code) so the dialer can place the call from any SIM.' },
    ],
  },
  sms: {
    displayName: 'SMS',
    howToTitle: 'How to create an SMS QR with a pre-filled text',
    howToSteps: [
      { title: 'Enter destination and draft', desc: 'Number or shortcode, plus a keyword such as JOIN. Stay under 160 characters.' },
      { title: 'Generate and test Send', desc: 'Scan on a phone with SMS credit. Confirm the draft is right before a print run.' },
      { title: 'Check DLT / keyword routing', desc: 'If you use an Indian promotional shortcode, the keyword in the QR must match what your aggregator expects.' },
      { title: 'Print with a reason', desc: 'Scan to text JOIN for alerts — not a bare code.' },
    ],
    keywords: ['sms qr code generator', 'qr code for text message', 'prefilled sms qr'],
    article: [
      {
        heading: 'SMS QR for opt-ins, not for conversations you should have on WhatsApp',
        paragraphs: [
          'An SMS QR opens the native messages app with a number and a draft (JOIN, a keyword, a short question). The person hits send. Carriers still charge SMS; WhatsApp is free for most Indian users. Use SMS when you have a shortcode, a DLT-registered promotional flow, or an audience that is not on WhatsApp.',
          'Keep the draft under 160 characters. Test that the keyword actually hits your aggregator. Scanning does not send the message by itself.',
        ],
      },
    ],
  },
  email: {
    displayName: 'Email',
    howToTitle: 'How to create an email QR with subject and body',
    howToSteps: [
      { title: 'Fill address, subject, optional body', desc: 'A stable inbox such as support@, plus a subject your filters already understand.' },
      { title: 'Keep the body short', desc: 'Long templates make dense codes. Leave a prompt, not a form.' },
      { title: 'Scan on iPhone and Android', desc: 'Confirm the default mail app opens with the right To and Subject.' },
      { title: 'Download and label', desc: 'Scan to email warranty / feedback so people know it is mail, not a website.' },
    ],
    keywords: ['email qr code generator', 'mailto qr code', 'qr code for email'],
    article: [
      {
        heading: 'mailto: QRs pre-fill; they do not send',
        paragraphs: [
          'The code stores an email address, optional subject, and optional body. The default mail app opens with those fields filled. The person still taps send. That makes structured feedback (“Subject: Warranty — Mixer 1200W”) actually sortable in a shared inbox.',
          'Long bodies make dense codes. Prefer a short template plus “please describe the issue below”. Tablets without a mail app configured will look broken — have a web form URL as a backup on serious packaging.',
        ],
      },
    ],
  },
  'landing-page': {
    displayName: 'Landing page',
    howToTitle: 'How to build a landing-page QR',
    howToSteps: [
      { title: 'Build the mobile page', desc: 'Use the landing-page tab to add blocks, images, and buttons. Keep it one thumb-friendly column.' },
      { title: 'Generate the QR for that page', desc: 'The code points at a stable hosted URL you can edit later without reprinting.' },
      { title: 'Test on a phone', desc: 'Check load time, tap targets, and that forms submit. Desktop preview lies.' },
      { title: 'Print SVG with a CTA', desc: 'Scan for the menu / lookbook / event page — name the destination.' },
    ],
    keywords: ['landing page qr code', 'mobile landing page qr', 'link in bio qr'],
    article: [
      {
        heading: 'A landing-page QR is for content you do not want to put on a full website',
        paragraphs: [
          'Menus with photos, a link-in-bio hub, a property one-pager, an event handout — hosted on a fast mobile page you can edit without reprinting the code. That is the opposite of a static URL burned onto a flyer. If you only have one stable https link, the URL generator is enough. If you will change blocks, images, and buttons every week, build the page here and print the dynamic code once.',
          'Need a changeable QR code link after print? That job is an [editable QR code](/blog/what-is-an-editable-qr-code) — a dynamic short link, not a PNG you rewrite. This landing-page tool is one destination you can hang on that link.',
        ],
      },
    ],
  },
  menu: {
    displayName: 'Restaurant menu',
    howToTitle: 'How to create a restaurant menu QR code',
    howToSteps: [
      { title: 'Choose live menu or PDF', desc: 'Live page if prices move. Public PDF link if the card is stable. Do not photograph a laminated A3.' },
      { title: 'Paste the menu URL above', desc: 'Or point it at your QR Junction restaurant menu once that is published.' },
      { title: 'Scan from a 4G phone at table distance', desc: 'If photos crawl, compress them. Guests will not wait.' },
      { title: 'Print 4–5 cm table tents', desc: 'Matte stock, Scan for menu, plus a Wi-Fi QR if the photos need data.' },
    ],
    keywords: [
      'restaurant menu qr code',
      'digital menu qr code',
      'qr code for food menu',
      'menu qr code generator',
      'restaurant qr code menu',
      'cafe qr menu',
    ],
    article: [
      {
        heading: 'QR code for food menu',
        paragraphs: [
          'A QR code for a food menu is a table tent that opens today’s card on a phone. This restaurant menu QR code generator is that tool. Paste a live menu URL or a public PDF. Guests should not pinch-zoom a photographed A3.',
        ],
      },
      {
        heading: 'Digital menu QR code',
        paragraphs: [
          'A digital menu QR code should load in a few seconds on 4G. Compress photos. Hide 86’d dishes the same evening. If the PDF never moves, a static code is honest. If prices move, point a dynamic square at a page you can edit — same print, new card.',
        ],
      },
      {
        heading: 'PDF menu vs a live digital menu QR',
        paragraphs: [
          'Indian cafes still laminate a Canva PDF and encode the Drive link. That works until the chef 86s two dishes at 8 pm and the PDF still shows them. A live menu QR (this page, pointing at your hosted menu or our restaurant menus) can hide items, change prices, and show photos without a reprint.',
          'If your menu truly never moves, a PDF QR is honest and simple. If you run specials, veg filters, or multiple menus (lunch / bar / ramadan), use a live page. Do not make guests pinch-zoom a photographed A3.',
        ],
      },
      {
        heading: 'Table tents, counters, and WhatsApp-only kitchens',
        paragraphs: [
          'One code per table, 4–5 cm, Scan for menu, matte tent, plus a Wi-Fi QR if you expect them to use data-hungry photos. Cloud kitchens can print the same menu QR on the parcel. Drive-throughs that show the QR on a board need a huge code; people in the third car cannot scan a 2 cm sticker.',
        ],
      },
    ],
    mistakes: [
      { title: 'A photographed paper menu as a 20 MB PDF', desc: 'Slow, blurry, unsearchable. Export a real PDF or use a live menu.' },
      { title: 'One QR for dine-in and a dead item list', desc: 'Update the destination the same day you change the board.' },
    ],
  },
  youtube: {
    displayName: 'YouTube',
    howToTitle: 'How to create a YouTube QR code',
    howToSteps: [
      { title: 'Copy the channel, video, or playlist URL', desc: 'Channel for subscribe-the-brand. Watch URL for one tutorial. Add t= for a timestamp.' },
      { title: 'Paste and generate', desc: 'This page is YouTube-specific. Vimeo or MP4 belongs on the Video generator.' },
      { title: 'Scan with and without the YouTube app', desc: 'Confirm the clip or channel opens. Unlisted is fine; private is not.' },
      { title: 'Print with Scan to watch / subscribe', desc: 'Say which, so merch buyers are not surprised by a 20-minute vlog.' },
    ],
    keywords: ['youtube qr code generator', 'qr code for youtube channel', 'qr code for youtube video'],
    article: [
      {
        heading: 'Channel QR vs one video QR',
        paragraphs: [
          'This page is the YouTube-shaped door: channel, a video, or a playlist using YouTube URLs. If the clip lives on Vimeo or an MP4, use the Video generator instead. Creators printing merch usually want the channel. Appliance brands usually want one tutorial video — still a YouTube URL, but labelled Scan to watch setup, not Scan for our channel.',
        ],
      },
    ],
  },
};
