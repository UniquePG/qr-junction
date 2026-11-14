import type { MenuLocaleCode } from "./locales";

export type GuestUiKey =
  | "searchPlaceholder"
  | "clearSearch"
  | "filterAll"
  | "filterVeg"
  | "filterNonVeg"
  | "filterBestsellers"
  | "emptyTitle"
  | "emptyBody"
  | "dishDescription"
  | "choosePortion"
  | "vegan"
  | "viewingMenu"
  | "diningTable"
  | "taxNote"
  | "poweredBy"
  | "language"
  | "yourPlate"
  | "yourOrders"
  | "sendKitchen"
  | "subtotal"
  | "total"
  | "notePlaceholder"
  | "emptyPlate"
  | "stepSent"
  | "stepAccepted"
  | "stepCooking"
  | "stepOnTheWay"
  | "stepAtTable"
  | "add"
  | "statusPlaced"
  | "statusAccepted"
  | "statusPreparing"
  | "statusReady"
  | "statusServed"
  | "statusRejected"
  | "tag.popular"
  | "tag.spicy"
  | "tag.extra_spicy"
  | "tag.chefs_special"
  | "tag.signature"
  | "tag.sweet"
  | "tag.new"
  | "tag.limited"
  | "tag.must_try"
  | "tag.junction_pick"
  | "tag.table_favourite"
  | "tag.scan_star";

type Pack = Record<GuestUiKey, string>;

const en: Pack = {
  searchPlaceholder: "Search dishes, drinks, or price...",
  clearSearch: "Clear search",
  filterAll: "All",
  filterVeg: "Veg",
  filterNonVeg: "Non-Veg",
  filterBestsellers: "Bestsellers",
  emptyTitle: "No Items Found",
  emptyBody: "Try modifying your search queries or diet toggles to view available dishes.",
  dishDescription: "Dish Description",
  choosePortion: "Choose portion",
  vegan: "Vegan",
  viewingMenu: "Currently viewing",
  diningTable: "Dining Location: Table",
  taxNote: "Subject to local taxes",
  poweredBy: "Powered by QR Junction Menu Suite",
  language: "Language",
  yourPlate: "Your plate",
  yourOrders: "Your orders",
  sendKitchen: "Send to the kitchen",
  subtotal: "Subtotal",
  total: "Total",
  notePlaceholder: "Any note for the kitchen?",
  emptyPlate: "Your plate is empty",
  stepSent: "Sent",
  stepAccepted: "Accepted",
  stepCooking: "Cooking",
  stepOnTheWay: "On the way",
  stepAtTable: "At the table",
  add: "Add",
  statusPlaced: "Sent to the kitchen",
  statusAccepted: "The kitchen has your plate",
  statusPreparing: "On the fire",
  statusReady: "On its way",
  statusServed: "At your table",
  statusRejected: "The kitchen couldn't take this",
  "tag.popular": "Popular",
  "tag.spicy": "Spicy",
  "tag.extra_spicy": "Extra spicy",
  "tag.chefs_special": "Chef's special",
  "tag.signature": "Signature dish",
  "tag.sweet": "Sweet",
  "tag.new": "New",
  "tag.limited": "Limited time",
  "tag.must_try": "Must try",
  "tag.junction_pick": "Junction pick",
  "tag.table_favourite": "Table favourite",
  "tag.scan_star": "Scan star",
};

