import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { auth } from "./routes/auth-routes.js";
import { admin } from "./routes/admin-routes.js";
import { student } from "./routes/student-routes.js";
import { attandance } from "./routes/attendance-routes.js";
import { teacher } from "./routes/teacher-routes.js";

export const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: ["https://absensi-sekolah-to2v.vercel.app/"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/students", student);
app.use("/api/teacher", teacher);
app.use("/api/attendance", attandance);
