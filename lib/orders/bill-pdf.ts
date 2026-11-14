import { PDFDocument, StandardFonts, rgb, type PDFFont, type RGB } from "pdf-lib";
import {
  buildBillPayload,
  formatBillAddress,
  formatBillMoney,
  type BillOrder,
  type BillRestaurant,
} from "@/lib/orders/bill";

const ink = rgb(0.11, 0.08, 0.06);
const muted = rgb(0.42, 0.35, 0.31);
const accent = rgb(0.77, 0.38, 0.18);
const rule = rgb(0.91, 0.87, 0.82);
const paidBg = rgb(1, 0.96, 0.93);

/** Helvetica/WinAnsi cannot encode ₹, €, emoji, etc. */
function pdfSafe(text: string) {
  return String(text || "")
    .replace(/₹/g, "Rs.")
    .replace(/€/g, "EUR ")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—·]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function pdfMoneySymbol(currency: string) {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "EUR ";
  return "Rs.";
}

function whenLabel(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Fetch + embed restaurant logo; Cloudinary URLs forced to PNG for pdf-lib. */
async function embedRestaurantLogo(doc: PDFDocument, logoUrl: string | null) {
  if (!logoUrl?.trim()) return null;
  try {
    let url = logoUrl.trim();
    if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
      url = url.replace("/upload/", "/upload/f_png,w_180,h_180,c_fit/");
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (!bytes.length) return null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("png") || bytes[0] === 0x89) return await doc.embedPng(bytes);
    if (ct.includes("jpeg") || ct.includes("jpg") || bytes[0] === 0xff) {
      return await doc.embedJpg(bytes);
    }
    try {
      return await doc.embedPng(bytes);
    } catch {
      return await doc.embedJpg(bytes);
    }
  } catch {
    return null;
  }
}

