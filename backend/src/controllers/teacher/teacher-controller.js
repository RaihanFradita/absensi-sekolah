import { findTeacherDashboardByUserId } from "../../services/teacher/teacher-service.js";
import { findAllClass, findTeacherProfile } from "../../services/admin/admin-teacher-service.js";

// Helper: validasi format YYYY-MM-DD
const isValidDate = (str) => {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(`${str}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
};

export async function getTeacherDashboard(req, res) {
  console.log("getTeacherDashboard TERPANGGIL");

  try {
    const idUser = req.user?.id_user;

    if (!idUser) {
      return res.status(401).json({
        success: false,
        message: "ID user tidak ditemukan dari token.",
      });
    }

    // Validasi date
    const dateParam = req.query.date;
    const date = dateParam || new Date().toISOString().slice(0, 10);

    if (dateParam && !isValidDate(dateParam)) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD.",
      });
    }

    // Validasi id_kelas (opsional)
    const idKelasParam = req.query.id_kelas;
    let idKelas = null;
    if (idKelasParam !== undefined && idKelasParam !== "") {
      idKelas = Number(idKelasParam);
      if (!Number.isInteger(idKelas) || idKelas <= 0) {
        return res.status(400).json({
          success: false,
          message: "id_kelas harus berupa angka positif.",
        });
      }
    }

    console.log("TANGGAL DASHBOARD:", date, "| ID KELAS:", idKelas);

    const dashboard = await findTeacherDashboardByUserId(idUser, date, idKelas);

    console.log("HASIL DASHBOARD GURU:", dashboard);

    return res.json({
      success: true,
      classes: dashboard.classes || [],
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
