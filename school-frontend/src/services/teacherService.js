import { request } from "./api";

export const teacherService = {
  getTeachers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/teachers?${query}`);
  },

  getTeacherById: async (id) => {
    return request(`/api/teachers/${id}`);
  },

  createTeacher: async (teacherData) => {
    return request("/api/teachers", {
      method: "POST",
      body: JSON.stringify(teacherData)
    });
  },

  updateTeacher: async (id, teacherData) => {
    return request(`/api/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(teacherData)
    });
  },

  deleteTeacher: async (id) => {
    return request(`/api/teachers/${id}`, {
      method: "DELETE"
    });
  }
};
