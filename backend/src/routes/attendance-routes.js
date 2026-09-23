import express from "express";
import { verifyToken } from "../middleware/auth-middleware.js";
import { createSession } from "../controllers/attendance/attendance-controllers.js";

export const attandance = express.Router();

attandance.use(verifyToken);
attandance.post("/sessions/add", createSession);
