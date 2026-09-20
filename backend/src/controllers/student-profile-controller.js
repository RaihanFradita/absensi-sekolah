import { findStudentProfileByUserId } from "../services/student-profile-service.js";

export async function getStudentProfile(req, res) {
  try {
    console.log("USER DARI TOKEN:", req.user);

    const idUser = req.user.id;

    console.log("ID USER:", idUser);

    const student = await findStudentProfileByUserId(idUser);

    console.log("DATA STUDENT:", student);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Profil siswa tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("getStudentProfile:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil siswa.",
    });
  }
}