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
};
