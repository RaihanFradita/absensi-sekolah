import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { auth } from "./routes/auth-routes.js";

export const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", auth);
