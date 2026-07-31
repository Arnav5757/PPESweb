import { request } from "./api";

export const attendanceService = {
  getAttendance: async (date, className, section) => {
    const query = new URLSearchParams({ date, class: className, section }).toString();
    return request(`/api/attendance?${query}`);
  },

  submitAttendance: async (attendanceData) => {
    return request("/api/attendance", {
      method: "POST",
      body: JSON.stringify(attendanceData)
    });
  }
};
