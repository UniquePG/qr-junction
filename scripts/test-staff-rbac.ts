/**
 * End-to-end staff RBAC verification against local Next + Postgres.
 * Usage: npx tsx scripts/test-staff-rbac.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  ALL_PERMISSION_KEYS,
  ROLE_TEMPLATES,
  STAFF_ASSIGNABLE_KEYS,
  expandImplies,
  hasPermission,
  listPermissionGroups,
  normalizePermissionGrants,
} from "../lib/restaurant/staff/permissions";
import { SESSION_COOKIE, signSessionToken } from "../lib/session";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();

type Result = { ok: boolean; name: string; detail: string };
const results: Result[] = [];

function pass(name: string, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name: string, detail = "") {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}
function assert(cond: unknown, name: string, detail = "") {
  if (cond) pass(name, detail);
  else fail(name, detail);
}

async function jarLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const anyHeaders = res.headers as Headers & { getSetCookie?: () => string[] };
  const setCookie = typeof anyHeaders.getSetCookie === "function" ? anyHeaders.getSetCookie() : [];
  let cookie =
    setCookie
      .map((c) => c.split(";")[0])
      .filter(Boolean)
      .join("; ") || "";
  if (!cookie) {
    const raw = res.headers.get("set-cookie") || "";
    cookie = raw.split(";")[0] || "";
  }
  const json = await res.json().catch(() => ({}));
  return { res, json, cookie };
}

async function api(cookie: string, path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      ...(opts.body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
      ...(opts.headers || {}),
    },
  });
  const json = await res.json().catch(() => null);
  return { res, json, status: res.status };
}

function unitTests() {
  console.log("\n=== Permission registry unit checks ===");
  assert(ROLE_TEMPLATES.some((t) => t.id === "empty" && t.permissions.length === 0), "Empty template has zero permissions");
  const kitchen = ROLE_TEMPLATES.find((t) => t.id === "kitchen");
  assert(Boolean(kitchen), "Kitchen template exists");
  assert(kitchen?.permissions.includes("menu.view"), "Kitchen includes menu.view");
  assert(kitchen?.permissions.includes("menu.update"), "Kitchen includes menu.update");
  assert(kitchen?.permissions.includes("orders.update"), "Kitchen includes orders.update");
  assert(kitchen?.permissions.includes("waiter.ack"), "Kitchen includes waiter.ack");
  assert(!kitchen?.permissions.includes("billing.view"), "Kitchen excludes billing.view");

  const manager = ROLE_TEMPLATES.find((t) => t.id === "manager");
  assert(manager?.permissions.includes("staff.manage"), "Manager includes staff.manage");
  assert(!manager?.permissions.includes("billing.view"), "Manager excludes billing.view");

  const cashier = ROLE_TEMPLATES.find((t) => t.id === "cashier");
  assert(cashier?.permissions.includes("orders.pay"), "Cashier includes orders.pay");
  assert(cashier?.permissions.includes("orders.bill"), "Cashier includes orders.bill");
  assert(!cashier?.permissions.includes("menu.update"), "Cashier excludes menu.update");

  const waiter = ROLE_TEMPLATES.find((t) => t.id === "waiter");
  assert(waiter?.permissions.includes("waiter.ack"), "Waiter includes waiter.ack");
  assert(waiter?.permissions.includes("orders.view"), "Waiter includes orders.view");
  assert(!waiter?.permissions.includes("orders.update"), "Waiter excludes orders.update");

  const host = ROLE_TEMPLATES.find((t) => t.id === "host");
  assert(host?.permissions.includes("tables.manage"), "Host includes tables.manage");
  assert(host?.permissions.includes("waiter.view"), "Host includes waiter.view");

  const expanded = expandImplies(["menu.update"]);
  assert(expanded.includes("menu.view") && expanded.includes("menu.update"), "expandImplies pulls menu.view from menu.update");

  const normalized = normalizePermissionGrants(["menu.update", "billing.view", "not.a.key"]);
  assert(normalized.includes("menu.view"), "normalize expands implies");
  assert(!normalized.includes("billing.view"), "normalize strips ownerOnly billing.view");
  assert(!normalized.includes("not.a.key" as never), "normalize drops unknown keys");

  assert(hasPermission(["orders.update"], "orders.view"), "hasPermission honors implies");
  assert(!hasPermission(["orders.view"], "orders.update"), "hasPermission denies missing higher grant");
  assert(hasPermission("ALL", "billing.view"), "ALL grants everything");

  const groups = listPermissionGroups({ includeOwnerOnly: false });
  assert(groups.every((g) => g.permissions.every((p) => !p.ownerOnly)), "Assignable groups hide ownerOnly");
  assert(STAFF_ASSIGNABLE_KEYS.length < ALL_PERMISSION_KEYS.length, "Assignable keys fewer than all keys");
}

async function sessionCookieFor(userId: number) {
  const token = await signSessionToken(userId);
  return `${SESSION_COOKIE}=${token}`;
}

const E2E_ROLE_NAMES = [
  "E2E Kitchen",
  "E2E Empty",
  "E2E Cashier",
  "E2E Manager",
  "E2E Waiter",
  "E2E Host",
];

async function cleanupTestArtifacts(restaurantId: number, emails: string[]) {
  const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await prisma.restaurantStaff.deleteMany({ where: { userId: { in: ids } } });
    await prisma.restaurantAuditLog.deleteMany({ where: { actorUserId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.restaurantRole.deleteMany({
    where: {
      restaurantId,
      name: { in: E2E_ROLE_NAMES },
    },
  });
}

type GateExpect = { path: string; method?: string; body?: unknown; allow: boolean; name: string };

async function assertGates(cookie: string, label: string, gates: GateExpect[]) {
  for (const gate of gates) {
    const { status } = await api(cookie, gate.path, {
      method: gate.method || "GET",
      ...(gate.body !== undefined ? { body: JSON.stringify(gate.body) } : {}),
    });
    if (gate.allow) {
      assert(status >= 200 && status < 300, `${label} allowed: ${gate.name}`, `status ${status}`);
    } else {
      assert(status === 403 || status === 404, `${label} denied: ${gate.name}`, `status ${status}`);
    }
  }
}

function printSummary() {
  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);
  console.log(`\n=== Summary: ${passed.length} passed, ${failed.length} failed ===`);
  if (failed.length) {
    for (const f of failed) console.error(` - ${f.name}: ${f.detail}`);
  }
}

async function main() {
  unitTests();

  console.log("\n=== Locate owner restaurant ===");
  const restaurant = await prisma.restaurant.findFirst({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { id: "asc" },
  });
  if (!restaurant?.user?.email) {
    fail("owner restaurant exists", "No restaurant found in DB");
    printSummary();
    process.exit(1);
  }
  pass("owner restaurant exists", `${restaurant.name} (#${restaurant.id}) / ${restaurant.user.email}`);

  const stamp = Date.now();
  const staffKitchenEmail = `e2e.kitchen.${stamp}@example.com`;
  const staffCashierEmail = `e2e.cashier.${stamp}@example.com`;
  const managerEmail = `e2e.manager.${stamp}@example.com`;
  const waiterEmail = `e2e.waiter.${stamp}@example.com`;
  const hostEmail = `e2e.host.${stamp}@example.com`;
  const emptyEmail = `e2e.empty.${stamp}@example.com`;
  const staffEmails = [
    staffKitchenEmail,
    staffCashierEmail,
    managerEmail,
    waiterEmail,
    hostEmail,
    emptyEmail,
  ];

  await cleanupTestArtifacts(restaurant.id, staffEmails);
  // Ensure owner can pass getDbUserIdFromRequest (verified email).
  await prisma.user.update({
    where: { id: restaurant.user.id },
    data: { emailVerified: true },
  });

  console.log("\n=== Owner session + me ===");
  const ownerCookie = await sessionCookieFor(restaurant.user.id);
  assert(Boolean(ownerCookie), "owner session cookie minted");
  const me = await api(ownerCookie, "/api/auth/me");
  assert(me.status === 200, "owner /api/auth/me", `status ${me.status}`);
  assert(me.json?.restaurantAccess?.kind === "owner", "me.restaurantAccess.kind=owner");
  assert(me.json?.restaurantAccess?.restaurantId === restaurant.id, "me restaurantId matches");

  console.log("\n=== Roles: templates + CRUD ===");
  const perms = await api(ownerCookie, "/api/restaurant/staff/permissions");
  assert(perms.status === 200, "GET staff permissions catalog", `status ${perms.status} ${JSON.stringify(perms.json)?.slice(0, 120)}`);
  assert(Array.isArray(perms.json?.templates) && perms.json.templates.length >= 6, "catalog has 6 templates");
  assert(perms.json?.templates?.some((t: { id: string }) => t.id === "empty"), "catalog includes empty template");
  assert(Array.isArray(perms.json?.groups) && perms.json.groups.length > 0, "catalog has permission groups");

  const kitchenTpl = ROLE_TEMPLATES.find((t) => t.id === "kitchen")!;
  const createKitchen = await api(ownerCookie, "/api/restaurant/staff/roles", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Kitchen",
      templateId: "kitchen",
      permissions: kitchenTpl.permissions,
      description: "e2e kitchen",
    }),
  });
  assert(createKitchen.status === 201, "create Kitchen role", `status ${createKitchen.status} ${JSON.stringify(createKitchen.json)}`);
  const kitchenRoleId = createKitchen.json?.role?.id as number | undefined;
  assert(Boolean(kitchenRoleId), "kitchen role id returned");
  assert((createKitchen.json?.role?.permissions || []).includes("menu.update"), "created kitchen role has menu.update");

  const createEmpty = await api(ownerCookie, "/api/restaurant/staff/roles", {
    method: "POST",
    body: JSON.stringify({ name: "E2E Empty", templateId: "empty", permissions: [] }),
  });
  assert(createEmpty.status === 201, "create Empty role");
  assert((createEmpty.json?.role?.permissions || []).length === 0, "empty role grants none");

  const cashierTpl = ROLE_TEMPLATES.find((t) => t.id === "cashier")!;
  const createCashier = await api(ownerCookie, "/api/restaurant/staff/roles", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Cashier",
      templateId: "cashier",
      permissions: cashierTpl.permissions,
    }),
  });
  assert(createCashier.status === 201, "create Cashier role");
  const cashierRoleId = createCashier.json?.role?.id as number | undefined;

  const rolesList = await api(ownerCookie, "/api/restaurant/staff/roles");
  assert(rolesList.status === 200, "list roles");
  assert((rolesList.json?.roles || []).some((r: { name: string }) => r.name === "E2E Kitchen"), "kitchen role listed");

  console.log("\n=== Staff create + seats ===");
  const staffBefore = await api(ownerCookie, "/api/restaurant/staff");
  assert(staffBefore.status === 200, "list staff (owner)");
  const usedBefore = Number(staffBefore.json?.seats?.used || 0);

  const createKitchenStaff = await api(ownerCookie, "/api/restaurant/staff", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Kitchen Staff",
      email: staffKitchenEmail,
      password: "StaffPass!234",
      roleId: kitchenRoleId,
      phone: "9999990001",
    }),
  });
  assert(
    createKitchenStaff.status === 201,
    "create kitchen staff",
    `status ${createKitchenStaff.status} ${JSON.stringify(createKitchenStaff.json)}`,
  );
  const kitchenStaffId = createKitchenStaff.json?.staff?.id as number | undefined;

  const createCashierStaff = await api(ownerCookie, "/api/restaurant/staff", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Cashier Staff",
      email: staffCashierEmail,
      password: "StaffPass!234",
      roleId: cashierRoleId,
    }),
  });
  assert(
    createCashierStaff.status === 201 || createCashierStaff.status === 402,
    "create cashier staff or hit seat quota",
    `status ${createCashierStaff.status} ${JSON.stringify(createCashierStaff.json)}`,
  );

  const staffAfter = await api(ownerCookie, "/api/restaurant/staff");
  const usedAfter = Number(staffAfter.json?.seats?.used || 0);
  assert(usedAfter >= usedBefore + 1, "seat usage increased after staff create", `${usedBefore} → ${usedAfter}`);

  console.log("\n=== Staff login landing ===");
  const kitchenLogin = await jarLogin(staffKitchenEmail, "StaffPass!234");
  assert(kitchenLogin.res.ok, "kitchen staff login", `status ${kitchenLogin.res.status}`);
  const kitchenMe = await api(kitchenLogin.cookie, "/api/auth/me");
  assert(kitchenMe.json?.restaurantAccess?.kind === "staff", "kitchen me kind=staff");
  assert(kitchenMe.json?.restaurantAccess?.restaurantId === restaurant.id, "kitchen me restaurantId");
  const kitchenPerms: string[] = kitchenMe.json?.restaurantAccess?.permissions || [];
  assert(kitchenPerms.includes("orders.update"), "kitchen session has orders.update");
  assert(kitchenPerms.includes("menu.view"), "kitchen session has menu.view");
  assert(!kitchenPerms.includes("billing.view"), "kitchen session lacks billing.view");
  assert(!kitchenPerms.includes("staff.manage"), "kitchen session lacks staff.manage");

  console.log("\n=== Permission gates (kitchen staff) ===");
  const kOrders = await api(kitchenLogin.cookie, "/api/restaurant/orders");
  assert(kOrders.status === 200, "kitchen can GET orders", `status ${kOrders.status}`);

  const kMenus = await api(kitchenLogin.cookie, "/api/restaurant/menus");
  assert(kMenus.status === 200, "kitchen can GET menus", `status ${kMenus.status}`);

  const kWaiter = await api(kitchenLogin.cookie, "/api/restaurant/waiter-requests");
  assert(kWaiter.status === 200, "kitchen can GET waiter requests", `status ${kWaiter.status}`);

  const kStaffDeny = await api(kitchenLogin.cookie, "/api/restaurant/staff");
  assert(kStaffDeny.status === 403, "kitchen denied staff list", `status ${kStaffDeny.status}`);

  const kRolesDeny = await api(kitchenLogin.cookie, "/api/restaurant/staff/roles");
  assert(kRolesDeny.status === 403, "kitchen denied roles list", `status ${kRolesDeny.status}`);

  const kSettingsPatch = await api(kitchenLogin.cookie, "/api/restaurant/settings", {
    method: "PATCH",
    body: JSON.stringify({ orderSound: true }),
  });
  assert(kSettingsPatch.status === 403, "kitchen denied settings.update", `status ${kSettingsPatch.status}`);

  const kLogsDeny = await api(kitchenLogin.cookie, "/api/restaurant/logs");
  assert(kLogsDeny.status === 403, "kitchen denied logs", `status ${kLogsDeny.status}`);

  const kPermsCatalog = await api(kitchenLogin.cookie, "/api/restaurant/staff/permissions");
  assert(kPermsCatalog.status === 403, "kitchen denied permissions catalog", `status ${kPermsCatalog.status}`);

  if (createCashierStaff.status === 201) {
    console.log("\n=== Permission gates (cashier staff) ===");
    const cashierLogin = await jarLogin(staffCashierEmail, "StaffPass!234");
    assert(cashierLogin.res.ok, "cashier staff login");
    const cMe = await api(cashierLogin.cookie, "/api/auth/me");
    const cPerms: string[] = cMe.json?.restaurantAccess?.permissions || [];
    assert(cPerms.includes("orders.pay"), "cashier has orders.pay");
    assert(!cPerms.includes("menu.update"), "cashier lacks menu.update");

    const cOrders = await api(cashierLogin.cookie, "/api/restaurant/orders?view=finished&status=unpaid");
    assert(cOrders.status === 200, "cashier can GET finished orders", `status ${cOrders.status}`);

    const cMenusDeny = await api(cashierLogin.cookie, "/api/restaurant/menus");
    assert(cMenusDeny.status === 403, "cashier denied menus", `status ${cMenusDeny.status}`);

    const cWaiterDeny = await api(cashierLogin.cookie, "/api/restaurant/waiter-requests");
    assert(cWaiterDeny.status === 403, "cashier denied waiter list", `status ${cWaiterDeny.status}`);
  }

  console.log("\n=== All templates: Manager / Waiter / Host / Empty ===");
  const managerTpl = ROLE_TEMPLATES.find((t) => t.id === "manager")!;
  const waiterTpl = ROLE_TEMPLATES.find((t) => t.id === "waiter")!;
  const hostTpl = ROLE_TEMPLATES.find((t) => t.id === "host")!;

  const createManager = await api(ownerCookie, "/api/restaurant/staff/roles", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Manager",
      templateId: "manager",
      permissions: managerTpl.permissions,
    }),
  });
  assert(createManager.status === 201, "create Manager role", `status ${createManager.status}`);
  assert((createManager.json?.role?.permissions || []).includes("staff.manage"), "manager role has staff.manage");
  assert(!(createManager.json?.role?.permissions || []).includes("billing.view"), "manager role lacks billing.view");

  const createWaiter = await api(ownerCookie, "/api/restaurant/staff/roles", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Waiter",
      templateId: "waiter",
      permissions: waiterTpl.permissions,
    }),
  });
  assert(createWaiter.status === 201, "create Waiter role");
  assert((createWaiter.json?.role?.permissions || []).includes("waiter.ack"), "waiter role has waiter.ack");
  assert(!(createWaiter.json?.role?.permissions || []).includes("orders.update"), "waiter role lacks orders.update");

  const createHost = await api(ownerCookie, "/api/restaurant/staff/roles", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Host",
      templateId: "host",
      permissions: hostTpl.permissions,
    }),
  });
  assert(createHost.status === 201, "create Host role");
  assert((createHost.json?.role?.permissions || []).includes("tables.manage"), "host role has tables.manage");
  assert(!(createHost.json?.role?.permissions || []).includes("orders.view"), "host role lacks orders.view");

  const emptyRoleId = createEmpty.json?.role?.id as number | undefined;
  const managerRoleId = createManager.json?.role?.id as number | undefined;
  const waiterRoleId = createWaiter.json?.role?.id as number | undefined;
  const hostRoleId = createHost.json?.role?.id as number | undefined;

  async function createStaffNamed(name: string, email: string, roleId: number | undefined) {
    if (!roleId) return { status: 0, json: null as any };
    return api(ownerCookie, "/api/restaurant/staff", {
      method: "POST",
      body: JSON.stringify({ name, email, password: "StaffPass!234", roleId }),
    });
  }

  const mgrStaff = await createStaffNamed("E2E Manager Staff", managerEmail, managerRoleId);
  const waiterStaff = await createStaffNamed("E2E Waiter Staff", waiterEmail, waiterRoleId);
  const hostStaff = await createStaffNamed("E2E Host Staff", hostEmail, hostRoleId);
  const emptyStaff = await createStaffNamed("E2E Empty Staff", emptyEmail, emptyRoleId);

  assert(
    mgrStaff.status === 201 || mgrStaff.status === 402,
    "create manager staff or seat quota",
    `status ${mgrStaff.status}`,
  );
  assert(
    waiterStaff.status === 201 || waiterStaff.status === 402,
    "create waiter staff or seat quota",
    `status ${waiterStaff.status}`,
  );
  assert(
    hostStaff.status === 201 || hostStaff.status === 402,
    "create host staff or seat quota",
    `status ${hostStaff.status}`,
  );
  assert(
    emptyStaff.status === 201 || emptyStaff.status === 402,
    "create empty staff or seat quota",
    `status ${emptyStaff.status}`,
  );

  if (mgrStaff.status === 201) {
    const login = await jarLogin(managerEmail, "StaffPass!234");
    assert(login.res.ok, "manager staff login");
    const meMgr = await api(login.cookie, "/api/auth/me");
    const perms: string[] = meMgr.json?.restaurantAccess?.permissions || [];
    assert(perms.includes("staff.manage"), "manager session has staff.manage");
    assert(perms.includes("roles.manage"), "manager session has roles.manage");
    assert(perms.includes("settings.update"), "manager session has settings.update");
    assert(!perms.includes("billing.view"), "manager session lacks billing.view");
    await assertGates(login.cookie, "manager", [
      { path: "/api/restaurant/staff", allow: true, name: "staff list" },
      { path: "/api/restaurant/staff/roles", allow: true, name: "roles list" },
      { path: "/api/restaurant/staff/permissions", allow: true, name: "permissions catalog" },
      { path: "/api/restaurant/logs?pageSize=10", allow: true, name: "logs" },
      { path: "/api/restaurant/menus", allow: true, name: "menus" },
      { path: "/api/restaurant/tables", allow: true, name: "tables" },
      { path: "/api/restaurant/offers", allow: true, name: "offers" },
      { path: "/api/restaurant/settings", allow: true, name: "settings view" },
      { path: "/api/restaurant/profile", allow: true, name: "profile view" },
      { path: "/api/restaurant/orders", allow: true, name: "orders" },
      { path: "/api/restaurant/waiter-requests", allow: true, name: "waiter" },
    ]);
  }

  if (waiterStaff.status === 201) {
    const login = await jarLogin(waiterEmail, "StaffPass!234");
    assert(login.res.ok, "waiter staff login");
    const meW = await api(login.cookie, "/api/auth/me");
    const perms: string[] = meW.json?.restaurantAccess?.permissions || [];
    assert(perms.includes("waiter.ack"), "waiter session has waiter.ack");
    assert(perms.includes("orders.view"), "waiter session has orders.view");
    assert(!perms.includes("orders.update"), "waiter session lacks orders.update");
    assert(!perms.includes("menu.view"), "waiter session lacks menu.view");
    await assertGates(login.cookie, "waiter", [
      { path: "/api/restaurant/orders", allow: true, name: "orders" },
      { path: "/api/restaurant/waiter-requests", allow: true, name: "waiter list" },
      { path: "/api/restaurant/menus", allow: false, name: "menus" },
      { path: "/api/restaurant/tables", allow: false, name: "tables" },
      { path: "/api/restaurant/staff", allow: false, name: "staff" },
      { path: "/api/restaurant/settings", allow: false, name: "settings" },
      { path: "/api/restaurant/logs?pageSize=5", allow: false, name: "logs" },
      { path: "/api/restaurant/offers", allow: false, name: "offers" },
    ]);
  }

  if (hostStaff.status === 201) {
    const login = await jarLogin(hostEmail, "StaffPass!234");
    assert(login.res.ok, "host staff login");
    const meH = await api(login.cookie, "/api/auth/me");
    const perms: string[] = meH.json?.restaurantAccess?.permissions || [];
    assert(perms.includes("tables.manage"), "host session has tables.manage");
    assert(perms.includes("waiter.view"), "host session has waiter.view");
    assert(!perms.includes("orders.view"), "host session lacks orders.view");
    assert(!perms.includes("menu.view"), "host session lacks menu.view");
    await assertGates(login.cookie, "host", [
      { path: "/api/restaurant/tables", allow: true, name: "tables" },
      { path: "/api/restaurant/waiter-requests", allow: true, name: "waiter list" },
      { path: "/api/restaurant/orders", allow: false, name: "orders" },
      { path: "/api/restaurant/menus", allow: false, name: "menus" },
      { path: "/api/restaurant/staff", allow: false, name: "staff" },
      { path: "/api/restaurant/profile", allow: false, name: "profile" },
    ]);
  }

  if (emptyStaff.status === 201) {
    const login = await jarLogin(emptyEmail, "StaffPass!234");
    assert(login.res.ok, "empty staff login");
    const meE = await api(login.cookie, "/api/auth/me");
    const perms: string[] = meE.json?.restaurantAccess?.permissions || [];
    assert(perms.length === 0, "empty session has zero permissions", perms.join(","));
    await assertGates(login.cookie, "empty", [
      { path: "/api/restaurant/orders", allow: false, name: "orders" },
      { path: "/api/restaurant/menus", allow: false, name: "menus" },
      { path: "/api/restaurant/tables", allow: false, name: "tables" },
      { path: "/api/restaurant/waiter-requests", allow: false, name: "waiter" },
      { path: "/api/restaurant/staff", allow: false, name: "staff" },
      { path: "/api/restaurant/settings", allow: false, name: "settings" },
      { path: "/api/restaurant/logs?pageSize=5", allow: false, name: "logs" },
      { path: "/api/restaurant/offers", allow: false, name: "offers" },
      { path: "/api/restaurant/profile", allow: false, name: "profile" },
    ]);
  }

  console.log("\n=== Kitchen matrix extras ===");
  await assertGates(kitchenLogin.cookie, "kitchen+", [
    { path: "/api/restaurant/tables", allow: false, name: "tables" },
    { path: "/api/restaurant/offers", allow: false, name: "offers" },
    { path: "/api/restaurant/profile", allow: false, name: "profile" },
    { path: "/api/restaurant/settings", allow: false, name: "settings view" },
    { path: "/api/restaurant/stats", allow: false, name: "analytics" },
  ]);

  console.log("\n=== Disable staff ===");
  if (kitchenStaffId) {
    const disable = await api(ownerCookie, `/api/restaurant/staff/${kitchenStaffId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "DISABLED" }),
    });
    assert(disable.status === 200, "owner disables kitchen staff");
    const disabledMe = await api(kitchenLogin.cookie, "/api/auth/me");
    assert(disabledMe.json?.restaurantAccess == null, "disabled staff loses restaurantAccess", JSON.stringify(disabledMe.json?.restaurantAccess));
    const disabledOrders = await api(kitchenLogin.cookie, "/api/restaurant/orders");
    // Disabled staff sessions are rejected outright (401); 403/404 also acceptable.
    assert([401, 403, 404].includes(disabledOrders.status), "disabled staff cannot load orders", `status ${disabledOrders.status}`);

    const reenable = await api(ownerCookie, `/api/restaurant/staff/${kitchenStaffId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    assert(reenable.status === 200 || reenable.status === 402, "re-enable staff (or seat quota)", `status ${reenable.status}`);
  }

  console.log("\n=== Audit logs ===");
  const logs = await api(ownerCookie, "/api/restaurant/logs?pageSize=50");
  assert(logs.status === 200, "owner can read logs");
  const actions = (logs.json?.logs || []).map((l: { action: string }) => l.action);
  assert(actions.includes("role.create") || actions.includes("staff.create"), "logs contain role/staff create", actions.slice(0, 8).join(","));

  console.log("\n=== Cleanup ===");
  await cleanupTestArtifacts(restaurant.id, staffEmails);
  pass("cleanup test staff/roles");

  printSummary();
  await prisma.$disconnect();
  process.exit(results.some((r) => !r.ok) ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
