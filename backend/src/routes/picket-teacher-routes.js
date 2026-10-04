import express from "express";

import { verifyToken } from "../middleware/auth-middleware.js";
import {
  getDaily,
  getDutyDashboard,
} from "../controllers/picket-teacher/picket-teacher-controllers.js";

export const picketTeacher = express.Router();

picketTeacher.use(verifyToken);

picketTeacher.get("/dashboard", getDutyDashboard);
picketTeacher.get("/daily", getDaily);
