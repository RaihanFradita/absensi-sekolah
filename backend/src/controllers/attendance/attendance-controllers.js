import {
  createNewSession,
  findActiveSessionByTeacherId,
  findTodayActiveSessionByTeacherId,
  endSessionById,
  scanQrAbsensi,
  getDailyByClass,
  manualAttendance,
  getKehadiranKelasTanggal,
} from "../../services/attendance/attendance-services.js";
import { getIO } from "../../socket.js";

import ExcelJS from "exceljs";

const STATUS_LABEL = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  sakit: "Sakit",
  izin: "Izin",
  "tanpa keterangan": "Tanpa Ket.",
  "belum absen": "Belum Absen",
};

const STATUS_COLOR = {
  hadir: "C6EFCE",
  terlambat: "FFEB9C",
  sakit: "DDEBF7",
  izin: "E4DFEC",
  "tanpa keterangan": "FFC7CE",
  "belum absen": "EDEDED",
};

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

    // Opsional: filter sesi aktif berdasarkan kelas tertentu
    const idKelasParam = req.query.id_kelas;
    const id_kelas = idKelasParam ? Number(idKelasParam) || null : null;

    const result = await findTodayActiveSessionByTeacherId({
      id_guru,
      id_kelas,
    });
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

export const createManualAttendance = async (req, res) => {
  try {
    const { id_siswa, id_kelas, tanggal, status } = req.body;

    // validasi input wajib
    if (!id_siswa || !id_kelas || !tanggal || !status) {
      return res.status(400).json({
        success: false,
        message: "Data absensi belum lengkap",
      });
    }

    const result = await manualAttendance({
      id_siswa,
      id_kelas,
      tanggal,
      status,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Manual attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
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

    console.log(req.query);

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

// export excel
export const exportKehadiranExcel = async (req, res) => {
  try {
    const { id_kelas, tanggal } = req.query;
    if (!id_kelas || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal || "")) {
      return res.status(400).json({
        success: false,
        message: "id_kelas dan tanggal (YYYY-MM-DD) wajib diisi",
      });
    }

    const rows = await getKehadiranKelasTanggal({ id_kelas, tanggal });
    const namaKelas = rows[0]?.kelas ?? "-";

    // hitung ringkasan
    const count = (s) => rows.filter((r) => r.status === s).length;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`Rekap Kehadiran Kelas ${namaKelas}`);

    ws.mergeCells("A1:F1");
    ws.getCell("A1").value = "Data Kehadiran Siswa";
    ws.getCell("A1").font = { bold: true, size: 14 };
    ws.getCell("A2").value = "Kelas";
    ws.getCell("B2").value = namaKelas;
    ws.getCell("A3").value = "Tanggal";
    ws.getCell("B3").value = tanggal;

    ws.getCell("A5").value = "Total";
    ws.getCell("B5").value = rows.length;
    ws.getCell("C5").value = "Hadir";
    ws.getCell("D5").value = count("hadir");
    ws.getCell("E5").value = "Terlambat";
    ws.getCell("F5").value = count("terlambat");
    ws.getCell("A6").value = "Sakit";
    ws.getCell("B6").value = count("sakit");
    ws.getCell("C6").value = "Izin";
    ws.getCell("D6").value = count("izin");
    ws.getCell("E6").value = "Tanpa Ket.";
    ws.getCell("F6").value = count("tanpa keterangan");

    const HEADER_ROW = 8;
    const headers = [
      "No",
      "Nama Siswa",
      "Kelas",
      "Waktu Absen",
      "Status",
    ];
    ws.getRow(HEADER_ROW).values = headers;
    ws.getRow(HEADER_ROW).eachCell((c) => {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F3864" },
      };
    });

    rows.forEach((r, i) => {
      const row = ws.addRow([
        i + 1,
        r.nama_siswa,
        r.kelas,
        r.waktu_scan ?? "-",
        STATUS_LABEL[r.status] ?? r.status,
      ]);
      row.getCell(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF" + (STATUS_COLOR[r.status] ?? "FFFFFF") },
      };
    });

    ws.getColumn(1).width = 14;
    ws.getColumn(2).width = 30;
    ws.getColumn(3).width = 14;
    ws.getColumn(4).width = 22;
    ws.getColumn(5).width = 16;
    ws.getCell("E5").alignment = { horizontal: "left" };
    ws.views = [{ state: "frozen", ySplit: HEADER_ROW }];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="kehadiran-${namaKelas.replace(/\s/g, "")}-${tanggal}.xlsx"`,
    );
    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal export Excel" });
  }
};
