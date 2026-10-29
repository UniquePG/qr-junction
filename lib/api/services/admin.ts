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
