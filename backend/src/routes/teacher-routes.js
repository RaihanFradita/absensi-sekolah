import express from "express";
import { verifyToken } from "../middleware/auth-middleware.js";
import { getAllClass } from "../controllers/admin/admin-class-controller.js";

export const teacher = express.Router();

teacher.use(verifyToken);
teacher.get("/class", getAllClass);
