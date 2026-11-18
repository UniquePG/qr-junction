import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireQuota } from "@/lib/billing/guard";
import { resolveOne } from "@/lib/billing/resolve";
import { hashPassword, isPasswordPolicyOk, passwordPolicyError } from "@/lib/password";
import { auditFromContext, clientIp } from "@/lib/restaurant/audit";
import {
  RestaurantAccessError,
  requireRestaurantContext,
  requireRestaurantPermission,
  type RestaurantContext,
} from "@/lib/restaurant/access";
import {
  expandImplies,
  getRoleTemplate,
  hasPermission,
  normalizePermissionGrants,
  type StaffPermissionKey,
} from "@/lib/restaurant/staff/permissions";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

function normalizeName(name: string) {
  return String(name || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function normalizePhone(phone: string | null | undefined) {
  const value = String(phone || "").replace(/\s+/g, " ").trim().slice(0, 32);
  return value || null;
}

/**
 * Delegation guard: only the owner can hand out any permission. Staff with `staff.manage` /
 * `roles.manage` may only grant or manage access that they hold themselves, so nobody can
 * promote themselves (or take over a more powerful colleague).
 */
function assertWithinOwnAccess(ctx: RestaurantContext, permissions: Iterable<string>, message: string) {
  if (ctx.permissions === "ALL") return;
  for (const key of expandImplies([...permissions])) {
    if (!hasPermission(ctx.permissions, key)) {
      throw new RestaurantAccessError(403, "FORBIDDEN", message);
    }
  }
}

const GRANT_MESSAGE = "You can only give access that you have yourself.";
const MANAGE_MESSAGE = "You can't manage a role or person with more access than you have.";

async function activeStaffCount(restaurantId: number) {
  return prisma.restaurantStaff.count({
    where: { restaurantId, status: "ACTIVE" },
  });
}

export async function getStaffSeatUsage(ctx: RestaurantContext) {
  const used = await activeStaffCount(ctx.restaurant.id);
  return { used, restaurantId: ctx.restaurant.id, ownerUserId: ctx.ownerUserId };
}

export async function listRoles(userId: number) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "staff.view");
  const roles = await prisma.restaurantRole.findMany({
    where: { restaurantId: ctx.restaurant.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { staff: true } } },
  });
  return {
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: normalizePermissionGrants(role.permissions),
      staffCount: role._count.staff,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    })),
  };
}

export async function createRole(
  userId: number,
  input: { name: string; description?: string; permissions?: unknown; templateId?: string },
  request?: Request,
) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "roles.manage");
  const name = normalizeName(input.name);
  if (!name) throw new RestaurantAccessError(400, "VALIDATION", "Role name is required.");
  const template = input.templateId ? getRoleTemplate(input.templateId) : null;
  const permissions =
    input.permissions !== undefined
      ? normalizePermissionGrants(input.permissions)
      : template
        ? [...template.permissions]
        : [];
  assertWithinOwnAccess(ctx, permissions, GRANT_MESSAGE);
  try {
    const role = await prisma.restaurantRole.create({
      data: {
        restaurantId: ctx.restaurant.id,
        name,
        description: String(input.description || template?.description || "").trim().slice(0, 240) || null,
        permissions,
      },
    });
    auditFromContext(ctx, {
      action: "role.create",
      resourceType: "restaurant_role",
      resourceId: role.id,
      summary: `Created role “${role.name}”`,
      meta: { permissions },
      ip: request ? clientIp(request) : null,
    });
    return {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: normalizePermissionGrants(role.permissions),
        staffCount: 0,
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") {
      throw new RestaurantAccessError(409, "CONFLICT", "A role with this name already exists.");
    }
    throw error;
  }
}

