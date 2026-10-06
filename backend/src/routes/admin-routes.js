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
  deleteStudent,
} from "../controllers/admin/admin-student-controller.js";
import {
  createClass,
  editClassById,
  getAllClass,
  getClassById,
  softDeleteClass,
} from "../controllers/admin/admin-class-controller.js";
import {
  createPicketTeacher,
  deletePicketTeacher,
  editPicketTeacher,
  getAllPicketTeachers,
  getPicketTeacherById,
} from "../controllers/admin/admin-picket-teacher-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

export const admin = express.Router();

admin.use(verifyToken);

// route guru
admin.get("/teacher/", getAllTeachers);
admin.get("/teacher/:id_guru", getTeacherById);
admin.post("/teacher/add", createTeacher);
admin.put("/teacher/edit/:id_guru", editTeacher);
admin.patch("/teacher/:id_guru/deactivate", deleteTeacher);

// guru piket
admin.post("/picket-teacher/add", createPicketTeacher);
admin.get("/picket-teacher", getAllPicketTeachers);
admin.get("/picket-teacher/:id_user", getPicketTeacherById);
admin.patch("/picket-teacher/edit/:id_user", editPicketTeacher);
admin.patch("/picket-teacher/:id_user/deactivate", deletePicketTeacher);

// route siswa
admin.post("/students/add", createStudent);
admin.get("/students/", getStudents);
admin.get("/students/classes/list", getClasses);
admin.get("/students/:id", getStudent);
admin.put("/students/edit/:id_siswa", editStundent);
admin.put("/students/:id_siswa", editStundent);
admin.patch("/students/:id_siswa/deactivate", deleteStudent);

// route kelas
admin.post("/class/add", createClass);
admin.get("/class", getAllClass);
admin.get("/class/:id_kelas", getClassById);
admin.put("/class/edit/:id_kelas", editClassById);
admin.patch("/class/:id_kelas/deactivate", softDeleteClass);
