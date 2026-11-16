/**
 * Guest menu welcome lines — edit here only.
 * Use `{name}` for the restaurant name.
 */
export const WELCOME_LINES: string[] = [
  "Welcome to {name}. Hunger called — we answered.",
  "{name} is open. Your stomach just got promoted.",
  "Good news: {name}. Better news: you're here.",
  "Pull up a seat. {name} already saved you a craving.",
  "Hungry? Perfect. {name} was expecting you.",
  "The kitchen at {name} just got a VIP — that's you.",
  "Scan complete. Appetite engaged. Welcome to {name}.",
  "{name}: where “just looking” becomes “just one more dish.”",
  "You've arrived at {name}. Resistance is delicious.",
  "Menu unlocked. Willpower optional. Welcome to {name}.",
  "Fresh plates, zero small talk required. Welcome to {name}.",
  "{name} called dibs on your appetite. Glad you showed up.",
];

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Stable pick so the same restaurant + theme keeps the same joke for the session. */
export function pickWelcomeLine(themeId: string, restaurantId: number | string) {
  const lines = WELCOME_LINES;
  if (!lines.length) return "Welcome.";
  const index = hashSeed(`${restaurantId}:${themeId}`) % lines.length;
  return lines[index]!;
}

export function formatWelcomeLine(template: string, restaurantName: string) {
  const name = restaurantName.trim() || "us";
  return template.replaceAll("{name}", name);
}
