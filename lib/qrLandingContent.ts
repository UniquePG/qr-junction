import { TabType } from './qrEngine';
import {
  Link as LinkIcon,
  Type as TypeIcon,
  Instagram,
  Facebook,
  MessageCircle,
  Linkedin,
  Send,
  Ghost,
  X as XIcon,
  Contact as ContactIcon,
  Phone,
  MessageSquareText,
  Mail,
  Wifi,
  Smartphone,
  Layout,
  FileText,
  Utensils,
  Youtube
} from 'lucide-react';

export interface QRLandingContent {
  type: string;
  tabType: TabType;
  title: string;
  description: string;
  heroHeading: string;
  heroSubheading: string;
  fact: string;
  icon: any;
  useCases: { title: string; desc: string }[];
  benefits: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
}

export const qrLandingContent: Record<string, QRLandingContent> = {
  url: {
    type: 'url',
    tabType: 'url',
    title: 'Free URL QR Code Generator | Convert Links to QR Codes',
    description: 'Instantly convert any website URL into a scannable, high-quality QR code. Perfect for driving offline traffic to your online destinations, sharing digital portfolios, and tracking campaign engagement seamlessly without relying on manual link typing.',
    heroHeading: 'Convert Any URL to a High-Quality QR Code',
    heroSubheading: 'Bridge the gap between physical marketing and your digital presence. Drive instant traffic to your website, landing page, or online store with a simple, frictionless smartphone scan.',
    fact: 'Studies show that over 60% of modern consumers prefer scanning a QR code over manually typing a URL on their mobile devices, significantly reducing bounce rates and drop-offs during physical marketing campaigns.',
    icon: LinkIcon,
    useCases: [
      { title: 'Print Marketing Campaigns', desc: 'Add URL QR codes to flyers, posters, billboards, and direct mail to track offline to online conversions seamlessly. By turning static print materials into interactive portals, you can measure the exact ROI of your physical advertising.' },
      { title: 'Product Packaging & Inserts', desc: 'Link directly to digital user manuals, warranty registrations, or promotional up-sell offers from your product packaging. This reduces printing costs for bulky instruction booklets and keeps your customers engaged post-purchase.' },
      { title: 'Event Management & Networking', desc: 'Provide quick access to event schedules, speaker biographies, and feedback forms for attendees. Instead of handing out heavy brochures, give them a simple scan that keeps all their event resources right in their pocket.' }
    ],
    benefits: [
      { title: 'Instant Content Access', desc: 'Eliminates the friction of typing long, complex URLs, providing immediate access to your content. This frictionless experience drastically increases the likelihood that a user will actually visit your intended destination.' },
      { title: 'Trackable Campaign Performance', desc: 'Monitor scan rates, user locations, and peak interaction times to understand campaign effectiveness. This data allows marketers to pivot strategies in real-time based on actual user engagement.' },
      { title: 'Universal Device Compatibility', desc: 'Standard URL QR codes are natively supported by the built-in camera apps on all modern iOS and Android devices, requiring absolutely no third-party app installations for the user.' }
    ],
    faq: [
      { q: 'Do URL QR codes ever expire?', a: 'Static URL QR codes never expire because the destination link is permanently embedded in the pattern. If you use a dynamic URL QR code, it will remain active as long as your service subscription is active, allowing you to change the destination at any time.' },
      { q: 'Can I link to any type of website?', a: 'Yes, you can link to any valid HTTP or HTTPS website address. This includes social media profiles, Google Docs, Dropbox files, personal portfolios, and enterprise corporate websites.' },
      { q: 'How do I test to ensure my URL QR code works?', a: 'Simply open your smartphone\'s native camera app and point it at the generated QR code on your screen. A link bubble should appear; tapping it will verify that it opens the correct destination.' }
    ]
  },
  text: {
    type: 'text',
    tabType: 'text',
    title: 'Text QR Code Generator | Share Messages & Notes Offline',
    description: 'Create a highly secure QR code that displays plain text immediately when scanned, requiring zero internet connection. Perfect for sharing serial numbers, secret messages, inventory data, and offline operational instructions.',
    heroHeading: 'Share Plain Text Offline via QR Code',
    heroSubheading: 'Generate dynamic or static QR codes containing text, serial numbers, or operational notes that can be read instantaneously by any smartphone, completely independent of network availability or cellular service.',
    fact: 'Text QR codes are entirely self-contained. The data is stored directly within the geometric pattern itself, meaning absolute zero internet connectivity or cellular data is required to decode and read the message.',
    icon: TypeIcon,
    useCases: [
      { title: 'Warehouse & Inventory Management', desc: 'Store intricate serial numbers, SKU details, batch information, and manufacturing dates directly on the product label. Staff can quickly scan items in internet-dead zones inside large metal warehouses.' },
      { title: 'Offline Operational Instructions', desc: 'Provide quick assembly steps, safety protocols, or emergency shutdown procedures on heavy machinery without relying on Wi-Fi or cellular network availability during critical moments.' },
      { title: 'Gamification & Secret Messages', desc: 'Hide promotional codes, scavenger hunt clues, or exclusive event passwords in plain sight. This creates an engaging, interactive experience for customers participating in guerrilla marketing campaigns.' }
    ],
    benefits: [
      { title: '100% Offline Accessibility', desc: 'Because the text data is embedded into the image\'s pixels, users have immediate, 100% offline access to the embedded text data once scanned, making it foolproof in remote locations.' },
      { title: 'High Data Capacity', desc: 'Store up to 4,000 alphanumeric characters in a single dense QR code. This allows you to embed entire paragraphs of text, lists of ingredients, or comprehensive technical specifications.' },
      { title: 'Maximum Privacy & Security', desc: 'Since the scanning process happens entirely on the local device without querying a server, offline text QR codes offer an inherently private way to transmit localized data.' }
    ],
    faq: [
      { q: 'How many characters can I realistically put in a text QR code?', a: 'You can store roughly up to 4,000 characters. However, keep in mind that more text makes the QR code pattern physically denser. A denser code requires a higher quality printer and needs to be scanned from a closer distance.' },
      { q: 'Does it actually work without Wi-Fi or Cellular Data?', a: 'Absolutely. The text string is mathematically encoded directly into the black and white squares. The camera app simply translates the visual pattern back into text instantly without any network request.' },
      { q: 'Can I change the text later after I print it?', a: 'No, plain text QR codes are strictly static. The physical pattern is a direct translation of the text. To change the text, you must generate and print an entirely new QR code.' }
    ]
  },
  instagram: {
    type: 'instagram',
    tabType: 'instagram',
    title: 'Instagram QR Code Generator | Grow Your Followers Instantly',
    description: 'Create a stunning custom Instagram QR code to instantly connect users directly to your profile. Boost followers, maximize brand engagement, and drive offline traffic straight to your digital grid.',
    heroHeading: 'Turn Offline Audiences into Instagram Followers',
    heroSubheading: 'Generate a sleek, beautifully branded QR code that instantly deep-links to your Instagram profile in the native app, completely bypassing the clunky mobile browser experience.',
    fact: 'Instagram currently boasts over 2 billion active monthly users. Bridging physical touchpoints to your profile via QR codes is statistically the fastest way to grow a localized, highly-engaged organic following.',
    icon: Instagram,
    useCases: [
      { title: 'Retail Stores & Checkout Counters', desc: 'Place branded QR codes on checkout counters, receipts, or shopping bags to aggressively encourage customers to tag your business in their stories while their purchase is still fresh in their minds.' },
      { title: 'Networking & Business Cards', desc: 'Give networking contacts a frictionless, modern way to follow your personal brand, photography portfolio, or creative agency without awkwardly spelling out complex usernames.' },
      { title: 'Restaurant Menus & Table Tents', desc: 'Invite diners to view your mouth-watering grid photos and share their culinary experience on social media by placing codes directly on the tables or physical menus.' }
    ],
    benefits: [
      { title: 'Native App Deep Linking', desc: 'Our smart Instagram codes open directly inside the native Instagram app rather than a mobile web browser. This ensures users are already logged in and just one tap away from following you.' },
      { title: 'Frictionless Instant Growth', desc: 'Drastically reduces the friction of spelling out long usernames, handing out business cards, or asking users to manually type into the Instagram search bar.' },
      { title: 'Complete Brand Aesthetic Control', desc: 'Customize the QR code with your specific brand colors, gradients, and even embed your logo in the center to perfectly match your curated Instagram aesthetic.' }
    ],
    faq: [
      { q: 'Does this guarantee opening the actual Instagram app?', a: 'Yes! Our generator utilizes smart deep links to ensure that it triggers the device\'s operating system to open the native Instagram app if it is currently installed on the user\'s smartphone.' },
      { q: 'Can I link to a specific Reel or Post instead of my main profile?', a: 'For linking to specific Reels, IGTV videos, or posts, we highly recommend using the standard "URL" QR code type and simply pasting the direct link to that specific piece of content.' },
      { q: 'Do I need to paste my full Instagram URL?', a: 'No, our system makes it incredibly simple. Just enter your exact username (e.g., @yourbrand), and our engine handles the complex URL formatting and deep-linking automatically.' }
    ]
  },
  facebook: {
    type: 'facebook',
    tabType: 'facebook',
    title: 'Facebook QR Code Generator | Connect Instantly With Customers',
    description: 'Direct customers straight to your Facebook Business Page, Group, or Profile. Generate a highly reliable Facebook QR code to dramatically boost likes, reviews, and community engagement.',
    heroHeading: 'Boost Your Facebook Page Engagement & Likes',
    heroSubheading: 'Seamlessly connect your offline, real-world customers to your Facebook business page, private groups, or personal profile with a single, lightning-fast scan.',
    fact: 'Brick-and-mortar businesses that actively integrate physical QR codes into their social media strategies witness a 35% higher page engagement rate compared to those relying purely on digital ads.',
    icon: Facebook,
    useCases: [
      { title: 'Storefront Windows & Signage', desc: 'Encourage passing window shoppers to check out your page for authentic customer reviews, updated holiday hours, and upcoming promotional events even when your store is closed.' },
      { title: 'Event & Trade Show Booths', desc: 'Gain immediate likes and followers from trade show attendees who visit your booth. This turns a fleeting physical interaction into a long-term digital lead.' },
      { title: 'Product Inserts & Packaging', desc: 'Ask highly satisfied customers to leave a positive 5-star review on your Facebook page by seamlessly scanning the insert card tucked right inside their unboxing experience.' }
    ],
    benefits: [
      { title: 'Seamless Direct Connection', desc: 'Completely bypasses the clunky Facebook search bar, which often leads users to competitor pages or similarly named businesses, landing them directly on your intended page.' },
      { title: 'Increased Authentic Reviews', desc: 'Makes it incredibly simple and frictionless for customers to leave positive feedback on your business page immediately after a great in-store experience.' },
      { title: 'Powerful Community Building', desc: 'Easily invite physical customers to join your private VIP Facebook Groups to build a loyal, dedicated community around your brand or niche.' }
    ],
    faq: [
      { q: 'Can I use this to link to a private Facebook Group?', a: 'Yes! You can enter your specific Group ID or the full Group URL to direct users straight there, allowing them to instantly request to join the community.' },
      { q: 'Will this open the mobile browser or the Facebook app?', a: 'Most modern iOS and Android smartphones will recognize the link and prompt the user to open the destination directly within their natively installed Facebook app for the best experience.' },
      { q: 'Is generating a Facebook QR code free?', a: 'Absolutely. Generating, customizing, and downloading a static Facebook QR code is 100% free with zero hidden costs on our platform.' }
    ]
  },
  whatsapp: {
    type: 'whatsapp',
    tabType: 'whatsapp',
    title: 'WhatsApp QR Code Generator | Start Chats Instantly',
    description: 'Generate a smart WhatsApp QR code complete with a pre-filled, custom message. Let your customers start a chat with your business instantly without the hassle of saving your number.',
    heroHeading: 'Start WhatsApp Chats Instantly from Print',
    heroSubheading: 'Allow customers to message you immediately without the tedious hassle of saving your phone number into their address book first. Maximize your inbound lead generation.',
    fact: 'WhatsApp boasts a staggering open rate of 98%. Connecting your physical customers directly via a WhatsApp QR code ensures your marketing and support messages actually get seen and read.',
    icon: MessageCircle,
    useCases: [
      { title: 'Frictionless Customer Support', desc: 'Place these codes on product packaging or instruction manuals so customers can instantly chat with your support team the moment they run into an issue, drastically improving satisfaction.' },
      { title: 'Real Estate Signage & Flyers', desc: 'Let interested property buyers quickly message a real estate agent to request pricing or schedule a viewing directly from the physical "For Sale" sign on the front lawn.' },
      { title: 'Restaurant Takeout & Delivery', desc: 'Allow hungry customers to bypass third-party delivery apps and place their takeout orders directly via a WhatsApp chat, saving you massive commission fees.' }
    ],
    benefits: [
      { title: 'Pre-filled Icebreaker Messages', desc: 'Set up a highly specific default message (e.g., "Hi, I am interested in property 123...") to break the ice and provide instant context for your sales agents when a lead comes in.' },
      { title: 'Bypass Contact Saving', desc: 'Completely eliminates the incredibly tedious process of users needing to manually type and add you to their phone\'s address book before they can send their first message.' },
      { title: 'Dramatically Higher Conversions', desc: 'Direct, instant messaging on an app they already trust significantly reduces lead drop-off rates compared to directing users to clunky, slow-loading mobile web forms.' }
    ],
    faq: [
      { q: 'How does the pre-filled custom message work?', a: 'You define a custom message during generation. When the user scans the code, their WhatsApp app opens with your number and that exact text already typed into their chat box, waiting for them to hit send.' },
      { q: 'Do I really need to include the country code?', a: 'Yes, this is critical. Always include the full international country code (without the + symbol) to ensure the WhatsApp routing link works perfectly for users scanning globally.' },
      { q: 'Will this work for users on both iOS and Android?', a: 'Yes, WhatsApp deep-linking is universally supported and works flawlessly across all mobile operating systems that have the WhatsApp messenger installed.' }
    ]
  },
  linkedin: {
    type: 'linkedin',
    tabType: 'linkedin',
    title: 'LinkedIn QR Code Generator | Network Like a Pro',
    description: 'Generate a professional LinkedIn QR code to seamlessly share your profile or company page. The ultimate networking tool to modernize your business cards, resumes, and conference badges.',
    heroHeading: 'Modernize Your Professional Networking',
    heroSubheading: 'Instantly share your comprehensive LinkedIn profile, digital resume, or Company Page with a simple smartphone scan at your next major networking event or conference.',
    fact: 'Over 80% of B2B leads generated from social media channels originate from LinkedIn. Ensuring your offline contacts can find and connect with you instantly is crucial for career and business growth.',
    icon: Linkedin,
    useCases: [
      { title: 'Next-Generation Smart Resumes', desc: 'Add a professional QR code to the top of your printed CV so busy recruiters can instantly view your full work history, peer endorsements, and extensive portfolio with one tap.' },
      { title: 'High-Level Networking Events', desc: 'Replace outdated traditional business cards entirely. Simply have new connections scan your unique code directly from your phone screen to instantly connect on the platform.' },
      { title: 'Corporate Pitch Presentations', desc: 'Include a massive QR code on your final "Thank You" slide to allow the entire audience to connect with you effortlessly before they even leave their seats.' }
    ],
    benefits: [
      { title: 'Instant, Error-Free Connections', desc: 'Completely eliminates frustrating name-spelling errors and ensures the person connects with your exact profile, rather than someone else sharing your common name.' },
      { title: 'Versatile Dual Support', desc: 'Our engine is flexible—generate optimized codes for both individual personal profiles and massive corporate company pages depending on your specific marketing goal.' },
      { title: 'Sustainable & Eco-Friendly', desc: 'Dramatically reduces the need for printing thousands of expensive physical business cards that ultimately end up in the trash, boosting your green credentials.' }
    ],
    faq: [
      { q: 'Can I use this tool to link directly to my Company Page?', a: 'Yes, you can easily toggle the setting between a "Personal Profile" and a "Company Page" when generating the code to ensure the routing is handled correctly.' },
      { q: 'How do I find my exact LinkedIn username or slug?', a: 'Go to your LinkedIn profile and check the URL in your web browser. Your username is the exact text string located immediately after the "in/" or "company/" part of the link.' },
      { q: 'Will scanning this force the user to log in?', a: 'If they have the LinkedIn app installed on their phone, the OS will deep-link them directly into the app where they are already logged in. Otherwise, it will open the mobile browser.' }
    ]
  },
  telegram: {
    type: 'telegram',
    tabType: 'telegram',
    title: 'Telegram QR Code Generator | Join Channels & Chats Fast',
    description: 'Create a secure Telegram QR code to instantly add members to your broadcast channel, private group, or start a direct chat. The fastest, most secure way to build your community offline.',
    heroHeading: 'Explosively Grow Your Telegram Community',
    heroSubheading: 'Direct high-intent users to your personal secure chat, public community group, or high-volume broadcast channel with a single, frictionless scan.',
    fact: 'Telegram is recognized as one of the fastest-growing messaging apps globally, boasting over 800 million active users who prioritize privacy, speed, and massive group functionalities.',
    icon: Send,
    useCases: [
      { title: 'Crypto & Web3 Communities', desc: 'Invite highly-engaged attendees at blockchain conferences and tech events directly to your project\'s official Telegram group to prevent them from falling for phishing scams.' },
      { title: 'Rapid Customer Support', desc: 'Provide a highly secure, lightning-fast direct messaging channel for complex technical support queries or VIP client onboarding directly from physical marketing.' },
      { title: 'Mass Content Broadcasting', desc: 'Easily onboard new offline subscribers to your daily news briefings, financial deal alerts, or exclusive content channels by placing codes in high-traffic physical areas.' }
    ],
    benefits: [
      { title: 'Guaranteed Direct Access', desc: 'Safely bypasses the risky Telegram global search bar, strictly preventing your users from accidentally joining fake impersonator groups or malicious scam channels.' },
      { title: 'Complete Multi-Type Support', desc: 'Our smart routing logic works flawlessly for initiating direct personal messages, joining massive public group chats, and subscribing to one-way broadcast channels.' },
      { title: 'Highly Privacy Focused', desc: 'Allows deep, real-time connections and community building entirely via usernames, completely eliminating the need to share private cellular phone numbers.' }
    ],
    faq: [
      { q: 'Does this generator work for private, invite-only groups?', a: 'If you have generated a specific invite link for your private group from within Telegram, you can use our standard "URL" QR code type and paste that exact link.' },
      { q: 'Where do I find my exact Telegram username?', a: 'Open your Telegram app Settings, navigate to "Edit Profile", and you will find your designated username (which usually begins with the @ symbol) located right there.' },
      { q: 'Do users absolutely need the Telegram app installed?', a: 'Yes. Upon scanning, their device will prompt them to open the chat if they have the app, or redirect them to the App Store to download Telegram if they do not.' }
    ]
  },
  snapchat: {
    type: 'snapchat',
    tabType: 'snapchat',
    title: 'Snapchat QR Code Generator | Gain Friends Instantly',
    description: 'Share your Snapchat username via a highly-customizable QR code. This is definitively the fastest, most effective way to gain massive new friends and followers for your daily Snap stories.',
    heroHeading: 'Add Friends on Snapchat Instantly via Scan',
    heroSubheading: 'Make it incredibly easy and highly frictionless for people to add you on Snapchat without the frustration of typing out your exact, complex username.',
    fact: 'The average active Snapchat user opens the application over 30 times a day. Getting users to add you directly creates an incredibly high-frequency, intimate engagement channel for your brand.',
    icon: Ghost,
    useCases: [
      { title: 'Cross-Platform Influencer Marketing', desc: 'Prominently display your Snap code at the end of your YouTube videos or as an Instagram post to aggressively cross-pollinate your audience to your more intimate daily stories.' },
      { title: 'Experiential Retail Activations', desc: 'Encourage in-store physical visitors to unlock exclusive Snapchat AR filters, geographic lenses, or flash-sale deals by scanning the code at the entrance.' },
      { title: 'College & Campus Events', desc: 'This is the easiest, most frictionless way to instantly connect with massive groups of new friends at fast-paced college parties, frat events, and university orientations.' }
    ],
    benefits: [
      { title: 'Eliminates Misspellings Completely', desc: 'Snapchat usernames can often be highly complex with numbers and underscores; scanning a code entirely eliminates the chance of frustrating spelling errors.' },
      { title: 'Flawless Native App Opening', desc: 'The generated code utilizes deep-linking technology to jump directly into the "Add Friend" confirmation screen natively within the Snapchat application itself.' },
      { title: 'Unmatched Youth Engagement', desc: 'This is universally recognized as the perfect marketing tool for modern brands aggressively targeting the highly lucrative Gen Z and young Millennial demographics.' }
    ],
    faq: [
      { q: 'Is this the exact same thing as a yellow Snapcode?', a: 'No, this generates a standardized, highly customizable QR code that links to your profile. Unlike a Snapcode, it can be scanned by any generic camera app on any phone, not just the Snapchat camera.' },
      { q: 'Do I need to find my full Snapchat profile URL?', a: 'No, our system is built for simplicity. Just your exact Snapchat username is required, and we handle the complex link generation behind the scenes.' },
      { q: 'Does this generated code ever expire?', a: 'No, as long as your Snapchat account remains active and the username doesn\'t change, the physical QR code will continue to work permanently.' }
    ]
  },
  twitter: {
    type: 'twitter',
    tabType: 'twitter',
    title: 'X (Twitter) QR Code Generator | Grow Your Global Audience',
    description: 'Generate an ultra-fast X (formerly Twitter) QR code to instantly boost your real-time followers and drive high-intent engagement directly from physical locations to your digital feed.',
    heroHeading: 'Amplify Your Voice on X (formerly Twitter)',
    heroSubheading: 'Transform fleeting real-world interactions into permanent digital followers. Share your X profile with a simple scan and join the global conversation instantly.',
    fact: 'Data shows that physical marketing materials that bridge the offline gap to X (Twitter) drive exceptionally high-intent followers who are 40% more likely to engage with your future posts.',
    icon: XIcon,
    useCases: [
      { title: 'Conferences & Keynote Speeches', desc: 'Public speakers can display their massive QR code on the main projector screen to passively gain hundreds of highly targeted followers during their live presentation.' },
      { title: 'Live Sporting & Music Events', desc: 'Encourage stadium fans to instantly join the live online conversation, share their seat photos, and aggressively utilize the official event hashtags.' },
      { title: 'Author Book Tours & Signings', desc: 'Allow passionate readers to instantly follow the author for future book release updates, intellectual discussions, and behind-the-scenes writing insights.' }
    ],
    benefits: [
      { title: 'Instantaneous Follow Action', desc: 'Scanning the code ensures that users are only one single, frictionless tap away from hitting the "Follow" button on your profile.' },
      { title: 'Premium Brand Visibility', desc: 'A custom branded QR code featuring your brand colors and logo looks significantly more professional on printed media than just writing out your @handle.' },
      { title: 'Real-Time Immediate Engagement', desc: 'Connects your offline, physical users directly to your most up-to-date thoughts, company announcements, and breaking news feeds instantly.' }
    ],
    faq: [
      { q: 'Can I use this tool to link to a very specific Tweet?', a: 'For linking to specific, high-performing tweets or threads, we recommend using our standard "URL" generator and simply pasting the direct link to that exact tweet.' },
      { q: 'What exact information do I need to provide?', a: 'We\'ve made it incredibly simple: just type in your exact X/Twitter handle (you can leave out the @ symbol, we will format it perfectly for you).' },
      { q: 'Will scanning this automatically open the X application?', a: 'Yes, if the scanning user currently has the native X app installed on their device, their operating system will automatically route the link to open inside the app.' }
    ]
  },
  vcard: {
    type: 'vcard',
    tabType: 'contact',
    title: 'vCard QR Code Generator | Digital Smart Business Cards',
    description: 'Create a dense vCard QR code to instantly share your entire professional contact portfolio. Users can securely save your name, direct phone, work email, and office address directly to their phonebook with one tap.',
    heroHeading: 'Share Your Full Contact Details Instantly',
    heroSubheading: 'Generate a highly reliable vCard QR code. When scanned, it immediately prompts the user to save all your comprehensive contact information directly to their native phonebook.',
    fact: 'Industry statistics show that 88% of traditional physical business cards are thrown away or lost within a week. Digital vCard QR codes guarantee your details actually make it safely into their phone.',
    icon: ContactIcon,
    useCases: [
      { title: 'Modernizing Physical Business Cards', desc: 'Print this code clearly on your physical cards so people can digitize your details instantaneously without ever needing to manually type in a single letter.' },
      { title: 'Real Estate Agents & Brokers', desc: 'Place these codes prominently on open house brochures to ensure highly-motivated potential buyers save your direct line immediately before leaving the property.' },
      { title: 'Corporate Conference Badges', desc: 'Allow other busy attendees to quickly scan and save your contact info while actively networking on the floor, saving massive amounts of time.' }
    ],
    benefits: [
      { title: 'Zero Typing Friction', desc: 'Completely eliminates the incredibly tedious, error-prone process of manually typing complex names, international numbers, and long corporate emails.' },
      { title: 'Comprehensive Data Payload', desc: 'Store your full name, job title, direct phone line, email, physical address, and company website all seamlessly consolidated in one single scan.' },
      { title: '100% Offline Compatible', desc: 'The entirety of the vCard data is mathematically embedded directly within the QR image itself, requiring absolutely no internet connection for the user to save your info.' }
    ],
    faq: [
      { q: 'Does this technology work on both iPhone and Android devices?', a: 'Yes, absolutely! Both modern iOS and Android operating systems natively support reading and saving vCard data directly from their built-in stock camera apps.' },
      { q: 'Do users need an active internet connection to scan and save it?', a: 'No, they do not. The contact information is stored entirely offline directly within the QR geometric pattern, making it highly reliable in deep conference halls.' },
      { q: 'Can I embed a profile picture into the vCard data?', a: 'Standard offline vCards do not support high-res images well due to strict data limits in the QR pattern. For rich images, we highly recommend using a "Landing Page" QR code.' }
    ]
  },
  phone: {
    type: 'phone',
    tabType: 'phone',
    title: 'Phone Call QR Code Generator | Instant Tap-to-Call',
    description: 'Create a highly actionable QR code that immediately initiates a phone call when scanned. Perfect for aggressive direct response marketing and providing immediate, frictionless customer support.',
    heroHeading: 'Enable Instant Tap-to-Call Functionality',
    heroSubheading: 'Generate an action-oriented QR code that instantly opens the scanning user\'s native phone dialer with your specific business number pre-filled and ready to dial.',
    fact: 'Data proves that inbound phone calls convert at a staggering 10x to 15x higher rate than standard web form leads. Making it incredibly easy to call you is crucial for closing high-ticket sales.',
    icon: Phone,
    useCases: [
      { title: 'Public Emergency Services', desc: 'Provide immediate, life-saving access to critical hotlines on heavy safety equipment, public transport signage, or municipal alert boards.' },
      { title: 'Local Service Vehicles', desc: 'Place massively scaled codes on plumbers\', electricians\', or HVAC vans so neighbors in the community can quickly call for emergency service while stuck in traffic.' },
      { title: 'Aggressive Direct Mail Ads', desc: 'Dramatically increase the inbound response rates on physical flyers by offering a completely frictionless, one-tap way for prospects to call your sales team.' }
    ],
    benefits: [
      { title: 'Immediate High-Intent Action', desc: 'This is universally the fastest possible way to transition a potential customer from viewing a physical advertisement directly to speaking with a human representative.' },
      { title: '100% Error-Free Dialing', desc: 'Strictly prevents customers from misdialing complex, long, or international phone numbers, ensuring every single lead reaches the right destination.' },
      { title: 'High Intent Qualification', desc: 'Users who take the physical effort to pull out their phone, scan the code, and hit call are historically highly motivated buyers ready to make a purchase.' }
    ],
    faq: [
      { q: 'Does scanning the code automatically dial the number without asking?', a: 'No. For user security and to prevent accidental dials, smartphones will pre-fill the dialer app, but the user must still explicitly press the green "Call" button to initiate the connection.' },
      { q: 'Should I absolutely include the international country code?', a: 'Yes, we highly recommend always including the + symbol and the country code. This guarantees the call will route correctly regardless of where the user\'s phone is registered.' },
      { q: 'What happens if a user scans this on an iPad or tablet?', a: 'It will work flawlessly on cellular-enabled tablets. On Wi-Fi only devices, it may trigger default calling apps like FaceTime Audio or Skype depending on the user\'s specific device settings.' }
    ]
  },
  sms: {
    type: 'sms',
    tabType: 'sms',
    title: 'SMS QR Code Generator | Trigger Pre-filled Texts',
    description: 'Generate a smart SMS QR code that seamlessly opens the user\'s messaging app with a pre-filled phone number and custom text message. The ultimate tool for marketing opt-ins and instant inquiries.',
    heroHeading: 'Trigger Instant SMS Messages from Print',
    heroSubheading: 'Create an intelligent QR code that pre-fills a highly specific text message directed to your business number. Ideal for rapid SMS marketing opt-ins, contest entries, and quick customer inquiries.',
    fact: 'SMS marketing boasts an absolutely astounding 98% open rate, with upwards of 90% of all messages being read by the recipient within the first 3 minutes of delivery.',
    icon: MessageSquareText,
    useCases: [
      { title: 'Database Marketing Opt-ins', desc: 'Ask retail customers to scan the code and send a completely pre-filled "JOIN" message to effortlessly subscribe to your VIP promotional discount list.' },
      { title: 'Giveaway & Contest Entries', desc: 'Make it incredibly fast and easy for users to text a specific keyword to a designated shortcode to securely enter a high-value brand giveaway.' },
      { title: 'Instant Quick Support', desc: 'Allow busy customers to text your support team a quick question directly from your product packaging without needing to log into a complicated web portal.' }
    ],
    benefits: [
      { title: 'Pre-written Contextual Data', desc: 'You retain absolute control over the exact message text the user sends, making automated keyword processing and sorting on your backend infrastructure completely flawless.' },
      { title: 'Completely Frictionless Opt-in', desc: 'Users no longer have to struggle to remember complex shortcodes or specific keywords seen on a passing billboard; the scan handles everything instantly.' },
      { title: 'Unmatched High Engagement', desc: 'Creates a seamless, physical bridge directly into one of the absolute highest-converting and most intimate marketing channels available to brands today.' }
    ],
    faq: [
      { q: 'Does scanning the code send the text message automatically?', a: 'No, for strict user safety and anti-spam reasons, the user\'s native SMS app will simply open with the details pre-filled. They must still manually press the "Send" button.' },
      { q: 'Can I use a commercial 5-digit shortcode instead of a full number?', a: 'Yes, absolutely. Our system allows you to enter any valid international phone number or commercial SMS shortcode (e.g., 55522) as the destination.' },
      { q: 'Is there a strict character limit for the pre-filled message?', a: 'While our generator allows a significant amount of text, we strongly recommend keeping the pre-filled message well under 160 characters to ensure perfect compatibility across all carrier networks.' }
    ]
  },
  email: {
    type: 'email',
    tabType: 'email',
    title: 'Email QR Code Generator | Trigger Pre-filled Emails',
    description: 'Generate a highly sophisticated Email QR code that automatically opens the user\'s preferred email client with a pre-filled destination address, specific subject line, and detailed body text.',
    heroHeading: 'Enable Seamless Email Communication',
    heroSubheading: 'Make it completely effortless for physical customers to send you a detailed email with complex, predefined subject lines and structured message bodies instantly.',
    fact: 'UX research shows that providing a pre-filled email template increases customer response rates by over 40% by drastically reducing the cognitive load required to write a message from scratch.',
    icon: Mail,
    useCases: [
      { title: 'Structured Customer Feedback', desc: 'Pre-fill the subject line with "Product Feedback - Model X" to easily filter and sort incoming product reviews directly in your customer support inbox.' },
      { title: 'Detailed Quote Requests', desc: 'Provide a structured template for B2B clients to request highly specific pricing details directly from a physical sales brochure handed out at a trade show.' },
      { title: 'Streamlined Event RSVPs', desc: 'Make RSVPing to an event as incredibly simple as scanning a code on a beautiful physical invitation and hitting send on a pre-written acceptance email.' }
    ],
    benefits: [
      { title: 'Guaranteed Structured Data', desc: 'Ensure you always get the exact, specific information you need from the customer by pre-formatting the email body with questions or required fields.' },
      { title: 'Automated Inbox Routing', desc: 'Utilize highly specific subject lines to flawlessly trigger automatic routing rules and tagging within your Zendesk, Intercom, or corporate support inbox.' },
      { title: 'Zero Typo Guarantee', desc: 'Absolutely guarantees the customer never miswrites or misspells your incredibly complex corporate business email address when trying to contact you.' }
    ],
    faq: [
      { q: 'Which exact email application does this QR code open?', a: 'It utilizes deep-linking to automatically open the default mail client that is configured on the user\'s specific device (e.g., Apple Mail on iOS, Gmail on Android).' },
      { q: 'Can I leave the subject or body completely blank?', a: 'Yes, absolutely! You can choose to fill out just the destination email address, or add the specific subject and body text only as needed for your specific use case.' },
      { q: 'Are there any length limits I should be aware of?', a: 'Extremely long body text will result in a visually very dense QR code that can be difficult for older cameras to scan quickly, so we highly recommend keeping the template concise.' }
    ]
  },
  wifi: {
    type: 'wifi',
    tabType: 'wifi',
    title: 'WiFi QR Code Generator | Connect Instantly Without Passwords',
    description: 'Create a secure, highly-reliable WiFi QR code to let guests connect to your network instantly. Completely eliminate the frustration of typing long, complex, case-sensitive passwords forever!',
    heroHeading: 'Provide Instant WiFi Access via QR Code',
    heroSubheading: 'Generate a highly secure QR code that connects your guests, café customers, or office visitors to your WiFi network instantaneously without ever forcing them to type a password manually.',
    fact: 'Usability studies show the average person spends over 2 frustrating minutes trying to correctly type in a complex, secure WiFi password. A simple QR code reduces this entire process to literally 2 seconds.',
    icon: Wifi,
    useCases: [
      { title: 'Cafes, Coffee Shops & Restaurants', desc: 'Place these branded codes on tables or print them dynamically on receipts to provide an incredibly seamless, premium internet access experience for your paying patrons.' },
      { title: 'Corporate Offices & Co-working Spaces', desc: 'Allow visiting VIP clients, freelancers, and short-term contractors to securely and rapidly join the isolated guest network without bothering the IT department.' },
      { title: 'Airbnbs, VRBOs & Boutique Hotels', desc: 'Welcome your tired travelers with an incredibly easy-to-scan code placed prominently right on the nightstand or directly inside the welcome binder upon arrival.' }
    ],
    benefits: [
      { title: 'Dramatically Enhanced Security', desc: 'Guests connect to the network instantly without you ever having to reveal or write down the actual complex plaintext password on a whiteboard for everyone to see.' },
      { title: 'Zero Typing Friction', desc: 'Completely eliminates user errors and frustration from trying to distinguish between uppercase letters, lowercase letters, and complex special characters on mobile keyboards.' },
      { title: 'Premium Hospitality Experience', desc: 'Provides a highly modern, frictionless, and hospitable technological experience for absolutely anyone visiting your physical location, elevating your brand perception.' }
    ],
    faq: [
      { q: 'Is it actually safe to share my private WiFi network this way?', a: 'Yes, it is exactly as safe as handing them a piece of paper with the password written on it, but significantly more convenient and less prone to being copied by shoulder-surfers.' },
      { q: 'Does this technology still work for Hidden networks?', a: 'Yes, absolutely! Just ensure you explicitly check the "Hidden Network" option when generating the code so the smartphone knows exactly how to search for the SSID.' },
      { q: 'What specific encryption type should I choose?', a: 'WPA/WPA2 is the modern, highly secure standard for almost all consumer home and enterprise business networks deployed today. Only select WEP if you are using legacy hardware.' }
    ]
  },
  "app-store": {
    type: 'app-store',
    tabType: 'app_download',
    title: 'App Store QR Code Generator | Drive Massive App Installs',
    description: 'Generate one single, highly-intelligent QR code that smartly routes users to either the Apple App Store or Google Play Store based on their specific device. Radically boost your offline app downloads!',
    heroHeading: 'One Single QR Code, Multiple App Stores',
    heroSubheading: 'Drive massive app installations seamlessly from print. Our intelligent QR code instantly detects the user\'s operating system and routes them directly to the correct app store with zero friction.',
    fact: 'Utilizing Smart App Store QR codes on physical media can increase offline-to-digital app download conversion rates by up to 40% simply by eliminating platform confusion and extra clicks.',
    icon: Smartphone,
    useCases: [
      { title: 'In-Store Retail Promotions', desc: 'Aggressively encourage physical shoppers to download your lucrative digital loyalty app right at the checkout counter to unlock an immediate discount on their current purchase.' },
      { title: 'Out of Home (OOH) Advertising', desc: 'Place massive codes on subway ads, bus stops, and billboards to capture high-intent users looking for entertainment or utility during their daily physical commute.' },
      { title: 'Smart Product Packaging', desc: 'Direct users immediately to download your specific companion app which is required to set up and configure their brand new smart IoT device right out of the box.' }
    ],
    benefits: [
      { title: 'Intelligent Device Detection', desc: 'The routing link automatically detects the OS, flawlessly routing iOS users to the Apple App Store, and Android users directly to the Google Play Store in milliseconds.' },
      { title: 'Saves Massive Print Space', desc: 'Allows you to print one single, clean QR code on your highly constrained marketing materials instead of cluttering the design with two separate, confusing codes.' },
      { title: 'Secure Fallback URL', desc: 'Provides a completely safe fallback website redirection for users who accidentally scan the code from unsupported desktop webcams or obscure operating systems.' }
    ],
    faq: [
      { q: 'How exactly does the device detection technology work?', a: 'We generate a smart cloud link. When scanned, our lightning-fast server checks the user\'s mobile OS User-Agent header, then instantly redirects them to the appropriate store URL.' },
      { q: 'What happens if they scan the code on a laptop or desktop computer?', a: 'The system will intelligently recognize it is not a mobile device and redirect them to the "Fallback URL" you provided, which is typically your website\'s main homepage or a dedicated desktop landing page.' },
      { q: 'Can I track the exact number of app downloads generated?', a: 'While our platform provides highly detailed analytics on the number of physical scans, you will need to cross-reference with your Apple/Google App Store analytics to track the final installation conversions.' }
    ]
  },
  "landing-page": {
    type: 'landing-page',
    tabType: 'landing_page',
    title: 'Landing Page QR Code Generator | Build Custom Mobile Pages',
    description: 'Create a stunning, highly-customized mobile-friendly landing page and link it directly to a dynamic QR code. The absolute perfect solution for mobile menus, link-in-bio hubs, and interactive digital portfolios.',
    heroHeading: 'Build & Link Beautiful Custom Mobile Pages',
    heroSubheading: 'Design incredibly beautiful, fully mobile-optimized landing pages hosted entirely on our fast servers, instantly accessible globally via your highly customized dynamic QR code.',
    fact: 'Data proves that QR codes linked specifically to mobile-optimized, fast-loading landing pages boast a bounce rate that is 25% lower than those linking to traditional, clunky desktop-first websites.',
    icon: Layout,
    useCases: [
      { title: 'Interactive Digital Menus', desc: 'Create a stunning, highly interactive digital menu complete with high-res photos for your restaurant without needing to hire a developer to build your own expensive website.' },
      { title: 'Comprehensive Link-in-Bio', desc: 'Build a beautiful central hub that elegantly connects all your disparate social profiles, latest YouTube videos, and featured blog articles into one single, scannable destination.' },
      { title: 'Real Estate Property Showcases', desc: 'Showcase massive high-res property photos, virtual video tours, and agent contact details directly to highly-motivated buyers standing physically outside the home.' }
    ],
    benefits: [
      { title: 'Absolutely No Coding Required', desc: 'Utilize our incredibly simple, intuitive drag-and-drop builder to create highly professional, beautiful mobile pages in literally minutes, regardless of your technical skill.' },
      { title: 'Fully Dynamic & Updatable', desc: 'Instantly update the content, images, and links on your landing page at any time without ever needing to reprint the physical QR codes deployed in the real world.' },
      { title: 'All-in-One Hosted Solution', desc: 'We securely host the fast-loading page and the dynamic QR code routing infrastructure, saving you expensive monthly web hosting fees and massive technical headaches.' }
    ],
    faq: [
      { q: 'Can I really edit the page content after I have already printed the QR code?', a: 'Yes, absolutely! Because the generated QR code is fundamentally dynamic, it points to a constant routing URL. You can drastically change the landing page content anytime on our platform.' },
      { q: 'Do I need to own my own domain name or website to use this?', a: 'Not at all. We fully host the landing page for you on our lightning-fast, secure infrastructure, providing you with a complete end-to-end solution immediately.' },
      { q: 'Can I add rich media like images, galleries, and videos?', a: 'Yes, our powerful landing page builder natively supports a wide array of rich media elements including high-res image galleries, embedded YouTube videos, and custom call-to-action buttons.' }
    ]
  },
  pdf: {
    type: 'pdf',
    tabType: 'url',
    title: 'PDF QR Code Generator | Share Heavy Documents Instantly',
    description: 'Seamlessly convert any heavy PDF file into a lightning-fast, scannable QR code. The absolute perfect solution for instantly sharing digital menus, massive user manuals, corporate whitepapers, and annual reports.',
    heroHeading: 'Share Massive PDF Documents Instantly',
    heroSubheading: 'Turn incredibly heavy, multi-page PDF files into a remarkably simple, highly scannable QR code. Perfect for replacing physical restaurant menus, appliance manuals, and corporate reports.',
    fact: 'Transitioning to sharing PDFs via QR code dramatically reduces paper waste and slashes physical printing costs by up to 80% for large restaurants, hotels, and corporate event organizers annually.',
    icon: FileText,
    useCases: [
      { title: 'Touchless Restaurant Menus', desc: 'Provide an incredibly hygienic, modern touchless dining experience by linking customers directly to a beautifully formatted PDF version of your extensive food and drink menu.' },
      { title: 'Appliance User Manuals', desc: 'Stick a highly durable QR code directly on heavy appliances so frustrated customers can instantly pull up the massive PDF instruction guide without tearing apart their house looking for the booklet.' },
      { title: 'Academic & Educational Materials', desc: 'University professors and teachers can instantly share massive course syllabuses, required reading materials, and lecture slides quickly with hundreds of students in a lecture hall.' }
    ],
    benefits: [
      { title: 'Highly Sustainable & Eco-Friendly', desc: 'Save massive amounts of money and hundreds of trees by digitizing your heavy printed documents, drastically improving your company\'s environmental sustainability metrics.' },
      { title: 'Always 100% Up-to-Date', desc: 'By linking to a cloud-hosted PDF, you can silently update the document behind the scenes correcting typos or prices without ever changing the physical QR code printed on the wall.' },
      { title: 'Instantaneous Mobile Viewing', desc: 'Modern iOS and Android smartphones feature highly optimized, built-in PDF viewers that natively render the document instantly right in the browser after scanning, ensuring a flawless UX.' }
    ],
    faq: [
      { q: 'How exactly do I upload the PDF to make this work?', a: 'Simply upload your heavy PDF file to any reliable cloud storage provider like Google Drive, Dropbox, or AWS. Ensure the link privacy is set to "Public", and paste that URL into our generator.' },
      { q: 'Can the users actually download the PDF to their phone to read later?', a: 'Yes! Once the PDF file natively opens in their mobile browser after scanning, they will always have the standard OS option to save it permanently to their device\'s local storage.' },
      { q: 'Will this technology work smoothly on much older smartphones?', a: 'Yes, absolutely all modern and even legacy mobile browsers have incredibly robust, built-in PDF rendering engines that handle standard PDF files with ease.' }
    ]
  },
  menu: {
    type: 'menu',
    tabType: 'url',
    title: 'Menu QR Code Generator | Create Touchless Digital Menus',
    description: 'Instantly create a lightning-fast digital menu QR code for your restaurant, bar, or cafe. Provide an incredibly hygienic, contactless, and modern ordering experience that your dining customers will absolutely love.',
    heroHeading: 'Deploy Modern Touchless Digital Menus',
    heroSubheading: 'Rapidly modernize your restaurant\'s dining experience by allowing guests to easily scan and view your extensive menu instantly in high resolution directly on their personal smartphones.',
    fact: 'Data confirms that modern restaurants actively utilizing digital QR code menus report up to a 15% increase in average order value. This is driven by easier browsing and the ability to display high-quality, mouth-watering imagery.',
    icon: Utensils,
    useCases: [
      { title: 'High-Traffic Table Tents', desc: 'Place highly durable codes firmly on every single table so guests can immediately begin browsing drinks and appetizers the second they sit down, completely eliminating waiter wait times.' },
      { title: 'Fast-Food Drive-Thrus', desc: 'Dramatically speed up your ordering queue by letting cars much further back in line view the complete menu early, ensuring they are totally ready to order when they reach the speaker.' },
      { title: 'Luxury Hotel Room Service', desc: 'Boutique hotels can permanently replace dirty, outdated paper menus with a sleek, branded QR code beautifully printed on the nightstand or directly on the TV welcome screen.' }
    ],
    benefits: [
      { title: 'Incredibly Hygienic Dining', desc: 'Completely eliminates the massive operational headache of requiring your busy waitstaff to meticulously sanitize physical, sticky menus between every single seating during rush hour.' },
      { title: 'Massive Cost Savings', desc: 'Never pay exorbitant fees for expensive menu reprints ever again just because ingredient prices changed, dishes were removed, or a minor typo was discovered.' },
      { title: 'Highly Dynamic Upselling', desc: 'Link the code directly to rich, interactive digital menus that aggressively highlight highly-profitable daily specials and high-margin add-ons with stunning photography.' }
    ],
    faq: [
      { q: 'Do I absolutely need to use a special, proprietary menu format?', a: 'No, not at all! You can incredibly simply upload your existing, beautifully designed PDF menu to a public cloud drive and use that exact URL to generate your code instantly.' },
      { q: 'Can I change or update the menu items daily or weekly?', a: 'Yes! If you actively use a dynamic link, or if you simply overwrite the file at the exact same cloud URL, the physical QR code printed on your tables will remain perfectly functional.' },
      { q: 'Can my customers actually place orders and pay through it?', a: 'If you choose to link the QR code directly to your existing online ordering and POS system web URL rather than just a static PDF, then yes, they absolutely can!' }
    ]
  },
  youtube: {
    type: 'youtube',
    tabType: 'url',
    title: 'YouTube QR Code Generator | Instantly Share High-Res Videos',
    description: 'Generate an aggressive YouTube QR code to instantly share specific viral videos or your entire creator channel. Drive massive views, high engagement, and new subscribers directly from physical marketing channels.',
    heroHeading: 'Drive Instant, High-Intent Views to Your Videos',
    heroSubheading: 'Link static physical objects directly to your high-quality YouTube videos, educational tutorials, or massive channel page to drastically boost your digital engagement and subscriber count.',
    fact: 'Marketing studies prove that viewers retain an incredible 95% of a brand\'s message when they watch it in a high-quality video format, compared to a mere 10% when reading it in standard text.',
    icon: Youtube,
    useCases: [
      { title: 'Complex Product Tutorials', desc: 'Link directly to a comprehensive, high-definition how-to video straight from the physical product packaging to drastically reduce frustrating customer support calls and returns.' },
      { title: 'Immersive Real Estate Tours', desc: 'Allow busy house hunters to immediately take a stunning, 4K virtual video tour of the property by simply scanning the physical flyer they picked up at the open house.' },
      { title: 'Band & Artist Merchandise', desc: 'Independent musicians and creators can link their physical tour t-shirts, vinyl records, or posters directly to their latest big-budget music video or behind-the-scenes vlog.' }
    ],
    benefits: [
      { title: 'Flawless Native App Playback', desc: 'Smart routing ensures the link opens the video directly within the highly-optimized native YouTube app for a premium, uninterrupted viewing experience rather than a clunky mobile browser.' },
      { title: 'Dramatically Increased Subscribers', desc: 'Drive highly engaged, offline real-world audiences to your channel where they are far more likely to hit the subscribe button and become long-term, loyal viewers.' },
      { title: 'Incredibly Easy Sharing', desc: 'Completely bypasses the notoriously impossible task of asking users to manually type out long, random, case-sensitive YouTube video IDs into their mobile browsers.' }
    ],
    faq: [
      { q: 'Can I specifically link to a certain timestamp in the middle of the video?', a: 'Yes, absolutely! Just manually add "?t=XmYs" (e.g., ?t=2m30s) to the very end of your YouTube URL before pasting it into our generator.' },
      { q: 'Does this code guarantee opening the actual YouTube app?', a: 'Yes, modern iOS and Android smartphones are incredibly smart and will automatically route the generated link to open flawlessly within the YouTube app if it is currently installed.' },
      { q: 'Can I link to a full, multi-video playlist instead of just one video?', a: 'Absolutely, our system fully supports playlists! Just navigate to the playlist on YouTube, copy the share URL, and paste it directly into our generator.' }
    ]
  }
};
