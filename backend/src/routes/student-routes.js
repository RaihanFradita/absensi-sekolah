import express from "express";

import {
  getStudents,
  getStudent,
  getClasses,
} from "../controllers/student-controller.js";

export const students = express.Router();

students.get("/", getStudents);
students.get("/classes/list", getClasses);
students.get("/:id", getStudent);