export async function updateRole(
  userId: number,
  roleId: number,
  input: { name?: string; description?: string | null; permissions?: unknown },
  request?: Request,
) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "roles.manage");
  const existing = await prisma.restaurantRole.findFirst({
    where: { id: roleId, restaurantId: ctx.restaurant.id },
  });
  if (!existing) throw new RestaurantAccessError(404, "NOT_FOUND", "Role not found.");
  assertWithinOwnAccess(ctx, normalizePermissionGrants(existing.permissions), MANAGE_MESSAGE);
  const data: {
    name?: string;
    description?: string | null;
    permissions?: StaffPermissionKey[];
  } = {};
  if (input.name !== undefined) {
    const name = normalizeName(input.name);
    if (!name) throw new RestaurantAccessError(400, "VALIDATION", "Role name is required.");
    data.name = name;
  }
  if (input.description !== undefined) {
    data.description = String(input.description || "").trim().slice(0, 240) || null;
  }
  if (input.permissions !== undefined) {
    data.permissions = normalizePermissionGrants(input.permissions);
    assertWithinOwnAccess(ctx, data.permissions, GRANT_MESSAGE);
  }
  try {
    const role = await prisma.restaurantRole.update({
      where: { id: existing.id },
      data,
      include: { _count: { select: { staff: true } } },
    });
    const beforePerms = new Set<string>(normalizePermissionGrants(existing.permissions));
    const afterPerms = new Set<string>(normalizePermissionGrants(role.permissions));
    const added = [...afterPerms].filter((key) => !beforePerms.has(key));
    const removed = [...beforePerms].filter((key) => !afterPerms.has(key));
    const parts: string[] = [];
    if (existing.name !== role.name) parts.push(`renamed from “${existing.name}”`);
    if (added.length) parts.push(`+${added.length} permission${added.length === 1 ? "" : "s"}`);
    if (removed.length) parts.push(`−${removed.length} permission${removed.length === 1 ? "" : "s"}`);
    auditFromContext(ctx, {
      action: "role.update",
      resourceType: "restaurant_role",
      resourceId: role.id,
      summary: parts.length
        ? `Updated role “${role.name}” (${parts.join(", ")})`
        : `Updated role “${role.name}”`,
      meta: { permissions: normalizePermissionGrants(role.permissions), added, removed },
      ip: request ? clientIp(request) : null,
    });
    return {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: normalizePermissionGrants(role.permissions),
        staffCount: role._count.staff,
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") {
      throw new RestaurantAccessError(409, "CONFLICT", "A role with this name already exists.");
    }
    throw error;
  }
}

export async function deleteRole(userId: number, roleId: number, request?: Request) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "roles.manage");
  const existing = await prisma.restaurantRole.findFirst({
    where: { id: roleId, restaurantId: ctx.restaurant.id },
    include: { _count: { select: { staff: true } } },
  });
  if (!existing) throw new RestaurantAccessError(404, "NOT_FOUND", "Role not found.");
  assertWithinOwnAccess(ctx, normalizePermissionGrants(existing.permissions), MANAGE_MESSAGE);
  if (existing._count.staff > 0) {
    throw new RestaurantAccessError(400, "IN_USE", "Reassign staff before deleting this role.");
  }
  await prisma.restaurantRole.delete({ where: { id: existing.id } });
  auditFromContext(ctx, {
    action: "role.delete",
    resourceType: "restaurant_role",
    resourceId: existing.id,
    summary: `Deleted role “${existing.name}”`,
    ip: request ? clientIp(request) : null,
  });
  return { ok: true };
}

