import { request } from "./api";

export const settingsService = {
  getSettings: async () => {
    return request("/api/settings");
  },

  updateSettings: async (settingsData) => {
    return request("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settingsData)
    });
  }
};
