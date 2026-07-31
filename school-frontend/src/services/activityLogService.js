import { request } from "./api";

export const activityLogService = {
  getActivityLogs: async () => {
    return request("/api/activity-logs");
  }
};
