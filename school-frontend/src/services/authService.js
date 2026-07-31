import { request } from "./api";

export const authService = {
  login: async (email, password) => {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  registerStudent: async (studentData) => {
    return request("/api/auth/register-student", {
      method: "POST",
      body: JSON.stringify(studentData)
    });
  },

  getMe: async () => {
    return request("/api/auth/me");
  }
};