const hi: Pack = {
  ...en,
  searchPlaceholder: "व्यंजन, पेय या कीमत खोजें...",
  clearSearch: "खोज साफ़ करें",
  filterAll: "सभी",
  filterVeg: "शाकाहारी",
  filterNonVeg: "मांसाहारी",
  filterBestsellers: "सबसे लोकप्रिय",
  emptyTitle: "कोई व्यंजन नहीं मिला",
  emptyBody: "खोज या आहार फ़िल्टर बदलकर उपलब्ध व्यंजन देखें।",
  dishDescription: "व्यंजन विवरण",
  choosePortion: "पोर्शन चुनें",
  vegan: "वीगन",
  viewingMenu: "अभी देख रहे हैं",
  diningTable: "टेबल",
  taxNote: "स्थानीय कर लागू",
  language: "भाषा",
  yourPlate: "आपकी प्लेट",
  yourOrders: "आपके ऑर्डर",
  sendKitchen: "किचन को भेजें",
  subtotal: "उप-योग",
  total: "कुल",
  notePlaceholder: "किचन के लिए कोई नोट?",
  emptyPlate: "आपकी प्लेट खाली है",
  stepSent: "भेजा",
  stepAccepted: "स्वीकृत",
  stepCooking: "पक रहा है",
  stepOnTheWay: "रास्ते में",
  stepAtTable: "टेबल पर",
  add: "जोड़ें",
  statusPlaced: "किचन को भेजा गया",
  statusAccepted: "किचन ने आपकी प्लेट ले ली",
  statusPreparing: "तैयार हो रहा है",
  statusReady: "आ रहा है",
  statusServed: "आपकी टेबल पर",
  statusRejected: "किचन यह ऑर्डर नहीं ले सका",
  "tag.popular": "लोकप्रिय",
  "tag.spicy": "तीखा",
  "tag.extra_spicy": "बहुत तीखा",
  "tag.chefs_special": "शेफ स्पेशल",
  "tag.signature": "सिग्नेचर डिश",
  "tag.sweet": "मीठा",
  "tag.new": "नया",
  "tag.limited": "सीमित समय",
  "tag.must_try": "ज़रूर आज़माएँ",
  "tag.junction_pick": "जंक्शन पिक",
  "tag.table_favourite": "टेबल पसंदीदा",
  "tag.scan_star": "स्कैन स्टार",
};

const mr: Pack = {
  ...en,
  searchPlaceholder: "पदार्थ, पेये किंवा किंमत शोधा...",
  clearSearch: "शोध साफ करा",
  filterAll: "सर्व",
  filterVeg: "शाकाहारी",
  filterNonVeg: "मांसाहारी",
  filterBestsellers: "लोकप्रिय",
  emptyTitle: "पदार्थ सापडले नाहीत",
  emptyBody: "शोध किंवा आहार फिल्टर बदलून उपलब्ध पदार्थ पहा.",
  dishDescription: "पदार्थाचे वर्णन",
  choosePortion: "पोर्शन निवडा",
  vegan: "वीगन",
  viewingMenu: "सध्या पाहत आहात",
  diningTable: "टेबल",
  taxNote: "स्थानिक कर लागू",
  language: "भाषा",
  yourPlate: "तुमची प्लेट",
  yourOrders: "तुमचे ऑर्डर",
  sendKitchen: "किचनला पाठवा",
  subtotal: "उपयोग",
  total: "एकूण",
  notePlaceholder: "किचनसाठी टीप?",
  emptyPlate: "तुमची प्लेट रिकामी आहे",
  stepSent: "पाठवले",
  stepAccepted: "स्वीकृत",
  stepCooking: "शिजत आहे",
  stepOnTheWay: "येत आहे",
  stepAtTable: "टेबलावर",
  add: "जोडा",
  statusPlaced: "किचनला पाठवले",
  statusAccepted: "किचनने प्लेट घेतली",
  statusPreparing: "तयार होत आहे",
  statusReady: "येत आहे",
  statusServed: "टेबलावर",
  statusRejected: "किचन हे ऑर्डर घेऊ शकले नाही",
  "tag.popular": "लोकप्रिय",
  "tag.spicy": "तिखट",
  "tag.extra_spicy": "अति तिखट",
  "tag.chefs_special": "शेफ स्पेशल",
  "tag.signature": "सिग्नेचर डिश",
  "tag.sweet": "गोड",
  "tag.new": "नवीन",
  "tag.limited": "मर्यादित वेळ",
  "tag.must_try": "नक्की चाखा",
  "tag.junction_pick": "जंक्शन पिक",
  "tag.table_favourite": "टेबल आवडते",
  "tag.scan_star": "स्कॅन स्टार",
};

