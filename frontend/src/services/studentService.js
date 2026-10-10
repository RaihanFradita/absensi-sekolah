import api from "./api";

const studentService = {
  async getStudents(params = {}) {
    const response = await api.get("/admin/students", { params });
    return response.data;
  },

  async getStudent(id) {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },

  async getClasses() {
    const response = await api.get("/admin/students/classes/list");
    return response.data;
  },

  async createStudent(data) {
    const response = await api.post("/admin/students/add", data);
    return response.data;
  },

  async updateStudent(id, data) {
    const response = await api.put(`/admin/students/edit/${id}`, data);
    return response.data;
  },

  async deleteStudent(id, id_user) {
    const response = await api.patch(`/admin/students/${id}/deactivate`, {
      id_user,
    });
    return response.data;
  },

  async deactivateStudent(id, id_user) {
    const response = await api.patch(`/admin/students/${id}/deactivate`, {
      id_user,
    });
    return response.data;
  },

  async bulkChangeClass(studentIds, classId) {
    const response = await api.patch("/admin/students/bulk/class", {
      id_siswa_list: studentIds,
      id_kelas: classId,
    });
    return response.data;
  },

  async bulkChangeStatus(studentIds, status) {
    const response = await api.patch("/admin/students/bulk/status", {
      id_siswa_list: studentIds,
      status_aktif: status,
    });
    return response.data;
  },

  async resetPassword(id, customPassword) {
    const response = await api.post(`/admin/students/${id}/reset-password`, {
      customPassword,
    });
    return response.data;
  },
};

export default studentService;
