import { apiData } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const billingService = {
  current<T = any>() {
    return apiData<T>({ method: "GET", url: endpoints.billing.current, requireAuth: true });
  },
  checkout<T = any>(data: { planCode: string; interval: "MONTH" | "YEAR" }) {
    return apiData<T>({ method: "POST", url: endpoints.billing.checkout, data, requireAuth: true });
  },
};