const gu: Pack = {
  ...en,
  searchPlaceholder: "વાનગીઓ, પીણાં અથવા કિંમત શોધો...",
  clearSearch: "શોધ સાફ કરો",
  filterAll: "બધા",
  filterVeg: "શાકાહારી",
  filterNonVeg: "માંસાહારી",
  filterBestsellers: "લોકપ્રિય",
  emptyTitle: "કોઈ વાનગી મળી નથી",
  emptyBody: "શોધ અથવા ફિલ્ટર બદલીને ઉપલબ્ધ વાનગીઓ જુઓ.",
  dishDescription: "વાનગી વર્ણન",
  choosePortion: "પોર્શન પસંદ કરો",
  vegan: "વીગન",
  viewingMenu: "હાલ જોઈ રહ્યા છો",
  diningTable: "ટેબલ",
  taxNote: "સ્થાનિક કર લાગુ",
  language: "ભાષા",
  yourPlate: "તમારી પ્લેટ",
  yourOrders: "તમારા ઓર્ડર",
  sendKitchen: "કિચનને મોકલો",
  subtotal: "પેટા કુલ",
  total: "કુલ",
  notePlaceholder: "કિચન માટે નોંધ?",
  emptyPlate: "તમારી પ્લેટ ખાલી છે",
  stepSent: "મોકલ્યું",
  stepAccepted: "સ્વીકાર્યું",
  stepCooking: "રાંધાઈ રહ્યું છે",
  stepOnTheWay: "રસ્તામાં",
  stepAtTable: "ટેબલ પર",
  add: "ઉમેરો",
  statusPlaced: "કિચનને મોકલ્યું",
  statusAccepted: "કિચને પ્લેટ લીધી",
  statusPreparing: "તૈયાર થઈ રહ્યું છે",
  statusReady: "આવી રહ્યું છે",
  statusServed: "ટેબલ પર",
  statusRejected: "કિચન આ ઓર્ડર લઈ શક્યું નહીં",
  "tag.popular": "લોકપ્રિય",
  "tag.spicy": "તીખું",
  "tag.extra_spicy": "વધુ તીખું",
  "tag.chefs_special": "શેફ સ્પેશિયલ",
  "tag.signature": "સિગ્નેચર ડિશ",
  "tag.sweet": "મીઠું",
  "tag.new": "નવું",
  "tag.limited": "મર્યાદિત સમય",
  "tag.must_try": "જરૂર અજમાવો",
  "tag.junction_pick": "જંક્શન પિક",
  "tag.table_favourite": "ટેબલ પસંદગી",
  "tag.scan_star": "સ્કેન સ્ટાર",
};

