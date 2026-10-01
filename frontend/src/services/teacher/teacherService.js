import api from "../api";

export const teacherServices = {
  async getAllClass() {
    const response = await api.get("/teacher/class");
    return response.data;
  },
};
