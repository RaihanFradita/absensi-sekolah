import api from "../api";

export const adminClassServices = {
  async getClasses() {
    const response = await api.get("/admin/class");
    return response.data;
  },

  async getClassById(id) {
    const response = await api.get(`/admin/class/${id}`);
    return response.data;
  },

  async createClass(data) {
    const response = await api.post("/admin/class/add", data);
    return response.data;
  },

  async updateClass(id, data) {
    const response = await api.put(`/admin/class/edit/${id}`, data);
    return response.data;
  },

  async deactivateClass(id) {
    const response = await api.patch(`/admin/class/${id}/deactivate`);
    return response.data;
  },
};
