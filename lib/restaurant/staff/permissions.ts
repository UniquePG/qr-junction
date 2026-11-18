export type StaffPermissionKey =
  | "home.view"
  | "orders.view"
  | "orders.update"
  | "orders.reject"
  | "orders.pay"
  | "orders.bill"
  | "waiter.view"
  | "waiter.ack"
  | "menu.view"
  | "menu.create"
  | "menu.update"
  | "menu.availability"
  | "menu.delete"
  | "offers.view"
  | "offers.manage"
  | "tables.view"
  | "tables.manage"
  | "analytics.view"
  | "scanner.use"
  | "profile.view"
  | "profile.update"
  | "settings.view"
  | "settings.update"
  | "settings.operations"
  | "billing.view"
  | "staff.view"
  | "staff.manage"
  | "roles.manage"
  | "logs.view";

export type PermissionDef = {
  key: StaffPermissionKey;
  label: string;
  group: string;
  implies?: StaffPermissionKey[];
  /** Hide from staff role templates / matrix (owner-only). */
  ownerOnly?: boolean;
};

export const PERMISSIONS: PermissionDef[] = [
  { key: "home.view", label: "View home", group: "Home" },
  { key: "orders.view", label: "View orders", group: "Orders" },
  { key: "orders.update", label: "Update order status", group: "Orders", implies: ["orders.view"] },
  { key: "orders.reject", label: "Reject orders", group: "Orders", implies: ["orders.update"] },
  { key: "orders.pay", label: "Mark paid / unpaid", group: "Orders", implies: ["orders.view"] },
  { key: "orders.bill", label: "View / print bills", group: "Orders", implies: ["orders.view"] },
  { key: "waiter.view", label: "View waiter calls", group: "Waiter" },
  { key: "waiter.ack", label: "Acknowledge waiter calls", group: "Waiter", implies: ["waiter.view"] },
  { key: "menu.view", label: "View menus", group: "Menu" },
  { key: "menu.create", label: "Create menu items", group: "Menu", implies: ["menu.view"] },
  { key: "menu.update", label: "Edit menus", group: "Menu", implies: ["menu.view"] },
  { key: "menu.availability", label: "Mark items available / sold out", group: "Menu", implies: ["menu.view"] },
  { key: "menu.delete", label: "Delete menu items", group: "Menu", implies: ["menu.view"] },
  { key: "offers.view", label: "View offers", group: "Offers" },
  { key: "offers.manage", label: "Manage offers", group: "Offers", implies: ["offers.view"] },
  { key: "tables.view", label: "View tables", group: "Tables" },
  { key: "tables.manage", label: "Manage tables", group: "Tables", implies: ["tables.view"] },
  { key: "analytics.view", label: "View analytics", group: "Analytics" },
  { key: "scanner.use", label: "Use menu scanner", group: "Scanner" },
  { key: "profile.view", label: "View restaurant profile", group: "Profile" },
  { key: "profile.update", label: "Edit restaurant profile", group: "Profile", implies: ["profile.view"] },
  { key: "settings.view", label: "View settings", group: "Settings" },
  { key: "settings.operations", label: "Pause orders / call waiter", group: "Settings", implies: ["settings.view"] },
  { key: "settings.update", label: "Change settings", group: "Settings", implies: ["settings.view"] },
  { key: "billing.view", label: "View billing", group: "Billing", ownerOnly: true },
  { key: "staff.view", label: "View staff", group: "Staff" },
  { key: "staff.manage", label: "Manage staff", group: "Staff", implies: ["staff.view"] },
  { key: "roles.manage", label: "Manage roles", group: "Staff", implies: ["staff.view"] },
  { key: "logs.view", label: "View activity logs", group: "Logs" },
];

const PERMISSION_MAP = new Map(PERMISSIONS.map((p) => [p.key, p]));

export const ALL_PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export const STAFF_ASSIGNABLE_KEYS = PERMISSIONS.filter((p) => !p.ownerOnly).map((p) => p.key);

export function isValidPermissionKey(key: string): key is StaffPermissionKey {
  return PERMISSION_MAP.has(key as StaffPermissionKey);
}

