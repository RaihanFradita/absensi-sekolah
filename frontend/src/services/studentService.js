import api from "./api";

const studentService = {
  async getStudents() {
    const response = await api.get("/admin/students");
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

  async deleteStudent(id) {
    const response = await api.delete(`/admin/students/${id}`, { method: "DELETE" });
    return response.data;
  },
};

export default studentService;

