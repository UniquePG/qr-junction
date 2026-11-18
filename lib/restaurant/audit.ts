import type { RestaurantActorKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RestaurantContext } from "@/lib/restaurant/access";

export type AuditInput = {
  restaurantId: number;
  actorUserId: number;
  actorKind: RestaurantActorKind;
  action: string;
  resourceType: string;
  resourceId?: string | number | null;
  summary: string;
  meta?: Prisma.InputJsonValue;
  ip?: string | null;
};

export function actorKindFromContext(ctx: RestaurantContext): RestaurantActorKind {
  return ctx.kind === "owner" ? "OWNER" : "STAFF";
}

export function recordRestaurantAudit(input: AuditInput): void {
  void prisma.restaurantAuditLog
    .create({
      data: {
        restaurantId: input.restaurantId,
        actorUserId: input.actorUserId,
        actorKind: input.actorKind,
        action: String(input.action).slice(0, 80),
        resourceType: String(input.resourceType).slice(0, 64),
        resourceId:
          input.resourceId == null || input.resourceId === ""
            ? null
            : String(input.resourceId).slice(0, 80),
        summary: String(input.summary).slice(0, 280),
        meta: input.meta ?? undefined,
        ip: input.ip ? String(input.ip).slice(0, 64) : null,
      },
    })
    .catch((error) => {
      console.warn("[audit]", error instanceof Error ? error.message : error);
    });
}

export function auditFromContext(
  ctx: RestaurantContext,
  input: Omit<AuditInput, "restaurantId" | "actorUserId" | "actorKind">,
): void {
  recordRestaurantAudit({
    restaurantId: ctx.restaurant.id,
    actorUserId: ctx.actorUserId,
    actorKind: actorKindFromContext(ctx),
    ...input,
  });
}

/**
 * Log an action for any user who belongs to a restaurant (owner or active staff).
 * No-op for users with no restaurant (e.g. platform-only accounts). Never throws.
 */
export async function auditForUser(
  userId: number,
  input: Omit<AuditInput, "restaurantId" | "actorUserId" | "actorKind">,
): Promise<void> {
  try {
    const { resolveRestaurantContext } = await import("@/lib/restaurant/access");
    const ctx = await resolveRestaurantContext(userId);
    if (!ctx) return;
    auditFromContext(ctx, input);
  } catch (error) {
    console.warn("[audit]", error instanceof Error ? error.message : error);
  }
}

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}
