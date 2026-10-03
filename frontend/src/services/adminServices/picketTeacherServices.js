import api from "../api";

export const adminPicketTeacherServices = {
  async getPicketTeachers(params = {}) {
    const response = await api.get("/admin/picket-teacher", { params });
    return response.data;
  },

  async getPicketTeacherById(id_user) {
    const response = await api.get(`/admin/picket-teacher/${id_user}`);
    return response.data;
  },

  async createPicketTeacher(data) {
    const response = await api.post("/admin/picket-teacher/add", data);
    return response.data;
  },

  async updatePicketTeacher(id_user, data) {
    const response = await api.patch(`/admin/picket-teacher/edit/${id_user}`, data);
    return response.data;
  },

  async deactivatePicketTeacher(id_user) {
    const response = await api.patch(`/admin/picket-teacher/${id_user}/deactivate`);
    return response.data;
  },
};
