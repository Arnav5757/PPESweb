import { request } from "./api";

export const feeService = {
  getFees: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/fees?${query}`);
  },

  createFee: async (feeData) => {
    return request("/api/fees", {
      method: "POST",
      body: JSON.stringify(feeData)
    });
  },

  payFee: async (id) => {
    return request(`/api/fees/${id}/pay`, {
      method: "POST"
    });
  }
};
