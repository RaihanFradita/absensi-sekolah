import api from "../api";

export const adminTeacherServices = {
  async getTeachers() {
    const response = await api.get("/admin/teacher");
    return response.data;
  },
};
