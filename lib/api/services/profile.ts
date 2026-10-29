import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const profileService = {
  get() {
    return apiRequest({ method: "GET", url: endpoints.profile });
  },

  update(body: unknown) {
    return apiRequest({ method: "PUT", url: endpoints.profile, data: body });
  },
};
