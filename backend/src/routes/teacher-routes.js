import express from "express";

import { verifyToken } from "../middleware/auth-middleware.js";

import {
  getAllClass,
  getTeacherDashboard,
} from "../controllers/teacher/teacher-controller.js";

export const teacher = express.Router();

teacher.use(verifyToken);

teacher.get("/class", getAllClass);
teacher.get("/dashboard", getTeacherDashboard);
