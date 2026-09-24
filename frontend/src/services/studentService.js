import api from "./api";

const studentService = {
  async getStudents() {
    const response = await api.get("/admin/students");
    return response.data;
  },

  async getStudent(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async getClasses() {
    const response = await api.get("/students/classes/list");
    return response.data;
  },

  async createStudent(data) {
    const response = await api.post("/students", data);
    return response.data;
  },

  async updateStudent(id, data) {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  async deleteStudent(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

export default studentService;
