import type { MenuThemeMeta, ThemeGroup } from "./types";

export const THEME_GROUPS: { id: "all" | ThemeGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "classic", label: "Classic" },
  { id: "new", label: "New looks" },
  { id: "paper", label: "Paper" },
  { id: "night", label: "Night" },
  { id: "playful", label: "Playful" },
];

export const MENU_THEMES: MenuThemeMeta[] = [
  { id: "modern", name: "Modern Card", group: "classic", desc: "Photo cards in a clean grid.", vibe: "Everyday" },
  { id: "minimal", name: "Minimal List", group: "classic", desc: "Text-first, dotted prices, easy to scan.", vibe: "Quiet" },
  { id: "premium", name: "Premium Restaurant", group: "classic", desc: "Serif titles and gold frames.", vibe: "Fine dining" },
  { id: "cafe", name: "Cafe Board", group: "classic", desc: "Bold chalkboard cards with a comic edge.", vibe: "Bistro" },
  { id: "gourmet", name: "Gourmet Night", group: "classic", desc: "Dark room, amber light, tasting-menu feel.", vibe: "Luxury" },
  { id: "street", name: "Street Stall", group: "classic", desc: "Big food photos and warm stall energy.", vibe: "Busy" },
  { id: "editorial", name: "Magazine Cover", group: "new", desc: "One hero dish like a cover story, then a paper column.", vibe: "Editorial" },
  { id: "ticket", name: "Kitchen Ticket", group: "new", desc: "A perforated diner check. Fast to read on a phone.", vibe: "Diner" },
  { id: "neon", name: "Night Market", group: "new", desc: "Swipeable neon cards. Built for one-thumb browsing.", vibe: "After dark" },
  { id: "thali", name: "Thali Circle", group: "new", desc: "Clay bowls and brass. Categories sit like a thali.", vibe: "Home kitchen" },
  { id: "garden", name: "Garden Board", group: "new", desc: "Sage paper and pressed-leaf cards.", vibe: "Botanical" },
  { id: "stamp", name: "Postage Stamp", group: "paper", desc: "Perforated stamps with a postmark. Collectible and tidy.", vibe: "Post office" },
  { id: "playbill", name: "Playbill", group: "paper", desc: "A theatre programme. Categories are acts, dishes are the cast.", vibe: "Stage" },
  { id: "board", name: "Departure Board", group: "night", desc: "Split-flap station board. Prices read like destinations.", vibe: "Transit" },
  { id: "lantern", name: "Lantern Fest", group: "night", desc: "Hanging paper lanterns. Warm, festive, easy to tap.", vibe: "Festival" },
  { id: "polaroid", name: "Polaroid Wall", group: "playful", desc: "Pinned snapshots on a cork wall. Very phone-friendly.", vibe: "Studio" },
  { id: "bento", name: "Bento Box", group: "playful", desc: "Lacquer compartments. One hero dish, then neat little boxes.", vibe: "Tokyo lunch" },
];

export function getMenuTheme(id?: string | null): MenuThemeMeta {
  return MENU_THEMES.find((theme) => theme.id === id) || MENU_THEMES[0];
}

export function isMenuTheme(id?: string | null): id is string {
  return Boolean(id && MENU_THEMES.some((theme) => theme.id === id));
}
