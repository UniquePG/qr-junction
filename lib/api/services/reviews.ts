import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const reviewService = {
  summary() {
    return apiRequest({ method: "GET", url: endpoints.reviews.summary });
  },

  weeklyInsights(qrCodeId?: string) {
    return apiRequest({
      method: "GET",
      url: endpoints.reviews.weeklyInsights,
      params: qrCodeId && qrCodeId !== "all" ? { qrCodeId } : undefined,
    });
  },

  save(body: unknown) {
    return apiRequest({
      method: "POST",
      url: endpoints.reviews.collection,
      data: body,
      requireAuth: false,
    });
  },

  generateSuggestions(body: unknown) {
    return apiRequest({
      method: "POST",
      url: endpoints.reviews.generateSuggestions,
      data: body,
      requireAuth: false,
    });
  },
};
