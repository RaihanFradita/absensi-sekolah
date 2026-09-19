import express from "express";
import {
  createTeacher,
  deleteTeacher,
  editTeacher,
  getAllTeachers,
} from "../controllers/teacher.controller.js";

export const teacher = express.Router();

teacher.get("/", getAllTeachers);
teacher.post("/add", createTeacher);
teacher.put("/edit/:id_guru", editTeacher);
teacher.patch("/:id_guru/deactivate", deleteTeacher);
