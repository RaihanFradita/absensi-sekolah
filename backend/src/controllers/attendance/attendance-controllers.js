import {
  createNewSession,
  findActiveSessionByTeacherId,
} from "../../services/attendance/attendance-services.js";

export const createSession = async (req, res, next) => {
  try {
    const id_guru = req.user.id;
    const { id_kelas, durasi_menit } = req.body;

    if (!id_guru) {
      return res.status(400).json({
        success: false,
        message: "id tidak ditemukan!",
      });
    }
    if (!id_kelas || !durasi_menit) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi!",
      });
    }

    const result = await createNewSession({ id_guru, id_kelas, durasi_menit });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Tejadi kesalahan server",
      error: error.message,
    });
  }
};

export const getActiveSession = async (req, res) => {
  const id_guru = req.user.id;
  const { kode_qr } = req.params;

  if (!kode_qr) {
    return res.status(400).json({
      success: false,
      message: "data tidak ditemukan",
    });
  }

  try {
    const result = await findActiveSessionByTeacherId({ id_guru, kode_qr });
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
