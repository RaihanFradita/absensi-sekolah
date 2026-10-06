import express from "express";
import {
  requirePasswordChange,
  verifyToken,
} from "../middleware/auth-middleware.js";
import {
  getMyAttendanceHistoryByUser,
  getStudentDashboard,
  getStudentProfile,
} from "../controllers/student/student-controller.js";

export const student = express.Router();

student.use(verifyToken);
student.use(requirePasswordChange);

student.get("/profile", getStudentProfile);
student.get("/dashboard", getStudentDashboard);
student.get("/attendance-histori", getMyAttendanceHistoryByUser);
