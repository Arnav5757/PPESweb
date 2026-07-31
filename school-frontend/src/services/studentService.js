import { request } from "./api";

export const studentService = {
  getStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/students?${query}`);
  },

  getStudentById: async (id) => {
    return request(`/api/students/${id}`);
  },

  createStudent: async (studentData) => {
    return request("/api/students", {
      method: "POST",
      body: JSON.stringify(studentData)
    });
  },

  updateStudent: async (id, studentData) => {
    return request(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(studentData)
    });
  },

  deleteStudent: async (id) => {
    return request(`/api/students/${id}`, {
      method: "DELETE"
    });
  },

  getStudentDashboard: async () => {
    return request("/api/student-data/dashboard");
  },

  updateStudentDashboardProfile: async (profileData) => {
    return request("/api/student-data/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    });
  },

  submitAssignment: async (assignmentId) => {
    return request(`/api/student-data/assignments/${assignmentId}/submit`, {
      method: "POST"
    });
  },

  getToppers: async () => {
    return request("/api/students/toppers");
  }
};
