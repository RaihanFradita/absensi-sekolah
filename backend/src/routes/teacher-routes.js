import express from "express";
import {
  createTeacher,
  getAllTeachers,
} from "../controllers/teacher.controller.js";

export const teacher = express.Router();

teacher.get("/", getAllTeachers);
teacher.post("/add", createTeacher);
