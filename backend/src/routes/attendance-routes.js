import express from "express";
import { verifyToken } from "../middleware/auth-middleware.js";
import {
  createSession,
  getActiveSession,
  getTodayActiveSession,
  endSession,
  scanAbsensi,
  getDaily,
} from "../controllers/attendance/attendance-controllers.js";

export const attandance = express.Router();

attandance.use(verifyToken);
attandance.post("/sessions/add", createSession);
attandance.get("/sessions/today", getTodayActiveSession);
attandance.get("/sessions/daily", getDaily);
attandance.get("/sessions/active/:kode_qr", getActiveSession);
attandance.post("/sessions/:id/end", endSession);
attandance.post("/sessions/scan", scanAbsensi);
