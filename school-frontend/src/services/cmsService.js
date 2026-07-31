import { request } from "./api";

export const cmsService = {
  getCMS: async () => {
    return request("/api/cms");
  },

  saveCMS: async (key, value) => {
    return request("/api/cms", {
      method: "POST",
      body: JSON.stringify({ key, value })
    });
  }
};
