import { apiClient, apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const publicService = {
  conversion(body: unknown) {
    return apiRequest({
      method: "POST",
      url: endpoints.conversions,
      data: body,
      requireAuth: false,
    });
  },

  trackQrEvent(body: unknown) {
    return apiClient
      .request({
        method: "POST",
        url: endpoints.public.qrEvents,
        data: body,
        requireAuth: false,
        adapter: "fetch",
        fetchOptions: { keepalive: true },
      })
      .then(() => undefined)
      .catch(() => undefined);
  },

  createWaiterRequest(body: {
    restaurantId: number;
    tableCode: string;
    reason: string;
    guestKey?: string | null;
  }) {
    return apiRequest<{
      request: {
        id: number;
        restaurantId: number;
        tableNumber: string;
        reason: string;
        status: string;
        createdAt: string;
        acknowledgedAt: string | null;
      };
      cooldownSeconds: number;
      pendingCount: number;
      error?: string;
      code?: string;
    }>({
      method: "POST",
      url: endpoints.public.waiterRequests,
      data: body,
      requireAuth: false,
    });
  },
};
