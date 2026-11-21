/**
 * Tests the /menu/<name>/<menuId>?table=<code> URL, table code encryption and API verification.
 * Usage: $env:TEST_BASE_URL="http://localhost:3000"; npx tsx scripts/test-menu-url.ts
 * Creates a temporary table + QR in the first restaurant and removes them afterwards.
 */
import { PrismaClient } from "@prisma/client";
import { slugifyRestaurantName, menuPath } from "../lib/menu/slug";
import { decryptTableCode, encryptTableCode, resolveTableFromCode } from "../lib/menu/tableCode";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();
let failed = 0;

function check(ok: boolean, name: string, detail = "") {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` - ${detail}` : ""}`);
}

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") || "", text: res.status === 200 ? await res.text() : "" };
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as any };
}

async function main() {
  // Slug
  check(slugifyRestaurantName("Radha Restaurant") === "radha-restaurant", "slug: spaces -> '-' and lowercase");
  check(slugifyRestaurantName("  Café  Déjà  Vu!! ") === "cafe-deja-vu", "slug: diacritics, symbols, trim");
  check(slugifyRestaurantName("A & B's  Grill") === "a-and-b-s-grill", "slug: ampersand and apostrophe");
  check(slugifyRestaurantName("राधा") === "restaurant", "slug: non-latin fallback");
  check(slugifyRestaurantName("x".repeat(200)).length <= 60, "slug: length capped");
  check(menuPath({ name: "Radha Restaurant", menuId: 7, tableCode: "abc" }) === "/menu/radha-restaurant/7?table=abc", "menuPath format");

  // Token round trip and tampering
  const code = encryptTableCode({ tableId: 12, restaurantId: 3 });
  const back = decryptTableCode(code);
  check(back?.tableId === 12 && back?.restaurantId === 3, "code round-trip");
  check(!/12|Table/.test(code) || code.length > 40, "code is opaque", code);
  check(encryptTableCode({ tableId: 12, restaurantId: 3 }) !== code, "code is randomized per mint");
  const flipped = code.slice(0, -2) + (code.endsWith("AA") ? "BB" : "AA");
  check(decryptTableCode(flipped) === null, "tampered code rejected");
  check(decryptTableCode(code.slice(0, 30)) === null, "truncated code rejected");
  check(decryptTableCode("Table-5") === null && decryptTableCode("") === null && decryptTableCode(null) === null, "garbage rejected");
  check((await resolveTableFromCode(code, 4)) === null, "code from another restaurant rejected");

  const restaurant = await prisma.restaurant.findFirst({
    where: { menus: { some: {} } },
    orderBy: { id: "asc" },
    select: { id: true, name: true, userId: true },
  });
  if (!restaurant) throw new Error("no restaurant with a menu");
  const menu =
    (await prisma.menu.findFirst({ where: { restaurantId: restaurant.id, isDefault: true }, select: { id: true } })) ??
    (await prisma.menu.findFirstOrThrow({ where: { restaurantId: restaurant.id }, orderBy: { id: "asc" }, select: { id: true } }));
  const slug = slugifyRestaurantName(restaurant.name);

  const stamp = Date.now();
  const tableName = `ZZ-Table-${stamp}`;
  const shortCode = `zz${stamp.toString(36)}`;
  const qr = await prisma.qRCode.create({
    data: {
      name: "E2E menu url",
      type: "RESTAURANT_MENU",
      shortCode,
      destination: { restaurantId: restaurant.id, tableNumber: tableName, menuId: null },
      userId: restaurant.userId,
      restaurantId: restaurant.id,
    },
  });
  const table = await prisma.restaurantTable.create({
    data: { restaurantId: restaurant.id, tableNumber: tableName, qrCodeId: qr.id },
  });
  const directShort = `zd${stamp.toString(36)}`;
  const directQr = await prisma.qRCode.create({
    data: {
      name: "E2E direct menu",
      type: "RESTAURANT_MENU",
      shortCode: directShort,
      destination: { restaurantId: restaurant.id, menuId: menu.id },
      userId: restaurant.userId,
      restaurantId: restaurant.id,
    },
  });

  const prior = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurant.id }, select: { orderingEnabled: true, callWaiterEnabled: true } });
  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { orderingEnabled: true, callWaiterEnabled: true } });

  try {
    // QR redirect
    const scan = await get(`/q/${shortCode}`);
    const loc = scan.location ? new URL(scan.location, BASE) : null;
    check(scan.status >= 300 && scan.status < 400 && !!loc, "scan redirects", `${scan.status} ${scan.location}`);
    check(loc?.pathname === `/menu/${slug}/${menu.id}`, "redirect path is /menu/<slug>/<menuId>", loc?.pathname);
    const tableCode = loc?.searchParams.get("table") || "";
    check(!!tableCode && !scan.location.includes(tableName) && !scan.location.includes(encodeURIComponent(tableName)), "table name not exposed in URL");
    check(decryptTableCode(tableCode)?.tableId === table.id, "minted code decrypts to the table id");

    // Page
    const page = await get(`/menu/${slug}/${menu.id}?table=${encodeURIComponent(tableCode)}`);
    check(page.status === 200 && page.text.includes("Dining at"), "page shows table for valid code", String(page.status));
    const tampered = await get(`/menu/${slug}/${menu.id}?table=${encodeURIComponent(tableCode.slice(0, -2) + "AA")}`);
    check(tampered.status === 200 && !tampered.text.includes("Dining at"), "tampered code shows no table");
    const raw = await get(`/menu/${slug}/${menu.id}?table=${encodeURIComponent(tableName)}`);
    check(raw.status === 200 && !raw.text.includes("Dining at"), "raw table name in URL is not honored");
    const wrongSlug = await get(`/menu/some-wrong-name/${menu.id}?table=${encodeURIComponent(tableCode)}`);
    const wl = wrongSlug.location ? new URL(wrongSlug.location, BASE) : null;
    check(wrongSlug.status >= 300 && wrongSlug.status < 400 && wl?.pathname === `/menu/${slug}/${menu.id}` && wl.searchParams.get("table") === tableCode, "wrong slug redirects to canonical, keeping code");
    const missing = await get(`/menu/${slug}/99999999`);
    check(missing.status === 404, "unknown menu id -> 404");

    // Legacy
    const legacy = await get(`/r/${restaurant.id}/${menu.id}?table=${encodeURIComponent(tableName)}`);
    check(legacy.status >= 300 && legacy.status < 400 && new URL(legacy.location, BASE).pathname === `/menu/${slug}/${menu.id}` && !legacy.location.includes("table="), "legacy /r/<id>/<menuId> redirects, raw table dropped");
    const legacyRoot = await get(`/r/${restaurant.id}`);
    check(legacyRoot.status >= 300 && legacyRoot.status < 400 && new URL(legacyRoot.location, BASE).pathname.startsWith(`/menu/${slug}/`), "legacy /r/<id> redirects");

    // Direct menu QR
    const direct = await get(`/q/${directShort}`);
    const dl = direct.location ? new URL(direct.location, BASE) : null;
    check(dl?.pathname === `/menu/${slug}/${menu.id}` && !dl.searchParams.has("table"), "direct menu QR has no table param");

    // Waiter API: table verification happens before the feature gate
    const noCode = await post("/api/public/waiter-requests", { restaurantId: restaurant.id, tableNumber: tableName, reason: "WATER" });
    check(noCode.status === 400 && noCode.json.code === "TABLE_REQUIRED", "waiter: raw tableNumber rejected", `${noCode.status} ${noCode.json.code}`);
    const forged = await post("/api/public/waiter-requests", { restaurantId: restaurant.id, tableCode: tableCode.slice(0, -2) + "AA", reason: "WATER" });
    check(forged.status === 400 && forged.json.code === "TABLE_REQUIRED", "waiter: forged code rejected", `${forged.status} ${forged.json.code}`);
    const otherRestaurant = await post("/api/public/waiter-requests", { restaurantId: restaurant.id + 100000, tableCode, reason: "WATER" });
    check(otherRestaurant.status !== 200, "waiter: code not valid for another restaurant", String(otherRestaurant.status));
    const valid = await post("/api/public/waiter-requests", { restaurantId: restaurant.id, tableCode, reason: "WATER", guestKey: `e2e-${stamp}` });
    check(valid.json.code !== "TABLE_REQUIRED", "waiter: valid code passes table check", `${valid.status} ${valid.json.code ?? "ok"}`);

    // Orders API: raw tableNumber is ignored, valid code is stored as the real table name
    const item = await prisma.menuItem.findFirst({ where: { category: { menuId: menu.id }, isAvailable: true }, select: { id: true } });
    if (item) {
      const mk = (extra: Record<string, unknown>) => ({
        restaurantId: restaurant.id,
        menuId: menu.id,
        customerName: "E2E Guest",
        customerPhone: "9999999999",
        idempotencyKey: `e2e-${stamp}-${Math.random().toString(36).slice(2)}`,
        items: [{ menuItemId: item.id, quantity: 1 }],
        ...extra,
      });
      const rawOrder = await post("/api/public/orders", mk({ tableNumber: tableName }));
      if (rawOrder.status === 201 || rawOrder.status === 200) {
        check((rawOrder.json.order?.tableNumber ?? null) === null, "order: raw tableNumber ignored");
        const goodOrder = await post("/api/public/orders", mk({ tableCode }));
        check(goodOrder.json.order?.tableNumber === tableName, "order: valid code stores real table name", String(goodOrder.json.order?.tableNumber));
        const badOrder = await post("/api/public/orders", mk({ tableCode: tableCode.slice(0, -2) + "AA" }));
        check((badOrder.json.order?.tableNumber ?? null) === null, "order: forged code ignored");
        await prisma.menuOrder.deleteMany({ where: { restaurantId: restaurant.id, customer: { name: "E2E Guest" } } });
        await prisma.customer.deleteMany({ where: { name: "E2E Guest" } }).catch(() => undefined);
      } else {
        console.log(`SKIP  order checks (ordering unavailable: ${rawOrder.status} ${rawOrder.json.code ?? ""})`);
      }
    } else {
      console.log("SKIP  order checks (no available item)");
    }
    await prisma.waiterRequest.deleteMany({ where: { restaurantId: restaurant.id, tableNumber: tableName } });

    // Rename keeps the code valid (code holds the table id)
    await prisma.restaurantTable.update({ where: { id: table.id }, data: { tableNumber: `${tableName}-renamed` } });
    const renamed = await resolveTableFromCode(tableCode, restaurant.id);
    check(renamed?.tableNumber === `${tableName}-renamed`, "table rename keeps code valid");
    await prisma.restaurantTable.delete({ where: { id: table.id } });
    check((await resolveTableFromCode(tableCode, restaurant.id)) === null, "deleted table code rejected");
  } finally {
    await prisma.restaurant.update({ where: { id: restaurant.id }, data: prior });
    await prisma.restaurantTable.deleteMany({ where: { id: table.id } });
    await prisma.qRCode.deleteMany({ where: { id: { in: [qr.id, directQr.id] } } });
  }

  console.log(failed ? `\n${failed} FAILED` : "\nAll menu URL checks passed");
  process.exitCode = failed ? 1 : 0;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