export function expandImplies(keys: string[]): StaffPermissionKey[] {
  const out = new Set<StaffPermissionKey>();
  const queue = [...keys];
  while (queue.length) {
    const raw = queue.pop();
    if (!raw || !isValidPermissionKey(raw) || out.has(raw)) continue;
    out.add(raw);
    const implies = PERMISSION_MAP.get(raw)?.implies || [];
    for (const next of implies) queue.push(next);
  }
  return [...out];
}

export function normalizePermissionGrants(input: unknown): StaffPermissionKey[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input.filter((key): key is string => typeof key === "string" && isValidPermissionKey(key));
  return expandImplies(cleaned).filter((key) => !PERMISSION_MAP.get(key)?.ownerOnly);
}

export function hasPermission(granted: Iterable<string> | "ALL", key: StaffPermissionKey): boolean {
  if (granted === "ALL") return true;
  const set = granted instanceof Set ? granted : new Set(granted);
  if (set.has(key)) return true;
  // Also accept if a higher permission that implies this was stored without expand
  for (const [permKey, def] of PERMISSION_MAP) {
    if (def.implies?.includes(key) && set.has(permKey)) return true;
  }
  return false;
}

export function listPermissionGroups(opts?: { includeOwnerOnly?: boolean }) {
  const includeOwnerOnly = Boolean(opts?.includeOwnerOnly);
  const groups = new Map<string, PermissionDef[]>();
  for (const perm of PERMISSIONS) {
    if (perm.ownerOnly && !includeOwnerOnly) continue;
    const list = groups.get(perm.group) || [];
    list.push(perm);
    groups.set(perm.group, list);
  }
  return [...groups.entries()].map(([group, permissions]) => ({ group, permissions }));
}

export type RoleTemplateId = "empty" | "manager" | "kitchen" | "waiter" | "cashier" | "host";

export type RoleTemplate = {
  id: RoleTemplateId;
  name: string;
  description: string;
  permissions: StaffPermissionKey[];
};

const managerPerms = STAFF_ASSIGNABLE_KEYS.filter(
  (key) => !key.startsWith("billing."),
);

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "empty",
    name: "Empty / Custom",
    description: "Start with no permissions — pick each access yourself.",
    permissions: [],
  },
  {
    id: "manager",
    name: "Manager",
    description: "Floor, menu, staff, and settings — not billing.",
    permissions: expandImplies(managerPerms),
  },
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Orders, waiter calls, and menu management.",
    permissions: expandImplies([
      "home.view",
      "orders.view",
      "orders.update",
      "orders.reject",
      "waiter.view",
      "waiter.ack",
      "menu.view",
      "menu.availability",
      "menu.create",
      "menu.update",
      "menu.delete",
    ]),
  },
  {
    id: "waiter",
    name: "Waiter",
    description: "See orders and handle call-waiter requests.",
    permissions: expandImplies(["home.view", "orders.view", "waiter.view", "waiter.ack"]),
  },
  {
    id: "cashier",
    name: "Cashier",
    description: "Payments and digital bills.",
    permissions: expandImplies(["home.view", "orders.view", "orders.pay", "orders.bill"]),
  },
  {
    id: "host",
    name: "Host",
    description: "Tables and waiter visibility.",
    permissions: expandImplies(["home.view", "tables.view", "tables.manage", "waiter.view"]),
  },
];

export function getRoleTemplate(id: string): RoleTemplate | null {
  return ROLE_TEMPLATES.find((t) => t.id === id) || null;
}

/** Map suite nav href → required permission to see the item. */
export const NAV_PERMISSION: Record<string, StaffPermissionKey> = {
  "/dashboard/restaurant": "home.view",
  "/dashboard/restaurant/menu": "menu.view",
  "/dashboard/restaurant/offers": "offers.view",
  "/dashboard/restaurant/tables": "tables.view",
  "/dashboard/restaurant/orders": "orders.view",
  "/dashboard/restaurant/profile": "profile.view",
  "/dashboard/restaurant/settings": "settings.view",
  "/dashboard/restaurant/scanner": "scanner.use",
  "/dashboard/restaurant/analytics": "analytics.view",
  "/dashboard/restaurant/billing": "billing.view",
  "/dashboard/restaurant/staff": "staff.view",
  "/dashboard/restaurant/logs": "logs.view",
};
