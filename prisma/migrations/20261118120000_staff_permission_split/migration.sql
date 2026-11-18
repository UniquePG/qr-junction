-- Roles that could update orders could also reject them before "Reject orders" became its own
-- permission. Keep that behaviour for existing roles (owners can untick it afterwards).
-- Idempotent: safe to run more than once.
UPDATE "restaurant_roles"
SET "permissions" = "permissions" || '["orders.reject"]'::jsonb,
    "updated_at" = CURRENT_TIMESTAMP
WHERE jsonb_typeof("permissions") = 'array'
  AND "permissions" ? 'orders.update'
  AND NOT ("permissions" ? 'orders.reject');
