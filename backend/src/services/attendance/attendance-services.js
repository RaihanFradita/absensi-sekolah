import { pool } from "../../config/database.js";
import crypto from "crypto";

export const createNewSession = async ({
  id_guru,
  id_kelas,
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

    // waktu buka dan batas_terlambat (tanpa batas waktu tutup)
    const waktu_buka = new Date();
    const batas_terlambat = new Date(
      waktu_buka.getTime() + Number(batas_terlambat_menit) * 60000,
    );
    const waktu_tutup = null;

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
        waktu_tutup: null,
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

  const sesi = result[0];

  // Ambil daftar siswa yang sudah scan pada sesi ini agar tabel
  // tetap terisi saat guru pindah halaman lalu kembali.
  const [attendees] = await pool.query(
    `
      SELECT
        a.id_absensi,
        a.id_siswa,
        a.status,
        a.waktu_scan,
        s.nama_siswa,
        CONCAT(k.tingkat, ' ', k.nama_kelas) AS nama_kelas
      FROM absensi a
      JOIN siswa s ON s.id_siswa = a.id_siswa
      JOIN kelas k ON k.id_kelas = s.id_kelas
      WHERE a.id_sesi = ?
      ORDER BY a.waktu_scan ASC
    `,
    [sesi.id_sesi],
  );

  return {
    success: true,
    message: "data berhasil diambil",
    data: {
      ...sesi,
      attendees,
    },
  };
};

export const findTodayActiveSessionByTeacherId = async ({ id_guru }) => {
  const today = new Date().toISOString().split("T")[0];
  const [result] = await pool.query(
    `
      SELECT * FROM sesi_absensi 
      WHERE id_guru = ? AND tanggal = ? AND status = 'aktif'
      ORDER BY id_sesi DESC
      LIMIT 1
    `,
    [id_guru, today],
  );

  if (result.length === 0) {
    return {
      success: false,
      message: "Tidak ada sesi aktif hari ini",
    };
  }

  return {
    success: true,
    message: "Sesi aktif ditemukan",
    data: result[0],
  };
};

export const endSessionById = async ({ id_guru, id_sesi }) => {
  const [result] = await pool.query(
    `
      UPDATE sesi_absensi 
      SET status = 'tutup', waktu_tutup = NOW() 
      WHERE (id_sesi = ? OR kode_qr = ?) AND id_guru = ? AND status = 'aktif'
    `,
    [id_sesi, id_sesi, id_guru],
  );

  if (result.affectedRows === 0) {
    return {
      success: false,
      message: "Sesi tidak ditemukan atau sudah ditutup",
    };
  }

  return {
    success: true,
    message: "Sesi absensi berhasil ditutup",
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

    if (sesi.status !== "aktif") {
      const error = new Error("Sesi absensi sudah ditutup oleh guru!");
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
        id_sesi: sesi.id_sesi,
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

export const getDailyByClass = async ({ kelasId, tanggal }) => {
  const getTodayWIB = () =>
    new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

  const date = tanggal || getTodayWIB();

  const [rows] = await pool.query(
    `
    SELECT
      s.id_siswa,
      s.nama_siswa,
      s.nis,
      kl.nama_kelas,
      a.id_absensi,
      a.waktu_scan,
      COALESCE(a.status, 'belum absen') AS status,
      a.keterangan
    FROM siswa s

    JOIN kelas kl
      ON kl.id_kelas = s.id_kelas

    LEFT JOIN sesi_absensi sa
      ON sa.id_kelas = s.id_kelas
      AND sa.tanggal = ?

    LEFT JOIN absensi a
      ON a.id_siswa = s.id_siswa
      AND a.id_sesi = sa.id_sesi

    WHERE s.id_kelas = ?

    ORDER BY s.nama_siswa ASC;
    `,
    [date, kelasId],
  );

  console.log(rows);

  return rows;
};
