import {
  findAllStudents,
  findStudentById,
  findAllClasses,
  insertStudents,
} from "../../services/admin/admin-student-service.js";

export const createStudent = async (req, res) => {
  const { nis, namaSiswa, idKelas, username, password } = req.body;

  if (!nis || !namaSiswa || !idKelas || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi!",
    });
  }

  try {
    const result = await insertStudents({
      nis,
      namaSiswa,
      idKelas,
      username,
      password,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

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
