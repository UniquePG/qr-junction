const LINES: Record<string, string[]> = {
  PLACED: [
    "{dish} ki ticket kitchen mein pahunch gayi 🎫 Chef abhi padh rahe hain.",
    "Sent. {dish} is in the queue, not lost in the group chat 😌",
    "Bas bhej diya. Kitchen bol rahi hai, dekha, aa raha hai 👀",
  ],
  ACCEPTED: [
    "Kitchen ne haan kar diya ✅ {dish} ab officially on the list.",
    "Accepted. Chef ne aapka naam note kar liya 👨‍🍳",
    "Green signal mil gaya. {dish} ki baari lag gayi 🟢",
  ],
  PREPARING: [
    "{dish} abhi tawa se dosti kar raha hai 🔥",
    "Cooking. Yeh wala 5 minute, restaurant wala 5 minute hai ⏳",
    "Andar se khushboo aane wali hai. {dish} almost ready hai 👃",
  ],
  READY: [
    "{dish} ready hai 🍽️ Ab sirf table tak ka chhota sa safar.",
    "Plate nikal chuki hai. Aankhein door pe rakho 🚪",
    "On the way. Phone neeche, {dish} upar aane wala hai ✨",
  ],
  SERVED: [
    "{dish} table pe aa gaya 😋 Ab bites, not refreshes.",
    "Served. Kitchen ka kaam khatam, aapka shuru 🫶",
  ],
  REJECTED: [
    "Is baar kitchen nahi le paayi 🙏 {reason}",
    "Plate wapas aa gayi. {reason} 😔",
  ],
};

function hash(value: string) {
  let n = 0;
  for (let i = 0; i < value.length; i += 1) n = (n * 33 + value.charCodeAt(i)) >>> 0;
  return n;
}

export function waitingLine(status: string, publicId: string, dish: string, rejectReason?: string | null) {
  const pool = LINES[status] || LINES.PLACED;
  const line = pool[hash(`${publicId}:${status}`) % pool.length];
  const name = dish.trim() || "Your plate";
  const reason = (rejectReason || "the kitchen could not take this plate").trim();
  return line.replaceAll("{dish}", name).replaceAll("{reason}", reason);
}
