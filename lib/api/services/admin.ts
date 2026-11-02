import { apiData } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

type Query = Record<string, string | number | boolean | null | undefined>;

function list(url: string, query?: Query) {
  return apiData({
    method: "GET",
    url,
    params: query,
    requireAuth: true,
  });
}

export const adminService = {
  me<T = any>() {
    return apiData<T>({ method: "GET", url: endpoints.admin.me, requireAuth: true });
  },

  overview<T = any>(query?: Query) {
    return list(endpoints.admin.overview, query) as Promise<T>;
  },

  users<T = any>(query?: Query) {
    return list(endpoints.admin.users, query) as Promise<T>;
  },

  user<T = any>(id: string | number) {
    return apiData<T>({ method: "GET", url: endpoints.admin.user(id), requireAuth: true });
  },

  plans<T = any>() {
    return apiData<T>({ method: "GET", url: endpoints.admin.plans, requireAuth: true });
  },

  savePlan<T = any>(id: string, data: unknown) {
    return apiData<T>({ method: "PATCH", url: endpoints.admin.plan(id), data, requireAuth: true });
  },

  createPlan<T = any>(data: unknown) {
    return apiData<T>({ method: "POST", url: endpoints.admin.plans, data, requireAuth: true });
  },

  deletePlan<T = any>(id: string) {
    return apiData<T>({ method: "DELETE", url: endpoints.admin.plan(id), requireAuth: true });
  },

  createFeature<T = any>(data: unknown) {
    return apiData<T>({ method: "POST", url: endpoints.admin.features, data, requireAuth: true });
  },

  userSubscription<T = any>(id: string | number) {
    return apiData<T>({ method: "GET", url: endpoints.admin.userSubscription(id), requireAuth: true });
  },

  saveUserSubscription<T = any>(id: string | number, data: unknown) {
    return apiData<T>({ method: "PATCH", url: endpoints.admin.userSubscription(id), data, requireAuth: true });
  },

  addOverride<T = any>(id: string | number, data: unknown) {
    return apiData<T>({ method: "POST", url: endpoints.admin.userOverrides(id), data, requireAuth: true });
  },

  removeOverride<T = any>(id: string | number, overrideId: string) {
    return apiData<T>({
      method: "DELETE",
      url: endpoints.admin.userOverrides(id),
      params: { overrideId },
      requireAuth: true,
    });
  },

  qrs<T = any>(query?: Query) {
    return list(endpoints.admin.qrs, query) as Promise<T>;
  },

  qr<T = any>(id: string | number) {
    return apiData<T>({ method: "GET", url: endpoints.admin.qr(id), requireAuth: true });
  },

  campaigns<T = any>(query?: Query) {
    return list(endpoints.admin.campaigns, query) as Promise<T>;
  },

  leads<T = any>(query?: Query) {
    return list(endpoints.admin.leads, query) as Promise<T>;
  },

  reviews<T = any>(query?: Query) {
    return list(endpoints.admin.reviews, query) as Promise<T>;
  },

  review<T = any>(id: string | number) {
    return apiData<T>({ method: "GET", url: endpoints.admin.review(id), requireAuth: true });
  },

  restaurants<T = any>(query?: Query) {
    return list(endpoints.admin.restaurants, query) as Promise<T>;
  },

  restaurant<T = any>(id: string | number) {
    return apiData<T>({ method: "GET", url: endpoints.admin.restaurant(id), requireAuth: true });
  },

  setOrdering<T = any>(id: string | number, orderingEnabled: boolean) {
    return apiData<T>({
      method: "PATCH",
      url: endpoints.admin.restaurant(id),
      data: { orderingEnabled },
      requireAuth: true,
    });
  },

  pages<T = any>(query?: Query) {
    return list(endpoints.admin.pages, query) as Promise<T>;
  },

  scans<T = any>(query?: Query) {
    return list(endpoints.admin.scans, query) as Promise<T>;
  },

  guests<T = any>(query?: Query) {
    return list(endpoints.admin.guests, query) as Promise<T>;
  },
};
