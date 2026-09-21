import {
  findStudentDashboardByUserId,
  findStudentProfileByUserId,
} from "../../services/student/student-service.js";

export async function getStudentDashboard(req, res) {
  try {
    const idUser = req.user.id;

    console.log("USER DARI TOKEN:", req.user);
    console.log("ID USER:", idUser);

    const dashboard = await findStudentDashboardByUserId(idUser);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Data dashboard siswa tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      student: dashboard.student,
      summary: dashboard.summary,
      today: dashboard.today,
    });
  } catch (error) {
    console.error("getStudentDashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard siswa.",
    });
  }
}

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