export async function listStaff(userId: number) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "staff.view");
  const [staff, used] = await Promise.all([
    prisma.restaurantStaff.findMany({
      where: { restaurantId: ctx.restaurant.id },
      orderBy: [{ status: "asc" }, { displayName: "asc" }],
      include: {
        user: { select: { id: true, email: true, avatarUrl: true } },
        role: { select: { id: true, name: true } },
      },
    }),
    activeStaffCount(ctx.restaurant.id),
  ]);
  let limit: number | null = null;
  try {
    const feature = await resolveOne(ctx.ownerUserId, "restaurant.staff.seats");
    if (feature.shipped && feature.quota >= 0) limit = feature.quota;
  } catch {
    limit = null;
  }
  return {
    seats: { used, limit, ownerUserId: ctx.ownerUserId },
    staff: staff.map((row) => ({
      id: row.id,
      displayName: row.displayName,
      phone: row.phone,
      avatarUrl: row.avatarUrl || row.user.avatarUrl,
      joinedAt: row.joinedAt?.toISOString() || null,
      status: row.status,
      email: row.user.email,
      userId: row.user.id,
      role: row.role,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
  };
}

export async function createStaff(
  userId: number,
  input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    roleId: number;
    avatarUrl?: string | null;
    joinedAt?: string | null;
  },
  request?: Request,
) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "staff.manage");
  if (ctx.kind !== "owner" && !ctx.permissions.has("staff.manage")) {
    throw new RestaurantAccessError(403, "FORBIDDEN", "You do not have permission for this action.");
  }

  const email = normalizeEmail(input.email);
  const displayName = normalizeName(input.name);
  if (!displayName) throw new RestaurantAccessError(400, "VALIDATION", "Name is required.");
  if (!email || !email.includes("@")) throw new RestaurantAccessError(400, "VALIDATION", "Valid email is required.");
  const policy = passwordPolicyError(input.password);
  if (policy || !isPasswordPolicyOk(input.password)) {
    throw new RestaurantAccessError(400, "VALIDATION", policy || "Invalid password.");
  }

  const role = await prisma.restaurantRole.findFirst({
    where: { id: Number(input.roleId), restaurantId: ctx.restaurant.id },
  });
  if (!role) throw new RestaurantAccessError(400, "VALIDATION", "Choose a valid role.");
  assertWithinOwnAccess(ctx, normalizePermissionGrants(role.permissions), GRANT_MESSAGE);

  const used = await activeStaffCount(ctx.restaurant.id);
  await requireQuota(ctx.ownerUserId, "restaurant.staff.seats", used);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      provider: true,
      restaurant: { select: { id: true } },
      restaurantStaff: { select: { id: true, restaurantId: true }, take: 1 },
    },
  });
  if (existingUser?.restaurant) {
    throw new RestaurantAccessError(409, "CONFLICT", "This email already owns a restaurant account.");
  }
  if (existingUser?.restaurantStaff?.length) {
    throw new RestaurantAccessError(409, "CONFLICT", "This email is already a staff member somewhere.");
  }
  // Never take over (re-password) a normal account that someone registered themselves.
  // Only logins that were created for staff and later removed can be reused.
  if (existingUser && existingUser.provider !== "staff") {
    throw new RestaurantAccessError(409, "CONFLICT", "This email already has an account. Ask them to use a different email.");
  }

  const passwordHash = await hashPassword(input.password);
  const joinedAt = input.joinedAt ? new Date(input.joinedAt) : null;
  if (joinedAt && Number.isNaN(joinedAt.getTime())) {
    throw new RestaurantAccessError(400, "VALIDATION", "Invalid joining date.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const user =
      existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: displayName,
              passwordHash,
              emailVerified: true,
              avatarUrl: input.avatarUrl || undefined,
            },
          })
        : await tx.user.create({
            data: {
              email,
              name: displayName,
              passwordHash,
              emailVerified: true,
              avatarUrl: input.avatarUrl || null,
              provider: "staff",
            },
          });

    const staff = await tx.restaurantStaff.create({
      data: {
        restaurantId: ctx.restaurant.id,
        userId: user.id,
        roleId: role.id,
        displayName,
        phone: normalizePhone(input.phone),
        avatarUrl: input.avatarUrl || null,
        joinedAt,
        status: "ACTIVE",
        createdByUserId: userId,
      },
      include: {
        user: { select: { id: true, email: true, avatarUrl: true } },
        role: { select: { id: true, name: true } },
      },
    });
    return staff;
  });

  auditFromContext(ctx, {
    action: "staff.create",
    resourceType: "restaurant_staff",
    resourceId: result.id,
    summary: `Added staff “${result.displayName}” (${result.user.email})`,
    meta: { roleId: role.id, roleName: role.name },
    ip: request ? clientIp(request) : null,
  });

  return {
    staff: {
      id: result.id,
      displayName: result.displayName,
      phone: result.phone,
      avatarUrl: result.avatarUrl || result.user.avatarUrl,
      joinedAt: result.joinedAt?.toISOString() || null,
      status: result.status,
      email: result.user.email,
      userId: result.user.id,
      role: result.role,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    },
  };
}

