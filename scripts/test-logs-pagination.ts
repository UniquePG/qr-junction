/**
 * Verifies audit-log pagination + filters against a running dev server.
 * Usage: $env:TEST_BASE_URL="http://localhost:3001"; npx tsx scripts/test-logs-pagination.ts
 * Seeds temporary rows (resourceType "e2e_seed") and removes them afterwards.
 */
import { PrismaClient } from "@prisma/client";
import { SESSION_COOKIE, signSessionToken } from "../lib/session";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();
let failed = 0;

function check(ok: boolean, name: string, detail = "") {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(cookie: string, qs: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(qs)) if (v !== undefined && v !== "") params.set(k, String(v));
  const res = await fetch(`${BASE}/api/restaurant/logs?${params}`, { headers: { cookie } });
  return { status: res.status, body: (await res.json()) as any };
}

async function main() {
  const restaurant = await prisma.restaurant.findFirst({ orderBy: { id: "asc" }, select: { id: true, userId: true } });
  if (!restaurant) throw new Error("no restaurant");
  const cookie = `${SESSION_COOKIE}=${await signSessionToken(restaurant.userId)}`;

  const day = 86_400_000;
  const now = Date.now();
  const rows = Array.from({ length: 60 }, (_, i) => ({
    restaurantId: restaurant.id,
    actorUserId: restaurant.userId,
    actorKind: (i % 3 === 0 ? "STAFF" : "OWNER") as "STAFF" | "OWNER",
    action: i % 2 === 0 ? "zzseed.create" : "zzother.update",
    resourceType: "e2e_seed",
    summary: `Seed event ${i} ${i % 5 === 0 ? "needle" : "hay"}`,
    createdAt: new Date(now - i * 16 * 60 * 60 * 1000), // spans ~40 days
  }));
  await prisma.restaurantAuditLog.deleteMany({ where: { resourceType: "e2e_seed" } });
  await prisma.restaurantAuditLog.createMany({ data: rows });

  try {
    const seedFilter = { category: "zzseed" };

    let r = await get(cookie, { ...seedFilter, pageSize: 10, page: 1, meta: 1 });
    check(r.status === 200, "list ok", `status ${r.status}`);
    check(r.body.total === 30 && r.body.pages === 3, "category filter total/pages", `total ${r.body.total}, pages ${r.body.pages}`);
    check(r.body.logs.length === 10, "page size honoured", String(r.body.logs.length));
    check(Boolean(r.body.stats && r.body.facets), "meta=1 returns stats+facets");
    check(r.body.facets.actions.some((a: any) => a.action === "zzseed.create"), "facets include seeded action");

    r = await get(cookie, { ...seedFilter, pageSize: 10, page: 2 });
    check(!r.body.stats && !r.body.facets, "meta omitted on later pages");

    const ids = new Set<string>();
    let sorted = true;
    let prev = Infinity;
    for (let p = 1; p <= 3; p += 1) {
      const pg = await get(cookie, { ...seedFilter, pageSize: 10, page: p });
      for (const l of pg.body.logs) {
        ids.add(l.id);
        const t = new Date(l.createdAt).getTime();
        if (t > prev) sorted = false;
        prev = t;
      }
    }
    check(ids.size === 30, "pages 1-3 have no overlap/gaps", `${ids.size} unique`);
    check(sorted, "newest first across pages");

    r = await get(cookie, { ...seedFilter, pageSize: 10, page: 99 });
    check(r.body.page === 3 && r.body.logs.length === 10, "page beyond range clamps to last", `page ${r.body.page}`);

    r = await get(cookie, { ...seedFilter, pageSize: 10, page: -4 });
    check(r.body.page === 1, "negative page clamps to 1");

    r = await get(cookie, { ...seedFilter, pageSize: 1000 });
    check(r.body.pageSize === 100, "pageSize capped at 100", String(r.body.pageSize));

    r = await get(cookie, { ...seedFilter, actorKind: "STAFF", pageSize: 50 });
    check(r.body.total === 10, "category + actorKind", String(r.body.total));

    r = await get(cookie, { q: "needle", category: "zzseed", pageSize: 50 });
    check(r.body.total === 6, "search + category", String(r.body.total));

    r = await get(cookie, { q: "NEEDLE", pageSize: 50 });
    check(r.body.total === 12, "search is case-insensitive across areas", String(r.body.total));

    r = await get(cookie, { q: "zzz-no-match-zzz" });
    check(r.body.total === 0 && r.body.logs.length === 0 && r.body.pages === 1 && r.body.page === 1, "empty result shape");

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    r = await get(cookie, { ...seedFilter, from: startToday.toISOString(), pageSize: 50 });
    const todayExpected = rows.filter((x) => x.action.startsWith("zzseed") && x.createdAt >= startToday).length;
    check(r.body.total === todayExpected, "from-date filter (today)", `${r.body.total} vs ${todayExpected}`);

    const from = new Date(now - 10 * day).toISOString();
    const to = new Date(now - 5 * day).toISOString();
    r = await get(cookie, { ...seedFilter, from, to, pageSize: 50 });
    const rangeExpected = rows.filter((x) => x.action.startsWith("zzseed") && x.createdAt >= new Date(from) && x.createdAt <= new Date(to)).length;
    check(r.body.total === rangeExpected, "from+to range", `${r.body.total} vs ${rangeExpected}`);

    r = await get(cookie, { ...seedFilter, from: to, to: from });
    check(r.body.total === 0, "inverted range returns nothing");

    r = await get(cookie, { ...seedFilter, from: "not-a-date", pageSize: 50 });
    check(r.body.total === 30, "invalid date ignored");

    r = await get(cookie, { actorUserId: restaurant.userId, category: "zzseed", pageSize: 50 });
    check(r.body.total === 30, "actorUserId filter");

    r = await get(cookie, { actorUserId: 999999999, category: "zzseed" });
    check(r.body.total === 0, "unknown actor returns nothing");

    r = await get("", { pageSize: 5 });
    check(r.status === 401, "unauthenticated is rejected", `status ${r.status}`);
  } finally {
    await prisma.restaurantAuditLog.deleteMany({ where: { resourceType: "e2e_seed" } });
    await prisma.$disconnect();
  }

  console.log(failed ? `\n${failed} FAILED` : "\nAll log pagination checks passed");
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
