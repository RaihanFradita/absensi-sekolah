import api from "../api";

export const teacherServices = {
  async getAllClass() {
    const response = await api.get("/teachers/class");
    return response.data;
  },
};
