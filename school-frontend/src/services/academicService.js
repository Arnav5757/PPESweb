import { request } from "./api";

export const academicService = {
  // ─── Academic Sessions ───────────────────────────────────────────
  getSessions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/academic-sessions?${query}`);
  },

  getCurrentSession: async () => {
    return request("/api/academic-sessions/current");
  },

  getSessionById: async (id) => {
    return request(`/api/academic-sessions/${id}`);
  },

  createSession: async (data) => {
    return request("/api/academic-sessions", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateSession: async (id, data) => {
    return request(`/api/academic-sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteSession: async (id) => {
    return request(`/api/academic-sessions/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Academic Years ──────────────────────────────────────────────
  getYears: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/academic-years?${query}`);
  },

  getCurrentYear: async () => {
    return request("/api/academic-years/current");
  },

  getYearById: async (id) => {
    return request(`/api/academic-years/${id}`);
  },

  createYear: async (data) => {
    return request("/api/academic-years", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateYear: async (id, data) => {
    return request(`/api/academic-years/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteYear: async (id) => {
    return request(`/api/academic-years/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Classes ─────────────────────────────────────────────────────
  getClasses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/classes?${query}`);
  },

  getClassById: async (id) => {
    return request(`/api/classes/${id}`);
  },

  getClassSections: async (id) => {
    return request(`/api/classes/${id}/sections`);
  },

  getClassSubjects: async (id) => {
    return request(`/api/classes/${id}/subjects`);
  },

  getClassEnrollments: async (id) => {
    return request(`/api/classes/${id}/enrollments`);
  },

  createClass: async (data) => {
    return request("/api/classes", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateClass: async (id, data) => {
    return request(`/api/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteClass: async (id) => {
    return request(`/api/classes/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Sections ────────────────────────────────────────────────────
  getSections: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/sections?${query}`);
  },

  getSectionById: async (id) => {
    return request(`/api/sections/${id}`);
  },

  createSection: async (data) => {
    return request("/api/sections", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateSection: async (id, data) => {
    return request(`/api/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteSection: async (id) => {
    return request(`/api/sections/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Subjects ────────────────────────────────────────────────────
  getSubjects: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/academic-subjects?${query}`);
  },

  getSubjectById: async (id) => {
    return request(`/api/academic-subjects/${id}`);
  },

  createSubject: async (data) => {
    return request("/api/academic-subjects", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateSubject: async (id, data) => {
    return request(`/api/academic-subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteSubject: async (id) => {
    return request(`/api/academic-subjects/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Subject Assignments ─────────────────────────────────────────
  getSubjectAssignments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/subject-assignments?${query}`);
  },

  getSubjectAssignmentById: async (id) => {
    return request(`/api/subject-assignments/${id}`);
  },

  createSubjectAssignment: async (data) => {
    return request("/api/subject-assignments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateSubjectAssignment: async (id, data) => {
    return request(`/api/subject-assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteSubjectAssignment: async (id) => {
    return request(`/api/subject-assignments/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Teacher Assignments ─────────────────────────────────────────
  getTeacherAssignments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/teacher-assignments?${query}`);
  },

  getTeacherAssignmentById: async (id) => {
    return request(`/api/teacher-assignments/${id}`);
  },

  createTeacherAssignment: async (data) => {
    return request("/api/teacher-assignments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateTeacherAssignment: async (id, data) => {
    return request(`/api/teacher-assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteTeacherAssignment: async (id) => {
    return request(`/api/teacher-assignments/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Enrollments ─────────────────────────────────────────────────
  getEnrollments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/enrollments?${query}`);
  },

  getEnrollmentById: async (id) => {
    return request(`/api/enrollments/${id}`);
  },

  getStudentEnrollmentHistory: async (studentId) => {
    return request(`/api/enrollments/student/${studentId}/history`);
  },

  createEnrollment: async (data) => {
    return request("/api/enrollments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateEnrollment: async (id, data) => {
    return request(`/api/enrollments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteEnrollment: async (id) => {
    return request(`/api/enrollments/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Promotions ──────────────────────────────────────────────────
  getPromotions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/promotions?${query}`);
  },

  getStudentPromotions: async (studentId) => {
    return request(`/api/promotions/student/${studentId}`);
  },

  promoteStudent: async (data) => {
    return request("/api/promotions", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
};
