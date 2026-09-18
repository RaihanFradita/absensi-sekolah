import {
  findAllStudents,
  findStudentById,
  findAllClasses,
} from "../services/student-service.js";

export async function getStudents(req, res) {
  try {
    const students = await findAllStudents();

    res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("getStudents:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data siswa.",
    });
  }
}

export async function getStudent(req, res) {
  try {
    const { id } = req.params;

    const student = await findStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("getStudent:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data siswa.",
    });
  }
}

export async function getClasses(req, res) {
  try {
    const classes = await findAllClasses();

    res.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("getClasses:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data kelas.",
    });
  }
}