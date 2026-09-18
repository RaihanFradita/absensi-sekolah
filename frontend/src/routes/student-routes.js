import exspress from "express";
import {
  getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,  
} from "../controllers/student-controller.js";

export const students = exspress.Router();

students.get("/", getStudents);
students.get("/:id", getStudent);
students.post("/", createStudent);
students.put("/:id", updateStudent);
students.delete("/:id", deleteStudent);