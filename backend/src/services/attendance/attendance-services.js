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

export const scanQrAbsensi = async ({ id_siswa, kode_qr }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [session] = await connection.query(
      `
      SELECT * FROM sesi_absensi WHERE kode_qr = ? FOR UPDATE
      `,
      [kode_qr],
    );

    if (session.length === 0) {
      const error = new Error("Kode QR tidak valid!");
      error.statusCode = 404;
      throw error;
    }

    const sesi = session[0];
    const now = new Date();

    if (sesi.status !== "aktif" || now > new Date(sesi.waktu_tutup)) {
      if (sesi.status === "aktif") {
        await connection.query(
          `
          UPDATE sesi_absensi SET status = 'tutup' WHERE id_sesi = ?
          `,
          [sesi.id_sesi],
        );
      }
      const error = new Error("Sesi absensi sudah berakhir!");
      error.statusCode = 400;
      throw error;
    }

    // pastikan siswa terdaftar di kelas sesi ini
    const [siswaKelas] = await connection.query(
      `
  SELECT
    s.id_siswa,
    s.nis,
    s.nama_siswa,
    k.tingkat,
    k.nama_kelas
  FROM siswa s
  JOIN kelas k ON k.id_kelas = s.id_kelas
  WHERE s.id_siswa = ? AND s.id_kelas = ?
  `,
      [id_siswa, sesi.id_kelas],
    );

    if (siswaKelas.length === 0) {
      const error = new Error("Kamu bukan siswa di kelas ini!");
      error.statusCode = 403;
      throw error;
    }

    const siswa = siswaKelas[0];

    // cek duplikat scan
    const [existing] = await connection.query(
      `
      SELECT id_absensi FROM absensi WHERE id_sesi = ? AND id_siswa = ?
      `,
      [sesi.id_sesi, id_siswa],
    );

    if (existing.length > 0) {
      const error = new Error("Kamu sudah melakukan absensi untuk hari ini");
      error.statusCode = 400;
      throw error;
    }

    const status =
      now <= new Date(sesi.batas_terlambat) ? "hadir" : "terlambat";

    await connection.query(
      `
        INSERT INTO absensi (id_sesi, id_siswa, status, waktu_scan, waktu_catat) VALUES
        (?, ?, ?, ?, ?)
        `,
      [sesi.id_sesi, id_siswa, status, now, now],
    );

    await connection.commit();

    return {
      success: true,
      message: `Absensi berhasil, status: ${status}`,
      data: {
        status,
        waktu_scan: now,
        siswa: {
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          nis: siswa.nis,
          kelas: `${siswa.tingkat}${siswa.nama_kelas}`,
        },
      },
    };
  } catch (error) {
    await connection.rollback();
    // ER_DUP_ENTRY dari unique key sebagai fallback race condition terakhir
    if (error.code === "ER_DUP_ENTRY") {
      error.message = "Kamu sudah melakukan absensi untuk sesi ini";
      error.statusCode = 400;
    }

    throw error;
  } finally {
    connection.release();
  }
};
