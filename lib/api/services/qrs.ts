import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const qrService = {
  list() {
    return apiRequest({ method: "GET", url: endpoints.qrs.collection });
  },

  get(id: string | number) {
    return apiRequest({ method: "GET", url: endpoints.qrs.byId(id) });
  },

  create(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.qrs.collection, data: body });
  },

  update(id: string | number, body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.qrs.byId(id), data: body });
  },

  remove(id: string | number) {
    return apiRequest({ method: "DELETE", url: endpoints.qrs.byId(id) });
  },

  reviews(id: string | number) {
    return apiRequest({ method: "GET", url: endpoints.qrs.reviews(id) });
  },

  publicByShortCode(shortCode: string) {
    return apiRequest({
      method: "GET",
      url: endpoints.qrs.publicByShortCode(shortCode),
      firebaseAuth: false,
    });
  },
};
