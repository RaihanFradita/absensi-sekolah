import express from "express";
import { login } from "../controllers/auth-controllers.js";

export const auth = express.Router();

auth.post("/login", login);
