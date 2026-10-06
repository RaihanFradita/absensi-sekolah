import express from "express";
import {
  login,
  logout,
  getMe,
  changePasswordController,
} from "../controllers/auth/auth-controllers.js";
import { verifyToken } from "../middleware/auth-middleware.js";

export const auth = express.Router();

auth.post("/login", login);
auth.post("/logout", logout);
auth.get("/me", verifyToken, getMe);

auth.post("/change-password", verifyToken, changePasswordController);
