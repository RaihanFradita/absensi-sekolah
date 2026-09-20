import express from "express";
import {
  createTeacher,
  deleteTeacher,
  editTeacher,
  getAllTeachers,
  getTeacherById,
} from "../controllers/admin/admin-teacher-controller.js";
import {
  getStudents,
  getStudent,
  getClasses,
} from "../controllers/admin/admin-student-controller.js";

export const admin = express.Router();

// route guru
admin.get("/teacher/", getAllTeachers);
admin.get("/teacher/:id_guru", getTeacherById);
admin.post("/teacher/add", createTeacher);
admin.put("/teacher/edit/:id_guru", editTeacher);
admin.patch("/teacher/:id_guru/deactivate", deleteTeacher);

// route siswa
admin.get("/student/", getStudents);
admin.get("/student/classes/list", getClasses);
admin.get("/student/:id", getStudent);
