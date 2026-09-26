import { pool } from "../../config/database.js";
import crypto from "crypto";

export const createNewSession = async ({
  id_guru,
  id_kelas,
  durasi_menit,
  batas_terlambat_menit,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    // cek apakah guru sudah punya sesi 'aktif' di kelas dan tanggal yang sama
    const [existingSession] = await connection.query(
      `
        SELECT id_sesi FROM sesi_absensi
        WHERE id_guru = ? AND id_kelas = ? AND tanggal = ? AND status = 'aktif'
        FOR UPDATE
        `,
      [id_guru, id_kelas, today],
    );

    if (existingSession.length > 0) {
      const error = new Error(
        "Sesi kehadiran aktif untuk kelas ini sudah ada hari ini!",
      );
      error.statusCode = 400;
      throw error;
    }

    // generate kode qr acak dengan cryptografis
    const randomBytes = crypto.randomBytes(32).toString("hex");
    const kode_qr = `QR-${Date.now()}-${randomBytes.substring(0, 30)}`;

    // waktu buka, batas_terlambat dan tutup
    const waktu_buka = new Date();
    const batas_terlambat = new Date(
      waktu_buka.getTime() + batas_terlambat_menit * 60000,
    );
    const waktu_tutup = new Date(waktu_buka.getTime() + durasi_menit * 60000);

    // validasi batas terlambat tidak boleh melebihi waktu tutup
    if (batas_terlambat > waktu_tutup) {
      const error = new Error(
        "Batas terlambat tidak boleh lebih besar dari durasi qr",
      );
      error.statusCode = 400;
      throw error;
    }

    // insert ke database sesi_absensi
    const insertQuery = `
    INSERT INTO sesi_absensi (id_guru, id_kelas, tanggal, kode_qr, waktu_buka, batas_terlambat, waktu_tutup, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'aktif')
    `;
    const [result] = await connection.query(insertQuery, [
      id_guru,
      id_kelas,
      today,
      kode_qr,
      waktu_buka,
      batas_terlambat,
      waktu_tutup,
    ]);

    await connection.commit();

    return {
      success: true,
      message: "sesi berhasil dibuat",
      data: {
        id_sesi: result.insertId,
        id_guru,
        id_kelas,
        tanggal: today,
        kode_qr,
        waktu_buka,
        batas_terlambat,
        waktu_tutup,
        status: "aktif",
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const findActiveSessionByTeacherId = async ({ id_guru, kode_qr }) => {
  const [result] = await pool.query(
    `
      SELECT * FROM sesi_absensi WHERE id_guru = ? AND kode_qr = ?
    `,
    [id_guru, kode_qr],
  );

  if (result.length === 0) {
    return {
      success: false,
      message: "data tidak ditemukan",
    };
  }

  return {
    success: true,
    message: "data berhasil diambil",
    data: result[0],
  };
};
