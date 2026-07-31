import { request } from "./api";

export const noticeService = {
  getNotices: async () => {
    return request("/api/notices");
  },

  createNotice: async (noticeData) => {
    return request("/api/notices", {
      method: "POST",
      body: JSON.stringify(noticeData)
    });
  },

  deleteNotice: async (id) => {
    return request(`/api/notices/${id}`, {
      method: "DELETE"
    });
  }
};
