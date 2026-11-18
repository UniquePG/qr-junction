/**
 * Verifies orders.reject, menu.availability, settings.operations (+ kitchen-time) gates.
 * Usage: $env:TEST_BASE_URL="http://localhost:3001"; npx tsx scripts/test-new-permissions.ts
 * Creates temporary users/roles directly in the DB and removes them afterwards.
 */
import { PrismaClient } from "@prisma/client";
import { ROLE_TEMPLATES, expandImplies, type StaffPermissionKey } from "../lib/restaurant/staff/permissions";
import { SESSION_COOKIE, signSessionToken } from "../lib/session";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();
let failed = 0;

function check(ok: boolean, name: string, detail = "") {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function call(cookie: string, path: string, method: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { cookie, "content-type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json: json as any };
}

async function main() {
  // Template sanity
  const kitchen = ROLE_TEMPLATES.find((t) => t.id === "kitchen")!;
  check(kitchen.permissions.includes("orders.reject") && kitchen.permissions.includes("menu.availability"), "Kitchen template has reject + availability");
  check(!kitchen.permissions.includes("settings.operations"), "Kitchen template lacks settings.operations");
  const waiter = ROLE_TEMPLATES.find((t) => t.id === "waiter")!;
  check(!waiter.permissions.includes("orders.reject"), "Waiter template cannot reject orders");
  check(expandImplies(["orders.reject"]).includes("orders.update"), "orders.reject implies orders.update");

  const restaurant = await prisma.restaurant.findFirst({ orderBy: { id: "asc" }, select: { id: true, userId: true, settings: true } });
  if (!restaurant) throw new Error("no restaurant");
  const item = await prisma.menuItem.findFirst({
    where: { category: { restaurantId: restaurant.id } },
    select: { id: true, isAvailable: true },
  });

  const stamp = Date.now();
  const made: Array<{ userId: number; roleId: number }> = [];
  const defs: Record<string, StaffPermissionKey[]> = {
    reject: ["orders.reject"],
    update: ["orders.update"],
    avail: ["menu.availability"],
    view: ["menu.view"],
    ops: ["settings.operations"],
    sview: ["settings.view"],
  };
  const cookies: Record<string, string> = {};
  try {
    for (const [key, perms] of Object.entries(defs)) {
      const role = await prisma.restaurantRole.create({
        data: { restaurantId: restaurant.id, name: `E2E NP ${key} ${stamp}`, permissions: expandImplies(perms) },
      });
      const user = await prisma.user.create({
        data: { email: `e2e.np.${key}.${stamp}@example.com`, name: `NP ${key}`, emailVerified: true, provider: "staff" },
      });
      await prisma.restaurantStaff.create({
        data: { restaurantId: restaurant.id, userId: user.id, roleId: role.id, displayName: `NP ${key}`, status: "ACTIVE", createdByUserId: restaurant.userId },
      });
      made.push({ userId: user.id, roleId: role.id });
      cookies[key] = `${SESSION_COOKIE}=${await signSessionToken(user.id)}`;
    }

    // orders.reject — use a non-existent order: allowed => 404 (not found), denied => 403
    const ghost = "ord_does_not_exist";
    let r = await call(cookies.reject, `/api/restaurant/orders/${ghost}`, "PATCH", { status: "REJECTED", reason: "test" });
    check(r.status === 404, "orders.reject can reject (reaches order lookup)", `status ${r.status}`);
    r = await call(cookies.update, `/api/restaurant/orders/${ghost}`, "PATCH", { status: "REJECTED", reason: "test" });
    check(r.status === 403, "orders.update alone cannot reject", `status ${r.status}`);
    r = await call(cookies.update, `/api/restaurant/orders/${ghost}`, "PATCH", { status: "ACCEPTED" });
    check(r.status === 404, "orders.update can still accept (reaches order lookup)", `status ${r.status}`);
    r = await call(cookies.reject, `/api/restaurant/orders/${ghost}`, "PATCH", { status: "ACCEPTED" });
    check(r.status === 404, "orders.reject implies orders.update", `status ${r.status}`);

    // kitchen time
    r = await call(cookies.update, "/api/restaurant/orders", "PATCH", { prepMinutes: 15 });
    check(r.status === 200, "orders.update can set kitchen time", `status ${r.status}`);
    r = await call(cookies.view, "/api/restaurant/orders", "PATCH", { prepMinutes: 15 });
    check(r.status === 403, "view-only cannot set kitchen time", `status ${r.status}`);

    // menu.availability
    if (item) {
      r = await call(cookies.avail, "/api/restaurant/items", "PUT", { id: item.id, isAvailable: item.isAvailable });
      check(r.status === 200, "menu.availability can toggle availability", `status ${r.status}`);
      r = await call(cookies.avail, "/api/restaurant/items", "PUT", { id: item.id, isAvailable: item.isAvailable, name: "Hacked" });
      check(r.status === 403, "menu.availability cannot edit other fields", `status ${r.status}`);
      r = await call(cookies.view, "/api/restaurant/items", "PUT", { id: item.id, isAvailable: item.isAvailable });
      check(r.status === 403, "menu.view cannot toggle availability", `status ${r.status}`);
      const after = await prisma.menuItem.findUnique({ where: { id: item.id }, select: { name: true } });
      check(after?.name !== "Hacked", "item name unchanged by denied edit");
    } else {
      console.log("SKIP  no menu item to test availability");
    }

    // settings.operations
    const accepting = (restaurant.settings as any)?.acceptingOrders !== false;
    r = await call(cookies.ops, "/api/restaurant/settings", "PATCH", { acceptingOrders: accepting });
    check(r.status === 200 || r.status === 403, "ops PATCH acceptingOrders passes the permission gate", `status ${r.status}`);
    check(!(r.status === 403 && r.json?.code === "FORBIDDEN"), "ops not rejected for missing permission", JSON.stringify(r.json).slice(0, 80));
    r = await call(cookies.ops, "/api/restaurant/settings", "PATCH", { orderSound: true });
    check(r.status === 403, "settings.operations cannot change sounds/bill settings", `status ${r.status}`);
    r = await call(cookies.ops, "/api/restaurant/settings", "PATCH", { acceptingOrders: accepting, orderSound: true });
    check(r.status === 403, "mixed patch needs full settings.update", `status ${r.status}`);
    r = await call(cookies.sview, "/api/restaurant/settings", "PATCH", { acceptingOrders: accepting });
    check(r.status === 403, "settings.view cannot flip ops switches", `status ${r.status}`);
  } finally {
    const userIds = made.map((m) => m.userId);
    await prisma.restaurantAuditLog.deleteMany({ where: { actorUserId: { in: userIds } } });
    await prisma.restaurantStaff.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.restaurantRole.deleteMany({ where: { id: { in: made.map((m) => m.roleId) } } });
    await prisma.$disconnect();
  }

  console.log(failed ? `\n${failed} FAILED` : "\nAll new-permission checks passed");
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
