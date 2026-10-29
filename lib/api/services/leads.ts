import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const leadService = {
  list() {
    return apiRequest({ method: "GET", url: endpoints.leads.collection });
  },

  create(body: unknown, options?: { auth?: boolean }) {
    return apiRequest({
      method: "POST",
      url: endpoints.leads.collection,
      data: body,
      firebaseAuth: options?.auth ?? true,
    });
  },

  update(id: string | number, body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.leads.byId(id), data: body });
  },

  remove(id: string | number) {
    return apiRequest({ method: "DELETE", url: endpoints.leads.byId(id) });
  },
};
