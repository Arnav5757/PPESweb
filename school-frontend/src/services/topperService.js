import { request } from "./api";

export const topperService = {
  getToppers: async () => {
    return request("/api/toppers");
  },

  createTopper: async (topperData) => {
    return request("/api/toppers", {
      method: "POST",
      body: JSON.stringify(topperData)
    });
  },

  updateTopper: async (id, topperData) => {
    return request(`/api/toppers/${id}`, {
      method: "PUT",
      body: JSON.stringify(topperData)
    });
  },

  deleteTopper: async (id) => {
    return request(`/api/toppers/${id}`, {
      method: "DELETE"
    });
  }
};
