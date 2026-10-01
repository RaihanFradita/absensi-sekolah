import {
  findAllStudents,
  findStudentById,
  findAllClasses,
  insertStudents,
  updateStudentById,
  softDeleteStudent,
} from "../../services/admin/admin-student-service.js";

export const createStudent = async (req, res) => {
  const {
    namaSiswa,
    nama_siswa,
    idKelas,
    id_kelas,
    username,
    password,
  } = req.body;

  const finalNamaSiswa = namaSiswa || nama_siswa;
  const finalIdKelas = idKelas || id_kelas;

  if (!finalNamaSiswa || !finalIdKelas || !username || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Semua field (Nama Siswa, Username, Kelas, Password) wajib diisi!",
    });
  }

  try {
    const result = await insertStudents({
      namaSiswa: finalNamaSiswa,
      idKelas: finalIdKelas,
      username,
      password,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("createStudent:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Terjadi kesalahan server",
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

export const editStundent = async (req, res) => {
  const { id_siswa } = req.params;

  const {
    id_user,
    username,
    namaSiswa,
    nama_siswa,
    idKelas,
    id_kelas,
    password,
  } = req.body;

  const finalNamaSiswa = namaSiswa || nama_siswa;
  const finalIdKelas = idKelas || id_kelas;

  if (!id_siswa) {
    return res.status(400).json({
      success: false,
      message: "ID siswa tidak ditemukan",
    });
  }

  let finalIdUser = id_user;

  if (!finalIdUser) {
    const existingStudent = await findStudentById(id_siswa);

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Data siswa tidak ditemukan",
      });
    }

    finalIdUser = existingStudent.id_user;
  }

  if (!finalIdUser || !username || !finalNamaSiswa || !finalIdKelas) {
    return res.status(400).json({
      success: false,
      message:
        "Semua field (Nama Siswa, Username, Kelas) wajib diisi",
    });
  }

  try {
    const result = await updateStudentById({
      id_user: finalIdUser,
      id_siswa,
      namaSiswa: finalNamaSiswa,
      idKelas: finalIdKelas,
      username,
      password,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("editStundent:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Terjadi kesalahan server",
    });
  }
};

export const deleteStudent = async (req, res) => {
  const { id_siswa } = req.params;
  const { id_user } = req.body;

  if (!id_siswa || !id_user) {
    return res.status(400).json({
      success: false,
      message: "ID siswa atau ID user tidak ditemukan",
    });
  }

  try {
    const result = await softDeleteStudent({
      id_siswa,
      id_user,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("deleteStudent:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

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