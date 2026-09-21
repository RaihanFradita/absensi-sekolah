import api from "../api";

export const adminTeacherServices = {
  async getTeachers() {
    const response = await api.get("/admin/teacher");
    return response.data;
  },

  async getTeacherById(id) {
    const response = await api.get(`/admin/teacher/${id}`);
    return response.data;
  },

  async createTeacher(data) {
    const response = await api.post("/admin/teacher/add", data);
    return response.data;
  },

  async updateTeacher(id, data) {
    const response = await api.put(`/admin/teacher/edit/${id}`, data);
    return response.data;
  },

  async deactivateTeacher(id, id_user) {
    const response = await api.patch(`/admin/teacher/${id}/deactivate`, {
      id_user,
    });
    return response.data;
  },
};