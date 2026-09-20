import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { auth } from "./routes/auth-routes.js";
import { admin } from "./routes/admin-routes.js";
import { students } from "./routes/student-routes.js";
import { teacher } from "./routes/teacher-routes.js";
import { studentProfile } from "./routes/student-profile-routes.js";
import { studentDashboard } from "./routes/student-dashboard-routes.js";

export const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/students", students);
app.use("/api/teacher", teacher);
app.use("/api/student/profile", studentProfile);
app.use("/api/student/dashboard", studentDashboard);