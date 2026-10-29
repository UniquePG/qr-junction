import { apiClient, apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const publicService = {
  conversion(body: unknown) {
    return apiRequest({
      method: "POST",
      url: endpoints.conversions,
      data: body,
      firebaseAuth: false,
    });
  },

  trackQrEvent(body: unknown) {
    return apiClient
      .request({
        method: "POST",
        url: endpoints.public.qrEvents,
        data: body,
        firebaseAuth: false,
        adapter: "fetch",
        fetchOptions: { keepalive: true },
      })
      .then(() => undefined)
      .catch(() => undefined);
  },
};
