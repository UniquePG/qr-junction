import { apiRequest } from "@/lib/api/client";
import { dateRangeParams } from "@/lib/api/services/dashboard";
import { endpoints } from "@/lib/api/endpoints";

export const restaurantService = {
  getProfile(params?: { fields?: "shell" }) {
    return apiRequest({ method: "GET", url: endpoints.restaurant.profile, params });
  },

  saveProfile(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.profile, data: body });
  },

  lookupAddress(params: { kind: "pincode"; pin: string } | { kind: "states"; country: string } | { kind: "cities"; country: string; state: string }) {
    return apiRequest({ method: "GET", url: endpoints.restaurant.address, params });
  },

  listMenus() {
    return apiRequest({ method: "GET", url: endpoints.restaurant.menus });
  },

  saveMenu(method: "POST" | "PUT", body: unknown) {
    return apiRequest({ method, url: endpoints.restaurant.menus, data: body });
  },

  deleteMenu(id: string | number) {
    return apiRequest({
      method: "DELETE",
      url: endpoints.restaurant.menus,
      params: { id },
    });
  },

  getMenu(menuId: string | number) {
    return apiRequest({
      method: "GET",
      url: endpoints.restaurant.menu,
      params: { menuId },
    });
  },

  createCategory(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.categories, data: body });
  },

  updateCategories(body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.restaurant.categories, data: body });
  },

  deleteCategory(id: string | number) {
    return apiRequest({
      method: "DELETE",
      url: endpoints.restaurant.categories,
      params: { id },
    });
  },

  saveItem(method: "POST" | "PUT", body: unknown) {
    return apiRequest({ method, url: endpoints.restaurant.items, data: body });
  },

  updateItems(body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.restaurant.items, data: body });
  },

  deleteItem(id: string | number) {
    return apiRequest({
      method: "DELETE",
      url: endpoints.restaurant.items,
      params: { id },
    });
  },

  generateImage(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.generateImage, data: body });
  },

  listTables() {
    return apiRequest({ method: "GET", url: endpoints.restaurant.tables });
  },

  createTable(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.tables, data: body });
  },

  updateTable(body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.restaurant.tables, data: body });
  },

  deleteTable(id: string | number) {
    return apiRequest({
      method: "DELETE",
      url: endpoints.restaurant.tables,
      params: { id },
    });
  },

  stats(start?: Date | null, end?: Date | null) {
    return apiRequest({
      method: "GET",
      url: endpoints.restaurant.stats,
      params: dateRangeParams(start, end),
    });
  },

  overview(start?: Date | null, end?: Date | null) {
    return apiRequest({
      method: "GET",
      url: endpoints.restaurant.overview,
      params: dateRangeParams(start, end),
    });
  },

  scanMenu(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.scanMenu, data: body });
  },

  importMenu(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.importMenu, data: body });
  },

  listOrders() {
    return apiRequest<{
      orders: any[];
      placedCount: number;
      unpaidCount: number;
      finishedCount: number;
      orderingEnabled: boolean;
      acceptingOrders: boolean;
      orderingEffective: boolean;
      canManageAcceptingOrders: boolean;
      orderingReason: string | null;
      prepMinutes: number;
      digitalBillEnabled: boolean;
    }>({
      method: "GET",
      url: endpoints.restaurant.orders,
    });
  },

  listFinishedOrders(params: { q?: string; from?: string; to?: string; status?: string; place?: string; page?: number; pageSize?: number }) {
    return apiRequest<{
      orders: any[];
      digitalBillEnabled: boolean;
      page: number;
      pageSize: number;
      total: number;
      unpaidTotal: number;
      counts: { unpaid: number; paid: number; rejected: number; all: number };
    }>({
      method: "GET",
      url: endpoints.restaurant.orders,
      params: { view: "finished", ...params },
    });
  },

  updatePrep(prepMinutes: number) {
    return apiRequest<{ prepMinutes: number }>({
      method: "PATCH",
      url: endpoints.restaurant.orders,
      data: { prepMinutes },
    });
  },

  getOrder(id: string) {
    return apiRequest<{ order: any }>({
      method: "GET",
      url: endpoints.restaurant.order(id),
    });
  },

  updateOrder(id: string, body: { status?: string; reason?: string; readyInMinutes?: number; stageMinutes?: number; paid?: boolean }) {
    return apiRequest<{ order: any; changed: boolean; placedCount?: number }>({
      method: "PATCH",
      url: endpoints.restaurant.order(id),
      data: body,
    });
  },

  getSettings() {
    return apiRequest<{
      settings: {
        digitalBill: boolean;
        orderSound: boolean;
        waiterSound: boolean;
        acceptingOrders: boolean;
        callWaiter: boolean;
      };
      entitlements: { digitalBill: boolean; ordering: boolean; callWaiter: boolean };
      capabilities: {
        orderingUnlocked: boolean;
        canManageAcceptingOrders: boolean;
        orderingEffective: boolean;
        orderingReason: string | null;
        callWaiterUnlocked: boolean;
        canManageCallWaiter: boolean;
        callWaiterEffective: boolean;
        callWaiterReason: string | null;
      };
    }>({
      method: "GET",
      url: endpoints.restaurant.settings,
    });
  },

  patchSettings(body: {
    digitalBill?: boolean;
    orderSound?: boolean;
    waiterSound?: boolean;
    acceptingOrders?: boolean;
    callWaiter?: boolean;
  }) {
    return apiRequest<{
      settings: {
        digitalBill: boolean;
        orderSound: boolean;
        waiterSound: boolean;
        acceptingOrders: boolean;
        callWaiter: boolean;
      };
      entitlements: { digitalBill: boolean; ordering: boolean; callWaiter: boolean };
      capabilities: {
        orderingUnlocked: boolean;
        canManageAcceptingOrders: boolean;
        orderingEffective: boolean;
        orderingReason: string | null;
        callWaiterUnlocked: boolean;
        canManageCallWaiter: boolean;
        callWaiterEffective: boolean;
        callWaiterReason: string | null;
      };
    }>({
      method: "PATCH",
      url: endpoints.restaurant.settings,
      data: body,
    });
  },

  listWaiterRequests() {
    return apiRequest<{
      success: boolean;
      requests: Array<{
        id: number;
        restaurantId: number;
        tableNumber: string;
        reason: string;
        status: string;
        createdAt: string;
        acknowledgedAt: string | null;
      }>;
      pendingCount: number;
    }>({
      method: "GET",
      url: endpoints.restaurant.waiterRequests,
      params: { status: "PENDING" },
    });
  },

  acknowledgeWaiterRequest(id: string | number) {
    return apiRequest<{
      success: boolean;
      request: {
        id: number;
        tableNumber: string;
        reason: string;
        status: string;
        createdAt: string;
        acknowledgedAt: string | null;
      };
      changed: boolean;
      pendingCount: number;
    }>({
      method: "PATCH",
      url: endpoints.restaurant.waiterRequest(id),
      data: { status: "ACKNOWLEDGED" },
    });
  },

  async downloadOrderBill(id: string) {
    const res = await fetch(endpoints.restaurant.orderBill(id), {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error || "Could not download bill.");
    }
    return res.blob();
  },

  listOffers(menuId?: string | number | null) {
    return apiRequest<{
      offers: any[];
      entitlements: { offers: boolean; custom: boolean };
    }>({
      method: "GET",
      url: endpoints.restaurant.offers,
      params: menuId != null && menuId !== "" ? { menuId } : undefined,
    });
  },

  createOffer(body: unknown) {
    return apiRequest<{ offer: any }>({
      method: "POST",
      url: endpoints.restaurant.offers,
      data: body,
    });
  },

  updateOffer(id: string | number, body: unknown) {
    return apiRequest<{ offer: any }>({
      method: "PATCH",
      url: endpoints.restaurant.offer(id),
      data: body,
    });
  },

  deleteOffer(id: string | number) {
    return apiRequest({
      method: "DELETE",
      url: endpoints.restaurant.offer(id),
    });
  },

  listStaff() {
    return apiRequest<{
      seats: { used: number; limit?: number | null; ownerUserId: number };
      staff: any[];
    }>({
      method: "GET",
      url: endpoints.restaurant.staff,
    });
  },

  createStaff(body: unknown) {
    return apiRequest<{ staff: any }>({
      method: "POST",
      url: endpoints.restaurant.staff,
      data: body,
    });
  },

  updateStaff(id: string | number, body: unknown) {
    return apiRequest<{ staff: any }>({
      method: "PATCH",
      url: endpoints.restaurant.staffMember(id),
      data: body,
    });
  },

  removeStaff(id: string | number) {
    return apiRequest({
      method: "DELETE",
      url: endpoints.restaurant.staffMember(id),
    });
  },

  listRoles() {
    return apiRequest<{ roles: any[] }>({
      method: "GET",
      url: endpoints.restaurant.staffRoles,
    });
  },

  createRole(body: unknown) {
    return apiRequest<{ role: any }>({
      method: "POST",
      url: endpoints.restaurant.staffRoles,
      data: body,
    });
  },

  updateRole(id: string | number, body: unknown) {
    return apiRequest<{ role: any }>({
      method: "PATCH",
      url: endpoints.restaurant.staffRole(id),
      data: body,
    });
  },

  deleteRole(id: string | number) {
    return apiRequest({
      method: "DELETE",
      url: endpoints.restaurant.staffRole(id),
    });
  },

  listStaffPermissions() {
    return apiRequest<{
      groups: Array<{ group: string; permissions: Array<{ key: string; label: string; group: string }> }>;
      templates: Array<{ id: string; name: string; description: string; permissions: string[] }>;
    }>({
      method: "GET",
      url: endpoints.restaurant.staffPermissions,
    });
  },

  listLogs(params?: {
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
    meta?: 0 | 1;
  }) {
    return apiRequest<{
      page: number;
      pageSize: number;
      total: number;
      pages?: number;
      stats?: { today: number; week: number; actors: number };
      facets?: {
        actors: Array<{ id: number; name: string | null; email: string; count: number }>;
        actions: Array<{ action: string; count: number }>;
      };
      logs: any[];
    }>({
      method: "GET",
      url: endpoints.restaurant.logs,
      params,
    });
  },
};