export async function buildBillPdfBytes(restaurant: BillRestaurant, order: BillOrder): Promise<Uint8Array> {
  const bill = buildBillPayload(restaurant, order);
  const symbol = pdfMoneySymbol(order.currency || restaurant.currency);
  const doc = await PDFDocument.create();
  const page = doc.addPage([420, 720]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logoImage = await embedRestaurantLogo(doc, bill.restaurant.logoUrl);
  const { width, height } = page.getSize();

  const marginX = 40;
  const contentRight = width - marginX;
  const contentWidth = contentRight - marginX;
  const logoBox = 48;
  const logoGap = 12;
  let headerTextWidth = contentWidth;

  // Outer frame with comfortable inset so text never kisses the border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rule,
    borderWidth: 1,
  });

  let y = height - 52;

  if (logoImage) {
    const scale = Math.min(logoBox / logoImage.width, logoBox / logoImage.height);
    const lw = logoImage.width * scale;
    const lh = logoImage.height * scale;
    page.drawImage(logoImage, {
      x: contentRight - lw,
      y: y + 10 - lh,
      width: lw,
      height: lh,
    });
    headerTextWidth = contentWidth - lw - logoGap;
  }

  const drawLeft = (
    text: string,
    opts: { size?: number; font?: PDFFont; color?: RGB; maxWidth?: number } = {},
  ) => {
    const font = opts.font || regular;
    const size = opts.size || 10;
    page.drawText(pdfSafe(text), {
      x: marginX,
      y,
      size,
      font,
      color: opts.color || ink,
      maxWidth: opts.maxWidth ?? contentWidth,
    });
  };

  const drawRight = (
    text: string,
    opts: { size?: number; font?: PDFFont; color?: RGB; y?: number } = {},
  ) => {
    const font = opts.font || regular;
    const size = opts.size || 10;
    const safe = pdfSafe(text);
    const tw = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, {
      x: contentRight - tw,
      y: opts.y ?? y,
      size,
      font,
      color: opts.color || ink,
    });
  };

  const ruleLine = (thickness = 0.7, color: RGB = rule) => {
    page.drawLine({
      start: { x: marginX, y },
      end: { x: contentRight, y },
      thickness,
      color,
    });
  };

  // --- Header (name + address left, logo top-right when present) ---
  const nameMaxChars = Math.max(18, Math.floor(headerTextWidth / 7.2));
  drawLeft(bill.restaurant.name.slice(0, nameMaxChars), {
    font: bold,
    size: 15,
    maxWidth: headerTextWidth,
  });
  y -= 18;

  for (const line of formatBillAddress(bill.restaurant).slice(0, 3)) {
    drawLeft(line.slice(0, Math.floor(headerTextWidth / 4.2)), {
      size: 8,
      color: muted,
      maxWidth: headerTextWidth,
    });
    y -= 11;
  }
  if (bill.restaurant.phone) {
    drawLeft(`Phone ${bill.restaurant.phone}`, {
      size: 8,
      color: muted,
      maxWidth: headerTextWidth,
    });
    y -= 11;
  }
  if (bill.restaurant.gstin) {
    drawLeft(`GSTIN ${bill.restaurant.gstin}`, {
      size: 8,
      color: muted,
      maxWidth: headerTextWidth,
    });
    y -= 11;
  }
  if (bill.restaurant.fssai) {
    drawLeft(`FSSAI ${bill.restaurant.fssai}`, {
      size: 8,
      color: muted,
      maxWidth: headerTextWidth,
    });
    y -= 11;
  }

  // Keep accent rule clear of a tall logo
  if (logoImage) {
    const logoBottom = height - 52 + 10 - logoBox;
    if (y > logoBottom - 8) y = logoBottom - 8;
  }

  y -= 10;
  ruleLine(1.5, accent);
  y -= 16;

  // --- Bill meta: title + call code left, place/name/time right ---
  const metaTop = y;
  drawLeft(bill.title.toUpperCase(), { font: bold, size: 9, color: accent });
  y -= 14;
  drawLeft(bill.callCode, { font: bold, size: 13 });

  const placeLine = `${bill.placeLabel} - ${bill.order.customerName}`.slice(0, 36);
  const orderedLine = `Ordered ${whenLabel(bill.order.createdAt)}`;
  drawRight(placeLine, { size: 8, color: muted, y: metaTop });
  drawRight(orderedLine, { size: 8, color: muted, y: metaTop - 12 });

  y -= 18;
  ruleLine();
  y -= 12;

  // --- Items table ---
  drawLeft("Item", { font: bold, size: 8, color: muted });
  page.drawText(pdfSafe("Qty"), {
    x: contentRight - 120,
    y,
    size: 8,
    font: bold,
    color: muted,
  });
  drawRight("Amount", { font: bold, size: 8, color: muted });
  y -= 10;
  ruleLine(0.5);
  y -= 12;

  for (const item of bill.order.items) {
    const label = `${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}`.slice(0, 40);
    drawLeft(label, { size: 9, maxWidth: contentWidth - 130 });
    page.drawText(pdfSafe(String(item.quantity)), {
      x: contentRight - 112,
      y,
      size: 9,
      font: regular,
      color: ink,
    });
    drawRight(formatBillMoney(symbol, item.lineTotal), { size: 9 });
    y -= 15;
    if (y < 140) break;
  }

  y -= 4;
  ruleLine();
  y -= 14;

  // --- Totals ---
  const discount = bill.order.discount || 0;
  const totals: Array<[string, string, boolean]> = [
    ["Subtotal", formatBillMoney(symbol, bill.order.subtotal + discount), false],
    ...(discount > 0
      ? ([["Offers saved", `-${formatBillMoney(symbol, discount)}`, false]] as Array<[string, string, boolean]>)
      : []),
    [bill.order.taxName || "Tax", formatBillMoney(symbol, bill.order.tax), false],
    ["Total", formatBillMoney(symbol, bill.order.total), true],
  ];
  for (const [label, value, strong] of totals) {
    drawLeft(label, { font: strong ? bold : regular, size: strong ? 11 : 9 });
    drawRight(value, { font: strong ? bold : regular, size: strong ? 11 : 9 });
    y -= strong ? 16 : 13;
  }

  // --- Paid stamp ---
  if (bill.order.paidAt) {
    y -= 8;
    const paidText = `PAID  ${whenLabel(bill.order.paidAt)}`;
    const paidSize = 9;
    const paidWidth = bold.widthOfTextAtSize(pdfSafe(paidText), paidSize) + 16;
    const paidHeight = 18;
    const paidX = contentRight - paidWidth;
    const paidY = y - 4;
    page.drawRectangle({
      x: paidX,
      y: paidY,
      width: paidWidth,
      height: paidHeight,
      color: paidBg,
      borderColor: accent,
      borderWidth: 0.8,
    });
    page.drawText(pdfSafe(paidText), {
      x: paidX + 8,
      y: paidY + 5,
      size: paidSize,
      font: bold,
      color: accent,
    });
    y -= 28;
  } else {
    y -= 10;
  }

  ruleLine(0.5);
  y -= 14;
  drawLeft(bill.humour, { size: 8, color: muted, maxWidth: contentWidth - 8 });
  y -= 16;
  drawLeft("Powered by QR Junction", { size: 7, color: muted });

  return doc.save();
}
