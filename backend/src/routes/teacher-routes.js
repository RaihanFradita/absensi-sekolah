import express from "express";
import {
  createTeacher,
  editTeacher,
  getAllTeachers,
} from "../controllers/teacher.controller.js";

export const teacher = express.Router();

teacher.get("/", getAllTeachers);
teacher.post("/add", createTeacher);
teacher.put("/edit/:id_guru", editTeacher);
