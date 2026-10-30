import { apiRequest } from "@/lib/api/client";
import { dateRangeParams } from "@/lib/api/services/dashboard";
import { endpoints } from "@/lib/api/endpoints";

export const restaurantService = {
  getProfile() {
    return apiRequest({ method: "GET", url: endpoints.restaurant.profile });
  },

  saveProfile(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.profile, data: body });
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

  scanMenu(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.scanMenu, data: body });
  },

  importMenu(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.restaurant.importMenu, data: body });
  },

  listOrders() {
    return apiRequest<{ orders: any[]; placedCount: number; unpaidCount: number; finishedCount: number; orderingEnabled: boolean; prepMinutes: number }>({
      method: "GET",
      url: endpoints.restaurant.orders,
    });
  },

  listFinishedOrders(params: { q?: string; from?: string; to?: string; status?: string; place?: string; page?: number; pageSize?: number }) {
    return apiRequest<{
      orders: any[];
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
    return apiRequest<{ order: any; changed: boolean }>({
      method: "PATCH",
      url: endpoints.restaurant.order(id),
      data: body,
    });
  },
};
