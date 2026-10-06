import { pool } from "../../config/database.js";

const ALLOWED_STATUS = [
  "hadir",
  "terlambat",
  "sakit",
  "izin",
  "tanpa keterangan",
];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function findStudentDashboardByUserId(id_siswa) {
  // =========================
  // DATA SISWA
  // =========================
  const [studentRows] = await pool.query(
    `
      SELECT
        s.id_siswa,
        s.nama_siswa,
        s.jenis_kelamin,
        k.nama_kelas,
        k.tingkat
      FROM siswa s
      INNER JOIN kelas k
        ON s.id_kelas = k.id_kelas
      WHERE s.id_siswa = ?
      LIMIT 1
    `,
    [id_siswa],
  );

  const student = studentRows[0];

  if (!student) {
    return null;
  }

  // =========================
  // RINGKASAN ABSENSI
  // =========================
  const [attendanceRows] = await pool.query(
    `
      SELECT
        status
      FROM absensi
      WHERE id_siswa = ?
    `,
    [id_siswa],
  );

  let present = 0;
  let late = 0;
  let absent = 0;

  for (const attendance of attendanceRows) {
    const status = String(attendance.status || "").toLowerCase();

    if (status === "hadir") {
      present++;
    } else if (status === "terlambat") {
      late++;
    } else if (
      status === "sakit" ||
      status === "izin" ||
      status === "tanpa keterangan"
    ) {
      absent++;
    }
  }

  // =========================
  // ABSENSI HARI INI
  // =========================
  const [todayRows] = await pool.query(
    `
      SELECT
        a.id_absensi,
        a.status,
        a.waktu_scan,
        a.keterangan
      FROM absensi a
      INNER JOIN sesi_absensi s
        ON a.id_sesi = s.id_sesi
      WHERE a.id_siswa = ?
        AND s.tanggal = CURDATE()
      LIMIT 1
    `,
    [id_siswa],
  );

  const today = todayRows[0] || null;

  // =========================
  // RIWAYAT ABSENSI TERBARU
  // =========================
  const [recentAttendanceRows] = await pool.query(
    `
      SELECT
        a.id_absensi,
        a.status,
        a.waktu_scan,
        a.keterangan,
        s.tanggal
      FROM absensi a
      INNER JOIN sesi_absensi s
        ON a.id_sesi = s.id_sesi
      WHERE a.id_siswa = ?
      ORDER BY s.tanggal DESC, a.waktu_scan DESC
      LIMIT 5
    `,
    [id_siswa],
  );

  // =========================
  // RESPONSE DASHBOARD
  // =========================
  return {
    student: {
      id: student.id_siswa,
      name: student.nama_siswa,
      className: student.nama_kelas,
      tingkat: student.tingkat,
    },

    summary: {
      present,
      late,
      absent,
    },

    today,

    recentAttendance: recentAttendanceRows,
  };
}

export async function findStudentProfileByUserId(idUser) {
  const [rows] = await pool.query(
    `
      SELECT
        s.id_siswa,
        s.id_user,
        s.nama_siswa,
      s.jenis_kelamin,
        s.id_kelas,
        k.nama_kelas,
        k.tingkat,
        s.status_aktif,
        u.username
      FROM siswa s
      INNER JOIN users u
        ON s.id_user = u.id_user
      INNER JOIN kelas k
        ON s.id_kelas = k.id_kelas
      WHERE s.id_user = ?
        AND u.role = 'siswa'
      LIMIT 1
    `,
    [idUser],
  );

  return rows[0];
}

export const findAttendanceHistoryByUser = async ({
  id_siswa,
  page = 1,
  limit = 10,
  date,
  status,
}) => {
  // sanitasi input supaya aman dan tidak negatif
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (currentPage - 1) * perPage;

  // validasi filter
  if (date && !DATE_REGEX.test(date)) {
    const err = new Error("Format tanggal tidak valid (gunakan yyyy-mm-dd");
    err.statusCode = 400;
    throw err;
  }
  if (status && !ALLOWED_STATUS.includes(status)) {
    const err = new Error("Status tidak valid");
    err.statusCode = 400;
    throw err;
  }

  // WHERE dinamis, dipakai bersama oleh query COUNT dan query data
  const conditions = ["s.id_siswa = ?"];
  const params = [id_siswa];

  if (date) {
    conditions.push("se.tanggal = ?");
    params.push(date);
  }

  if (status) {
    conditions.push("a.status = ?");
    params.push(status);
  }

  const whereClause = conditions.join(" AND ");

  // hitung total data
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM absensi a
    INNER JOIN sesi_absensi se ON
    a.id_sesi = se.id_sesi
    INNER JOIN siswa s ON
    a.id_siswa = s.id_siswa
    WHERE ${whereClause}
    `,
    params,
  );

  const [rows] = await pool.query(
    `
    SELECT
      a.id_absensi,
      a.id_sesi,
      DATE_FORMAT(se.tanggal, '%Y-%m-%d') AS tanggal,
      a.status,
      a.waktu_scan,
      a.waktu_catat,
      a.keterangan,
      k.nama_kelas,
      k.tingkat
    FROM absensi a
    INNER JOIN sesi_absensi se
      ON a.id_sesi = se.id_sesi
    INNER JOIN siswa s
      ON a.id_siswa = s.id_siswa
    INNER JOIN kelas k
      ON se.id_kelas = k.id_kelas
    WHERE ${whereClause}
    ORDER BY se.tanggal DESC, a.id_absensi DESC
    LIMIT ? OFFSET ?
  `,
    [...params, perPage, offset],
  );

  const totalPages = Math.ceil(total / perPage);

  return {
    data: rows,
    pagination: {
      page: currentPage,
      limit: perPage,
      totalItems: total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};
