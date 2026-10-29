import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const landingPageService = {
  list() {
    return apiRequest({ method: "GET", url: endpoints.landingPages.collection });
  },

  get(id: string | number) {
    return apiRequest({ method: "GET", url: endpoints.landingPages.byId(id) });
  },

  create(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.landingPages.collection, data: body });
  },

  update(id: string | number, body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.landingPages.byId(id), data: body });
  },

  remove(id: string | number) {
    return apiRequest({ method: "DELETE", url: endpoints.landingPages.byId(id) });
  },
};
