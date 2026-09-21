import express from "express";
import { verifyToken } from "../middleware/auth-middleware.js";
import {
  getStudentDashboard,
  getStudentProfile,
} from "../controllers/student/student-controller.js";

export const student = express.Router();

student.get("/profile", verifyToken, getStudentProfile);
student.get("/dashboard", verifyToken, getStudentDashboard);