export async function updateStaff(
  userId: number,
  staffId: number,
  input: {
    name?: string;
    phone?: string | null;
    roleId?: number;
    avatarUrl?: string | null;
    joinedAt?: string | null;
    status?: "ACTIVE" | "DISABLED";
    password?: string;
  },
  request?: Request,
) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "staff.manage");
  const existing = await prisma.restaurantStaff.findFirst({
    where: { id: staffId, restaurantId: ctx.restaurant.id },
    include: {
      user: { select: { id: true, email: true } },
      role: { select: { permissions: true } },
    },
  });
  if (!existing) throw new RestaurantAccessError(404, "NOT_FOUND", "Staff member not found.");

  if (ctx.kind !== "owner") {
    const isSelf = existing.userId === ctx.actorUserId;
    const roleChange = input.roleId != null && Number(input.roleId) !== existing.roleId;
    const statusChange = input.status != null && input.status !== existing.status;
    if (isSelf && (roleChange || statusChange || input.password)) {
      throw new RestaurantAccessError(
        403,
        "FORBIDDEN",
        "You can't change your own role, status or password here. Ask the owner or another manager.",
      );
    }
    // Can't touch (reset, disable, re-role) someone who has more access than you.
    assertWithinOwnAccess(ctx, normalizePermissionGrants(existing.role.permissions), MANAGE_MESSAGE);
  }

  if (input.status === "ACTIVE" && existing.status !== "ACTIVE") {
    const used = await activeStaffCount(ctx.restaurant.id);
    await requireQuota(ctx.ownerUserId, "restaurant.staff.seats", used);
  }

  if (input.roleId != null) {
    const role = await prisma.restaurantRole.findFirst({
      where: { id: Number(input.roleId), restaurantId: ctx.restaurant.id },
    });
    if (!role) throw new RestaurantAccessError(400, "VALIDATION", "Choose a valid role.");
    assertWithinOwnAccess(ctx, normalizePermissionGrants(role.permissions), GRANT_MESSAGE);
  }

  if (input.password) {
    const policy = passwordPolicyError(input.password);
    if (policy || !isPasswordPolicyOk(input.password)) {
      throw new RestaurantAccessError(400, "VALIDATION", policy || "Invalid password.");
    }
  }

  const joinedAt =
    input.joinedAt === undefined
      ? undefined
      : input.joinedAt
        ? new Date(input.joinedAt)
        : null;
  if (joinedAt && Number.isNaN(joinedAt.getTime())) {
    throw new RestaurantAccessError(400, "VALIDATION", "Invalid joining date.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.password || input.name !== undefined || input.avatarUrl !== undefined) {
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          ...(input.name !== undefined ? { name: normalizeName(input.name) } : {}),
          ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
          ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
        },
      });
    }
    return tx.restaurantStaff.update({
      where: { id: existing.id },
      data: {
        ...(input.name !== undefined ? { displayName: normalizeName(input.name) } : {}),
        ...(input.phone !== undefined ? { phone: normalizePhone(input.phone) } : {}),
        ...(input.roleId != null ? { roleId: Number(input.roleId) } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
        ...(joinedAt !== undefined ? { joinedAt } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
      include: {
        user: { select: { id: true, email: true, avatarUrl: true } },
        role: { select: { id: true, name: true } },
      },
    });
  });

  const changes: string[] = [];
  if (input.status && input.status !== existing.status) {
    changes.push(input.status === "DISABLED" ? "disabled" : "re-enabled");
  }
  if (input.roleId != null && Number(input.roleId) !== existing.roleId) {
    changes.push(`role → ${updated.role.name}`);
  }
  if (input.password) changes.push("password reset");
  if (input.name !== undefined) changes.push("name");
  if (input.phone !== undefined) changes.push("phone");
  if (input.avatarUrl !== undefined) changes.push("photo");
  if (joinedAt !== undefined) changes.push("joining date");

  auditFromContext(ctx, {
    action:
      input.status && input.status !== existing.status
        ? input.status === "DISABLED"
          ? "staff.disable"
          : "staff.enable"
        : input.password
          ? "staff.password_reset"
          : "staff.update",
    resourceType: "restaurant_staff",
    resourceId: updated.id,
    summary: changes.length
      ? `Staff “${updated.displayName}”: ${changes.join(", ")}`
      : `Updated staff “${updated.displayName}”`,
    meta: { status: updated.status, roleId: updated.roleId, changes },
    ip: request ? clientIp(request) : null,
  });

  return {
    staff: {
      id: updated.id,
      displayName: updated.displayName,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl || updated.user.avatarUrl,
      joinedAt: updated.joinedAt?.toISOString() || null,
      status: updated.status,
      email: updated.user.email,
      userId: updated.user.id,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
}

/**
 * Remove a person from the restaurant. Their login account is kept (so past activity logs stay
 * intact) but it can no longer sign in, and the email can be added again later.
 */
export async function removeStaff(userId: number, staffId: number, request?: Request) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "staff.manage");
  const existing = await prisma.restaurantStaff.findFirst({
    where: { id: staffId, restaurantId: ctx.restaurant.id },
    include: {
      user: { select: { id: true, email: true } },
      role: { select: { permissions: true } },
    },
  });
  if (!existing) throw new RestaurantAccessError(404, "NOT_FOUND", "Staff member not found.");
  if (existing.userId === ctx.actorUserId) {
    throw new RestaurantAccessError(403, "FORBIDDEN", "You can't remove yourself.");
  }
  if (ctx.kind !== "owner") {
    assertWithinOwnAccess(ctx, normalizePermissionGrants(existing.role.permissions), MANAGE_MESSAGE);
  }
  await prisma.restaurantStaff.delete({ where: { id: existing.id } });
  auditFromContext(ctx, {
    action: "staff.remove",
    resourceType: "restaurant_staff",
    resourceId: existing.id,
    summary: `Removed staff “${existing.displayName}” (${existing.user.email})`,
    ip: request ? clientIp(request) : null,
  });
  return { ok: true };
}

