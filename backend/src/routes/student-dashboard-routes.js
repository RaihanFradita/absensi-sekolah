import express from "express";
import { verifyToken } from "../middleware/auth-middleware.js";
import { getStudentDashboard } from "../controllers/student-dashboard-controller.js";

const studentDashboard = express.Router();

studentDashboard.get("/", verifyToken, getStudentDashboard);

export { studentDashboard };