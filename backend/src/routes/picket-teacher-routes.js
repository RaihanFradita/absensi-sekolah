import express from "express";

import { requireRole, verifyToken } from "../middleware/auth-middleware.js";
import {
  getDaily,
  getDutyDashboard,
  exportDaily,
} from "../controllers/picket-teacher/picket-teacher-controllers.js";

export const picketTeacher = express.Router();

picketTeacher.use(verifyToken);
picketTeacher.use(requireRole("guru_piket"));

picketTeacher.get("/dashboard", getDutyDashboard);
picketTeacher.get("/daily", getDaily);
picketTeacher.get("/export", exportDaily);