export async function listAuditLogs(
  userId: number,
  input: {
    page?: number;
    pageSize?: number;
    action?: string;
    category?: string;
    actorUserId?: number;
    actorKind?: string;
    q?: string;
    from?: string;
    to?: string;
    dayStart?: string;
    /** Include stats + filter facets (only needed on first load / refresh). */
    meta?: boolean;
  },
) {
  const ctx = await requireRestaurantContext(userId);
  requireRestaurantPermission(ctx, "logs.view");
  const pageSize = Math.min(100, Math.max(1, Math.round(Number(input.pageSize) || 25)));
  const requestedPage = Math.max(1, Math.round(Number(input.page) || 1));
  const restaurantId = ctx.restaurant.id;
  const where: Prisma.RestaurantAuditLogWhereInput = { restaurantId };
  if (input.action) where.action = String(input.action).slice(0, 80);
  else if (input.category) where.action = { startsWith: `${String(input.category).slice(0, 40)}.` };
  if (input.actorUserId) where.actorUserId = Number(input.actorUserId);
  if (input.actorKind === "OWNER" || input.actorKind === "STAFF") where.actorKind = input.actorKind;
  const q = String(input.q || "").trim().slice(0, 80);
  if (q) where.summary = { contains: q, mode: "insensitive" };
  const createdAt: { gte?: Date; lte?: Date } = {};
  if (input.from) {
    const from = new Date(input.from);
    if (!Number.isNaN(from.getTime())) createdAt.gte = from;
  }
  if (input.to) {
    const to = new Date(input.to);
    if (!Number.isNaN(to.getTime())) createdAt.lte = to;
  }
  if (createdAt.gte || createdAt.lte) where.createdAt = createdAt;

  const dayStartRaw = input.dayStart ? new Date(input.dayStart) : new Date();
  const dayStart = Number.isNaN(dayStartRaw.getTime()) ? new Date() : dayStartRaw;
  const weekStart = new Date(dayStart.getTime() - 6 * 24 * 60 * 60 * 1000);

  const wantMeta = input.meta === true;

  // Count first so we can clamp the requested page into range (e.g. after a
  // filter narrowed the result set while the user was on a later page).
  const total = await prisma.restaurantAuditLog.count({ where });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pages);

  const [rows, metaParts] = await Promise.all([
    total === 0
      ? Promise.resolve([])
      : prisma.restaurantAuditLog.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { actor: { select: { id: true, name: true, email: true } } },
        }),
    wantMeta
      ? Promise.all([
          prisma.restaurantAuditLog.count({ where: { restaurantId, createdAt: { gte: dayStart } } }),
          prisma.restaurantAuditLog.count({ where: { restaurantId, createdAt: { gte: weekStart } } }),
          prisma.restaurantAuditLog.groupBy({ by: ["actorUserId"], where: { restaurantId }, _count: { _all: true } }),
          prisma.restaurantAuditLog.groupBy({ by: ["action"], where: { restaurantId }, _count: { _all: true } }),
        ])
      : Promise.resolve(null),
  ]);

  let stats: { today: number; week: number; actors: number } | undefined;
  let facets:
    | {
        actors: Array<{ id: number; name: string | null; email: string; count: number }>;
        actions: Array<{ action: string; count: number }>;
      }
    | undefined;
  if (metaParts) {
    const [todayCount, weekCount, actorGroups, actionGroups] = metaParts;
    const actorUsers = actorGroups.length
      ? await prisma.user.findMany({
          where: { id: { in: actorGroups.map((g) => g.actorUserId) } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const actorMap = new Map(actorUsers.map((u) => [u.id, u]));
    stats = { today: todayCount, week: weekCount, actors: actorGroups.length };
    facets = {
      actors: actorGroups
        .map((g) => {
          const u = actorMap.get(g.actorUserId);
          return { id: g.actorUserId, name: u?.name || null, email: u?.email || "", count: g._count._all };
        })
        .sort((a, b) => b.count - a.count),
      actions: actionGroups.map((g) => ({ action: g.action, count: g._count._all })),
    };
  }

  return {
    page,
    pageSize,
    total,
    pages,
    stats,
    facets,
    logs: rows.map((row) => ({
      id: String(row.id),
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      summary: row.summary,
      meta: row.meta,
      ip: row.ip,
      actorKind: row.actorKind,
      actor: row.actor,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}
