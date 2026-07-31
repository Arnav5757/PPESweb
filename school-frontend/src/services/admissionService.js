import { request } from "./api";

// Public submission (no auth token needed — but our request helper attaches it if present, which is fine)
const submitPublicAdmission = async (data) => {
  // Use raw fetch to avoid needing a token for public submission
  const response = await fetch("http://localhost:5000/api/admissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Submission failed" }));
    throw new Error(err.message || "Submission failed");
  }

  return response.json();
};

export const admissionService = {
  // Public
  submitApplication: submitPublicAdmission,

  // Admin — list, view, update, approve, reject, delete
  getAdmissions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admissions?${query}`);
  },

  getAdmissionById: async (id) => {
    return request(`/api/admissions/${id}`);
  },

  updateAdmission: async (id, data) => {
    return request(`/api/admissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  approveAdmission: async (id, studentData) => {
    return request(`/api/admissions/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(studentData)
    });
  },

  rejectAdmission: async (id, data = {}) => {
    return request(`/api/admissions/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteAdmission: async (id) => {
    return request(`/api/admissions/${id}`, {
      method: "DELETE"
    });
  }
};
