import {
  createNewSession,
  findActiveSessionByTeacherId,
  scanQrAbsensi,
} from "../../services/attendance/attendance-services.js";
import { getIO } from "../../socket.js";

export const createSession = async (req, res, next) => {
  try {
    const id_guru = req.user.id_guru;
    const { id_kelas, durasi_menit, batas_terlambat_menit } = req.body;

    if (!id_guru) {
      return res.status(400).json({
        success: false,
        message: "id tidak ditemukan!",
      });
    }
    if (!id_kelas || !durasi_menit || !batas_terlambat_menit) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi!",
      });
    }

    const result = await createNewSession({
      id_guru,
      id_kelas,
      durasi_menit,
      batas_terlambat_menit,
    });

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
  const id_guru = req.user.id_guru;
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

export const scanAbsensi = async (req, res) => {
  try {
    const { kode_qr } = req.body;
    const id_siswa = req.user.id_siswa;

    if (!kode_qr) {
      return res.status(400).json({
        success: false,
        message: "Kode QR tidak ditemukan!",
      });
    }

    if (!id_siswa) {
      return res.status(400).json({
        success: false,
        message: "id tidak ditemukan!",
      });
    }

    const result = await scanQrAbsensi({ id_siswa, kode_qr });

    // Notifikasi real-time ke halaman guru. Dibungkus try/catch sendiri
    // supaya kegagalan socket tidak membuat scan siswa terlihat gagal.
    try {
      const { id_sesi, status, waktu_scan, siswa } = result.data;
      getIO().to(`session:${id_sesi}`).emit("attendance_created", {
        event: "attendance_created",
        id_siswa: siswa.id_siswa,
        nama_siswa: siswa.nama_siswa,
        nama_kelas: siswa.kelas,
        status,
        waktu_scan,
      });
    } catch (socketError) {
      console.error("Gagal emit attendance_created:", socketError);
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
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
