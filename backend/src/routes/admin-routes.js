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
  createStudent,
  editStundent,
} from "../controllers/admin/admin-student-controller.js";
import {
  createClass,
  editClassById,
  getAllClass,
  getClassById,
  softDeleteClass,
} from "../controllers/admin/admin-class-controller.js";

export const admin = express.Router();

// route guru
admin.get("/teacher/", getAllTeachers);
admin.get("/teacher/:id_guru", getTeacherById);
admin.post("/teacher/add", createTeacher);
admin.put("/teacher/edit/:id_guru", editTeacher);
admin.patch("/teacher/:id_guru/deactivate", deleteTeacher);

// route siswa
admin.post("/students/add", createStudent);
admin.get("/students/", getStudents);
admin.get("/students/classes/list", getClasses);
admin.get("/students/:id", getStudent);
admin.put("/students/edit/:id_siswa", editStundent);
admin.put("/students/:id_siswa", editStundent);

// route kelas
admin.post("/class/add", createClass);
admin.get("/class", getAllClass);
admin.get("/class/:id_kelas", getClassById);
admin.put("/class/edit/:id_kelas", editClassById);
admin.patch("/class/:id_kelas/deactivate", softDeleteClass);
