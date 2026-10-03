import {
  findAttendanceHistoryByUser,
  findStudentDashboardByUserId,
  findStudentProfileByUserId,
} from "../../services/student/student-service.js";

export async function getStudentDashboard(req, res) {
  try {
    const id_siswa = req.user.id_siswa;

    console.log("USER DARI TOKEN:", req.user);
    console.log("ID USER:", id_siswa);

    const dashboard = await findStudentDashboardByUserId(id_siswa);

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
      recentAttendance: dashboard.recentAttendance,
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

    const idUser = req.user.id_user;

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

export const getMyAttendanceHistoryByUser = async (req, res) => {
  try {
    const id_siswa = req.user.id_siswa;
    const { page, limit, date, status } = req.query;

    const result = await findAttendanceHistoryByUser({
      id_siswa,
      page,
      limit,
      date,
      status,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
      console.error("getMyAttendanceHistory error:", error);
    }

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500 ? "Terjadi kesalahan pada server" : error.message,
    });
  }
};
