import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

function dateRangeParams(start?: Date | null, end?: Date | null) {
  if (start === null && end === null) return { range: "all" };
  return {
    startDate: start ? start.toISOString() : undefined,
    endDate: end ? end.toISOString() : undefined,
  };
}

export const dashboardService = {
  stats(start?: Date | null, end?: Date | null) {
    return apiRequest({
      method: "GET",
      url: endpoints.dashboard.stats,
      params: dateRangeParams(start, end),
    });
  },

  devIp() {
    return apiRequest({
      method: "GET",
      url: endpoints.devIp,
      firebaseAuth: false,
    });
  },
};

export { dateRangeParams };
