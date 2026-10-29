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

  save(body: unknown, options?: { auth?: boolean }) {
    return apiRequest({
      method: "POST",
      url: endpoints.reviews.collection,
      data: body,
      firebaseAuth: options?.auth ?? true,
    });
  },

  generateSuggestions(body: unknown) {
    return apiRequest({
      method: "POST",
      url: endpoints.reviews.generateSuggestions,
      data: body,
      firebaseAuth: false,
    });
  },
};
