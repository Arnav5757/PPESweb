import { request } from "./api";

export const analyticsService = {
  getAnalytics: async () => {
    return request("/api/analytics");
  }
};
