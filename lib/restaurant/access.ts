import { prisma } from "@/lib/prisma";
import {
  ALL_PERMISSION_KEYS,
  expandImplies,
  hasPermission,
  isValidPermissionKey,
  type StaffPermissionKey,
} from "@/lib/restaurant/staff/permissions";

export class RestaurantAccessError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RestaurantRow = {
  id: number;
  userId: number;
  name: string;
  settings: unknown;
  orderingEnabled: boolean;
  callWaiterEnabled: boolean;
  prepMinutes: number;
};

export type RestaurantContext =
  | {
      kind: "owner";
      restaurant: RestaurantRow;
      ownerUserId: number;
      actorUserId: number;
      staff: null;
      role: null;
      permissions: "ALL";
    }
  | {
      kind: "staff";
      restaurant: RestaurantRow;
      ownerUserId: number;
      actorUserId: number;
      staff: {
        id: number;
        displayName: string;
        roleId: number;
        status: string;
      };
      role: {
        id: number;
        name: string;
        permissions: StaffPermissionKey[];
      };
      permissions: Set<StaffPermissionKey>;
    };

const restaurantSelect = {
  id: true,
  userId: true,
  name: true,
  settings: true,
  orderingEnabled: true,
  callWaiterEnabled: true,
  prepMinutes: true,
} as const;

function parseRolePermissions(raw: unknown): StaffPermissionKey[] {
  if (!Array.isArray(raw)) return [];
  return expandImplies(raw.filter((k): k is string => typeof k === "string" && isValidPermissionKey(k)));
}

export async function resolveRestaurantContext(userId: number): Promise<RestaurantContext | null> {
  const owned = await prisma.restaurant.findUnique({
    where: { userId },
    select: restaurantSelect,
  });
  if (owned) {
    return {
      kind: "owner",
      restaurant: owned,
      ownerUserId: owned.userId,
      actorUserId: userId,
      staff: null,
      role: null,
      permissions: "ALL",
    };
  }

  const membership = await prisma.restaurantStaff.findFirst({
    where: { userId, status: "ACTIVE" },
    select: {
      id: true,
      displayName: true,
      roleId: true,
      status: true,
      restaurant: { select: restaurantSelect },
      role: { select: { id: true, name: true, permissions: true } },
    },
  });
  if (!membership) return null;

  const granted = parseRolePermissions(membership.role.permissions);
  return {
    kind: "staff",
    restaurant: membership.restaurant,
    ownerUserId: membership.restaurant.userId,
    actorUserId: userId,
    staff: {
      id: membership.id,
      displayName: membership.displayName,
      roleId: membership.roleId,
      status: membership.status,
    },
    role: {
      id: membership.role.id,
      name: membership.role.name,
      permissions: granted,
    },
    permissions: new Set(granted),
  };
}

export function ctxCan(ctx: RestaurantContext, key: StaffPermissionKey): boolean {
  return hasPermission(ctx.permissions, key);
}

export function requireRestaurantPermission(ctx: RestaurantContext, key: StaffPermissionKey): void {
  if (!ctxCan(ctx, key)) {
    throw new RestaurantAccessError(403, "FORBIDDEN", "You do not have permission for this action.");
  }
}

export function requireAnyRestaurantPermission(ctx: RestaurantContext, keys: StaffPermissionKey[]): void {
  if (keys.some((key) => ctxCan(ctx, key))) return;
  throw new RestaurantAccessError(403, "FORBIDDEN", "You do not have permission for this action.");
}

export async function requireRestaurantContext(userId: number): Promise<RestaurantContext> {
  const ctx = await resolveRestaurantContext(userId);
  if (!ctx) throw new RestaurantAccessError(404, "NOT_FOUND", "Restaurant not found.");
  return ctx;
}

export function ownerUserIdOf(ctx: RestaurantContext): number {
  return ctx.ownerUserId;
}

export function permissionList(ctx: RestaurantContext): StaffPermissionKey[] | "ALL" {
  if (ctx.permissions === "ALL") return "ALL";
  return [...ctx.permissions];
}

export function publicRestaurantAccess(ctx: RestaurantContext) {
  return {
    kind: ctx.kind,
    restaurantId: ctx.restaurant.id,
    restaurantName: ctx.restaurant.name,
    staffId: ctx.staff?.id ?? null,
    roleName: ctx.role?.name ?? null,
    permissions: ctx.permissions === "ALL" ? ALL_PERMISSION_KEYS : [...ctx.permissions],
  };
}