const bn: Pack = {
  ...en,
  searchPlaceholder: "খাবার, পানীয় বা দাম খুঁজুন...",
  clearSearch: "খোঁজ মুছুন",
  filterAll: "সব",
  filterVeg: "নিরামিষ",
  filterNonVeg: "আমিষ",
  filterBestsellers: "জনপ্রিয়",
  emptyTitle: "কোনো আইটেম পাওয়া যায়নি",
  emptyBody: "খোঁজ বা ফিল্টার বদলিয়ে উপলব্ধ খাবার দেখুন।",
  dishDescription: "খাবারের বিবরণ",
  choosePortion: "পোরশন বেছে নিন",
  vegan: "ভিগান",
  viewingMenu: "এখন দেখছেন",
  diningTable: "টেবিল",
  taxNote: "স্থানীয় কর প্রযোজ্য",
  language: "ভাষা",
  yourPlate: "আপনার প্লেট",
  yourOrders: "আপনার অর্ডার",
  sendKitchen: "কিচেনে পাঠান",
  subtotal: "উপমোট",
  total: "মোট",
  notePlaceholder: "কিচেনের জন্য নোট?",
  emptyPlate: "আপনার প্লেট খালি",
  stepSent: "পাঠানো",
  stepAccepted: "গ্রহণ",
  stepCooking: "রান্না হচ্ছে",
  stepOnTheWay: "পথে",
  stepAtTable: "টেবিলে",
  add: "যোগ",
  statusPlaced: "কিচেনে পাঠানো হয়েছে",
  statusAccepted: "কিচেন প্লেট নিয়েছে",
  statusPreparing: "তৈরি হচ্ছে",
  statusReady: "আসছে",
  statusServed: "টেবিলে",
  statusRejected: "কিচেন এই অর্ডার নিতে পারেনি",
  "tag.popular": "জনপ্রিয়",
  "tag.spicy": "ঝাল",
  "tag.extra_spicy": "অতিরিক্ত ঝাল",
  "tag.chefs_special": "শেফ স্পেশাল",
  "tag.signature": "সিগনেচার ডিশ",
  "tag.sweet": "মিষ্টি",
  "tag.new": "নতুন",
  "tag.limited": "সীমিত সময়",
  "tag.must_try": "অবশ্যই চেষ্টা করুন",
  "tag.junction_pick": "জাংশন পিক",
  "tag.table_favourite": "টেবিল প্রিয়",
  "tag.scan_star": "স্ক্যান স্টার",
};

const ta: Pack = {
  ...en,
  searchPlaceholder: "உணவுகள், பானங்கள் அல்லது விலை தேடுங்கள்...",
  clearSearch: "தேடலை அழி",
  filterAll: "அனைத்தும்",
  filterVeg: "சைவம்",
  filterNonVeg: "அசைவம்",
  filterBestsellers: "பிரபலமானவை",
  emptyTitle: "உணவுகள் இல்லை",
  emptyBody: "தேடல் அல்லது வடிகட்டியை மாற்றி கிடைக்கும் உணவுகளை பாருங்கள்.",
  dishDescription: "உணவு விவரம்",
  choosePortion: "பகுதி தேர்வு",
  vegan: "வீகன்",
  viewingMenu: "இப்போது பார்க்கிறீர்கள்",
  diningTable: "மேசை",
  taxNote: "உள்ளூர் வரி பொருந்தும்",
  language: "மொழி",
  yourPlate: "உங்கள் தட்டு",
  yourOrders: "உங்கள் ஆர்டர்கள்",
  sendKitchen: "சமையலறைக்கு அனுப்பு",
  subtotal: "உபத்தொகை",
  total: "மொத்தம்",
  notePlaceholder: "சமையலறைக்கு குறிப்பு?",
  emptyPlate: "உங்கள் தட்டு காலியாக உள்ளது",
  stepSent: "அனுப்பியது",
  stepAccepted: "ஏற்கப்பட்டது",
  stepCooking: "சமைக்கிறது",
  stepOnTheWay: "வழியில்",
  stepAtTable: "மேசையில்",
  add: "சேர்",
  statusPlaced: "சமையலறைக்கு அனுப்பப்பட்டது",
  statusAccepted: "சமையலறை தட்டை ஏற்றது",
  statusPreparing: "தயாராகிறது",
  statusReady: "வருகிறது",
  statusServed: "மேசையில்",
  statusRejected: "சமையலறை இந்த ஆர்டரை ஏற்கவில்லை",
  "tag.popular": "பிரபலம்",
  "tag.spicy": "காரம்",
  "tag.extra_spicy": "அதிக காரம்",
  "tag.chefs_special": "செஃப் ஸ்பெஷல்",
  "tag.signature": "சிக்னேச்சர் டிஷ்",
  "tag.sweet": "இனிப்பு",
  "tag.new": "புதியது",
  "tag.limited": "குறைந்த நேரம்",
  "tag.must_try": "கண்டிப்பாக முயற்சிக்கவும்",
  "tag.junction_pick": "ஜங்ஷன் பிக்",
  "tag.table_favourite": "மேசை விருப்பம்",
  "tag.scan_star": "ஸ்கேன் ஸ்டார்",
};

