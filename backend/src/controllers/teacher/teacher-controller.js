import {
  findAllClass,
  findTeacherProfile,
} from "../../services/admin/admin-teacher-service.js";
import { findTeacherDashboardByUserId } from "../../services/teacher/teacher-service.js";

export async function getTeacherDashboard(req, res) {
  console.log("getTeacherDashboard TERPANGGIL");

  try {
    console.log("USER DARI TOKEN:", req.user);

    const idUser = req.user.id_user;

    console.log("ID USER:", idUser);

    if (!idUser) {
      return res.status(401).json({
        success: false,
        message: "ID user tidak ditemukan dari token.",
      });
    }

    const date = req.query.date || new Date().toISOString().slice(0, 10);

    console.log("TANGGAL DASHBOARD:", date);

    const dashboard = await findTeacherDashboardByUserId(idUser, date);

    console.log("HASIL DASHBOARD GURU:", dashboard);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Data dashboard guru tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      teacher: dashboard.teacher,
      class: dashboard.class,
      summary: dashboard.summary,
      students: dashboard.students || [],
      date,
    });
  } catch (error) {
    console.error("getTeacherDashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard guru.",
    });
  }
}

export const getAllClass = async (req, res) => {
  try {
    const result = await findAllClass();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getTeacherProfile = async (req, res) => {
  try {
    const idUser = req.user?.id_user;

    if (!idUser) {
      return res.status(401).json({
        success: false,
        message: "ID user tidak ditemukan dari token.",
      });
    }

    const result = await findTeacherProfile(idUser);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("getTeacherProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil guru.",
    });
  }
};
