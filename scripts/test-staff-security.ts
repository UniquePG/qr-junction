/**
 * Security/readiness probes for staff management.
 * Usage: $env:TEST_BASE_URL="http://localhost:3000"; npx tsx scripts/test-staff-security.ts
 * Creates temporary users/roles in the DB and removes them afterwards.
 */
import { PrismaClient } from "@prisma/client";
import { expandImplies, type StaffPermissionKey } from "../lib/restaurant/staff/permissions";
import { hashPassword } from "../lib/password";
import { SESSION_COOKIE, signSessionToken } from "../lib/session";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();
let failed = 0;

function check(ok: boolean, name: string, detail = "") {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function call(cookie: string, path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { cookie, "content-type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as any };
}

async function main() {
  const restaurant = await prisma.restaurant.findFirst({ orderBy: { id: "asc" }, select: { id: true, userId: true } });
  if (!restaurant) throw new Error("no restaurant");
  const stamp = Date.now();
  const userIds: number[] = [];
  const roleIds: number[] = [];

  const mkRole = async (name: string, perms: StaffPermissionKey[]) => {
    const role = await prisma.restaurantRole.create({
      data: { restaurantId: restaurant.id, name: `E2E SEC ${name} ${stamp}`, permissions: expandImplies(perms) },
    });
    roleIds.push(role.id);
    return role;
  };
  const mkStaff = async (key: string, roleId: number, status: "ACTIVE" | "DISABLED" = "ACTIVE") => {
    const user = await prisma.user.create({
      data: {
        email: `e2e.sec.${key}.${stamp}@example.com`,
        name: key,
        emailVerified: true,
        provider: "staff",
        passwordHash: await hashPassword("StaffPass!234"),
      },
    });
    userIds.push(user.id);
    const staff = await prisma.restaurantStaff.create({
      data: { restaurantId: restaurant.id, userId: user.id, roleId, displayName: key, status, createdByUserId: restaurant.userId },
    });
    return { user, staff, cookie: `${SESSION_COOKIE}=${await signSessionToken(user.id)}` };
  };

  try {
    const lowRole = await mkRole("low", ["staff.manage", "orders.view"]);
    const highRole = await mkRole("high", ["staff.manage", "roles.manage", "settings.update", "menu.update", "logs.view"]);
    const rolesRoleLow = await mkRole("rolesonly", ["roles.manage"]);

    const mgr = await mkStaff("mgr", lowRole.id); // can manage staff, little else
    const boss = await mkStaff("boss", highRole.id); // higher privileges
    const roleEditor = await mkStaff("roleeditor", rolesRoleLow.id);

    // A1: staff.manage user promoting themselves to a higher role
    let r = await call(mgr.cookie, `/api/restaurant/staff/${mgr.staff.id}`, "PATCH", { roleId: highRole.id });
    check(r.status === 403, "staff cannot assign themselves a role above their own", `status ${r.status}`);

    // A2: staff.manage user resetting password of higher-privileged staff
    r = await call(mgr.cookie, `/api/restaurant/staff/${boss.staff.id}`, "PATCH", { password: "Hijacked!234" });
    check(r.status === 403, "staff cannot reset password of higher-privileged staff", `status ${r.status}`);

    // A3: staff.manage user disabling a higher-privileged staff
    r = await call(mgr.cookie, `/api/restaurant/staff/${boss.staff.id}`, "PATCH", { status: "DISABLED" });
    check(r.status === 403, "staff cannot disable higher-privileged staff", `status ${r.status}`);

    // A4: staff cannot disable themselves (lock-out)
    r = await call(mgr.cookie, `/api/restaurant/staff/${mgr.staff.id}`, "PATCH", { status: "DISABLED" });
    check(r.status === 403, "staff cannot disable their own account", `status ${r.status}`);

    // A5: roles.manage user granting permissions beyond their own
    r = await call(roleEditor.cookie, `/api/restaurant/staff/roles/${rolesRoleLow.id}`, "PATCH", {
      permissions: ["roles.manage", "settings.update", "menu.delete"],
    });
    check(r.status === 403, "staff cannot grant permissions they do not hold", `status ${r.status}`);
    const reread = await prisma.restaurantRole.findUnique({ where: { id: rolesRoleLow.id }, select: { permissions: true } });
    check(!(reread?.permissions as string[]).includes("settings.update"), "role not escalated in DB");

    // A6: roles.manage user editing a role stronger than theirs
    r = await call(roleEditor.cookie, `/api/restaurant/staff/roles/${highRole.id}`, "PATCH", { name: `E2E SEC renamed ${stamp}` });
    check(r.status === 403, "staff cannot edit a role stronger than their own", `status ${r.status}`);

    // Owner can still do all of it
    const ownerCookie = `${SESSION_COOKIE}=${await signSessionToken(restaurant.userId)}`;
    r = await call(ownerCookie, `/api/restaurant/staff/${boss.staff.id}`, "PATCH", { roleId: lowRole.id });
    check(r.status === 200, "owner can still change any staff role", `status ${r.status}`);

    // B: disabled staff are blocked from signing in as a regular platform user
    const disabled = await mkStaff("disabled", lowRole.id, "DISABLED");
    const login = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: disabled.user.email, password: "StaffPass!234" }),
    });
    check(login.status === 401 || login.status === 403, "disabled staff cannot sign in", `status ${login.status}`);
    const me = await call(disabled.cookie, "/api/auth/me");
    check(me.status === 401 || me.status === 403, "existing session of disabled staff is rejected", `status ${me.status}`);

    // D: removal
    const removable = await mkStaff("removable", lowRole.id);
    const boss2 = await mkStaff("boss2", highRole.id); // (boss was demoted by the owner test above)
    r = await call(mgr.cookie, `/api/restaurant/staff/${boss2.staff.id}`, "DELETE");
    check(r.status === 403, "staff cannot remove higher-privileged staff", `status ${r.status}`);
    r = await call(mgr.cookie, `/api/restaurant/staff/${mgr.staff.id}`, "DELETE");
    check(r.status === 403, "staff cannot remove themselves", `status ${r.status}`);
    r = await call(ownerCookie, `/api/restaurant/staff/${removable.staff.id}`, "DELETE");
    check(r.status === 200, "owner can remove staff", `status ${r.status}`);
    const gone = await prisma.restaurantStaff.findUnique({ where: { id: removable.staff.id } });
    check(!gone, "membership deleted");
    const keepUser = await prisma.user.findUnique({ where: { id: removable.user.id } });
    check(Boolean(keepUser), "login account kept so audit history stays intact");
    const loginRemoved = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: removable.user.email, password: "StaffPass!234" }),
    });
    check(loginRemoved.status === 403, "removed staff cannot sign in", `status ${loginRemoved.status}`);

    // Takeover protection: cannot attach (and re-password) a normal self-registered account
    const normal = await prisma.user.create({
      data: { email: `e2e.sec.normal.${stamp}@example.com`, name: "Normal", emailVerified: true, provider: "password", passwordHash: await hashPassword("MyOwnPass!234") },
    });
    userIds.push(normal.id);
    r = await call(ownerCookie, "/api/restaurant/staff", "POST", { name: "Normal", email: normal.email, password: "Takeover!234", roleId: lowRole.id });
    check(r.status === 409, "cannot add a normal registered account as staff (no takeover)", `status ${r.status}`);

    // Low-access staff list/permissions are narrowed to what they hold
    const permsRes = await call(roleEditor.cookie, "/api/restaurant/staff/permissions");
    const keys: string[] = (permsRes.json.groups || []).flatMap((g: any) => g.permissions.map((p: any) => p.key));
    check(keys.includes("roles.manage") && !keys.includes("settings.update"), "permission catalog only lists access the staff member holds", keys.join(","));
  } finally {
    await prisma.restaurantAuditLog.deleteMany({ where: { actorUserId: { in: userIds } } });
    await prisma.restaurantStaff.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.restaurantRole.deleteMany({ where: { id: { in: roleIds } } });
    await prisma.restaurantAuditLog.deleteMany({ where: { summary: { contains: "E2E SEC" } } });
    await prisma.$disconnect();
  }

  console.log(failed ? `\n${failed} FAILED` : "\nAll staff security checks passed");
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