const te: Pack = {
  ...en,
  searchPlaceholder: "వంటకాలు, పానీయాలు లేదా ధర వెతకండి...",
  clearSearch: "శోధన క్లియర్ చేయి",
  filterAll: "అన్నీ",
  filterVeg: "శాకాహారం",
  filterNonVeg: "మాంసాహారం",
  filterBestsellers: "జనాదరణ",
  emptyTitle: "ఐటమ్‌లు లేవు",
  emptyBody: "శోధన లేదా ఫిల్టర్ మార్చి అందుబాటులో ఉన్న వంటకాలు చూడండి.",
  dishDescription: "వంటక వివరణ",
  choosePortion: "పోర్షన్ ఎంచుకోండి",
  vegan: "వీగన్",
  viewingMenu: "ప్రస్తుతం చూస్తున్నారు",
  diningTable: "టేబుల్",
  taxNote: "స్థానిక పన్ను వర్తిస్తుంది",
  language: "భాష",
  yourPlate: "మీ ప్లేట్",
  yourOrders: "మీ ఆర్డర్లు",
  sendKitchen: "కిచెన్‌కు పంపండి",
  subtotal: "ఉప మొత్తం",
  total: "మొత్తం",
  notePlaceholder: "కిచెన్ కోసం నోట్?",
  emptyPlate: "మీ ప్లేట్ ఖాళీగా ఉంది",
  stepSent: "పంపబడింది",
  stepAccepted: "అంగీకరించబడింది",
  stepCooking: "వండుతోంది",
  stepOnTheWay: "దారిలో",
  stepAtTable: "టేబుల్ వద్ద",
  add: "జోడించు",
  statusPlaced: "కిచెన్‌కు పంపబడింది",
  statusAccepted: "కిచెన్ ప్లేట్ తీసుకుంది",
  statusPreparing: "సిద్ధమవుతోంది",
  statusReady: "వస్తోంది",
  statusServed: "టేబుల్ వద్ద",
  statusRejected: "కిచెన్ ఈ ఆర్డర్ తీసుకోలేకపోయింది",
  "tag.popular": "జనాదరణ",
  "tag.spicy": "కారం",
  "tag.extra_spicy": "ఎక్కువ కారం",
  "tag.chefs_special": "షెఫ్ స్పెషల్",
  "tag.signature": "సిగ్నేచర్ డిష్",
  "tag.sweet": "తీపి",
  "tag.new": "కొత్త",
  "tag.limited": "పరిమిత సమయం",
  "tag.must_try": "తప్పక ప్రయత్నించండి",
  "tag.junction_pick": "జంక్షన్ పిక్",
  "tag.table_favourite": "టేబుల్ ఇష్టం",
  "tag.scan_star": "స్కాన్ స్టార్",
};

const PACKS: Record<MenuLocaleCode, Pack> = { en, hi, mr, gu, bn, ta, te };

export function guestUiText(locale: MenuLocaleCode, key: GuestUiKey): string {
  return PACKS[locale]?.[key] || PACKS.en[key] || key;
}

export function guestTagLabel(locale: MenuLocaleCode, tagId: string, fallback: string): string {
  const key = `tag.${tagId}` as GuestUiKey;
  if (key in PACKS.en) return guestUiText(locale, key);
  return fallback;
}

export function guestStatusCopy(locale: MenuLocaleCode, status: string, rejectReason?: string | null) {
  switch (status) {
    case "PLACED":
      return guestUiText(locale, "statusPlaced");
    case "ACCEPTED":
      return guestUiText(locale, "statusAccepted");
    case "PREPARING":
      return guestUiText(locale, "statusPreparing");
    case "READY":
      return guestUiText(locale, "statusReady");
    case "SERVED":
      return guestUiText(locale, "statusServed");
    case "REJECTED": {
      const base = guestUiText(locale, "statusRejected");
      return rejectReason ? `${base}. ${rejectReason}` : base;
    }
    default:
      return guestUiText(locale, "statusPlaced");
  }
}
