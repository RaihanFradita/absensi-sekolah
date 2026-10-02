import {
  createNewSession,
  findActiveSessionByTeacherId,
  findTodayActiveSessionByTeacherId,
  endSessionById,
  scanQrAbsensi,
  getDailyByClass,
} from "../../services/attendance/attendance-services.js";
import { getIO } from "../../socket.js";

export const createSession = async (req, res, next) => {
  try {
    const id_guru = req.user.id_guru;
    const { id_kelas, batas_terlambat_menit } = req.body;

    if (!id_guru) {
      return res.status(400).json({
        success: false,
        message: "id tidak ditemukan!",
      });
    }
    if (!id_kelas) {
      return res.status(400).json({
        success: false,
        message: "Kelas wajib dipilih!",
      });
    }
    if (
      batas_terlambat_menit === undefined ||
      batas_terlambat_menit === null ||
      Number(batas_terlambat_menit) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Batas terlambat (menit) wajib diisi dengan angka valid!",
      });
    }

    const result = await createNewSession({
      id_guru,
      id_kelas,
      batas_terlambat_menit: Number(batas_terlambat_menit),
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

export const getTodayActiveSession = async (req, res) => {
  try {
    const id_guru = req.user.id_guru;
    if (!id_guru) {
      return res.status(400).json({
        success: false,
        message: "id guru tidak ditemukan!",
      });
    }

    const result = await findTodayActiveSessionByTeacherId({ id_guru });
    if (!result.success) {
      return res.status(200).json({
        success: false,
        message: result.message,
        data: null,
      });
    }

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const endSession = async (req, res) => {
  try {
    const id_guru = req.user.id_guru;
    const { id } = req.params;

    if (!id_guru) {
      return res.status(400).json({
        success: false,
        message: "id guru tidak ditemukan!",
      });
    }

    const result = await endSessionById({ id_guru, id_sesi: id });
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
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
      const payload = {
        event: "attendance_created",
        id_siswa: siswa.id_siswa,
        nama_siswa: siswa.nama_siswa,
        nama_kelas: siswa.kelas,
        status,
        waktu_scan,
      };
      getIO()
        .to(`session:${id_sesi}`)
        .to(`session:${kode_qr}`)
        .emit("attendance_created", payload);
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

const isValidDate = (str) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(`${str}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
};

export const getDaily = async (req, res) => {
  try {
    const { kelas_id: kelasIdRaw, tanggal } = req.query;

    const kelasId = Number(kelasIdRaw);
    if (!kelasIdRaw || !Number.isInteger(kelasId) || kelasId <= 0) {
      return res
        .status(400)
        .json({ message: "kelas_id wajib berupa angka yang valid" });
    }

    if (tanggal && !isValidDate(tanggal)) {
      return res
        .status(400)
        .json({ message: "Format tanggal harus YYYY-MM-DD" });
    }

    const data = await getDailyByClass({ kelasId, tanggal });
    return res.json({ data });
  } catch (err) {
    console.error("getDaily error:", err);
    return res.status(500).json({ message: "Gagal mengambil data kehadiran" });
  }
};
