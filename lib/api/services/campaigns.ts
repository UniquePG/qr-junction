import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const campaignService = {
  list() {
    return apiRequest({ method: "GET", url: endpoints.campaigns.collection });
  },

  get(id: string | number) {
    return apiRequest({ method: "GET", url: endpoints.campaigns.byId(id) });
  },

  create(body: unknown) {
    return apiRequest({ method: "POST", url: endpoints.campaigns.collection, data: body });
  },

  update(id: string | number, body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.campaigns.byId(id), data: body });
  },

  remove(id: string | number) {
    return apiRequest({ method: "DELETE", url: endpoints.campaigns.byId(id) });
  },
};
