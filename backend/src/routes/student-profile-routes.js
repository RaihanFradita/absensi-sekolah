import express from "express";
import { verifyToken } from "../middleware/auth-middleware.js";
import { getStudentProfile } from "../controllers/student-profile-controller.js";

export const studentProfile = express.Router();

studentProfile.get("/", verifyToken, getStudentProfile);