import { pool } from "../../config/database.js";

export async function findStudentDashboardByUserId(idUser) {
  // =========================
  // DATA SISWA
  // =========================
  const [studentRows] = await pool.query(
    `
      SELECT
        s.id_siswa,
        s.id_user,
        s.nama_siswa,
        s.id_kelas,
        s.status_aktif,
        k.nama_kelas,
        k.tingkat
      FROM siswa s
      INNER JOIN kelas k
        ON s.id_kelas = k.id_kelas
      WHERE s.id_user = ?
      LIMIT 1
    `,
    [idUser],
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
        a.status
      FROM absensi a
      WHERE a.id_siswa = ?
    `,
    [student.id_siswa],
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
      status === "tidak_hadir" ||
      status === "tidak hadir" ||
      status === "alpha" ||
      status === "alpa" ||
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
        a.waktu_absen,
        a.waktu_scan
      FROM absensi a
      WHERE a.id_siswa = ?
        AND DATE(
          COALESCE(a.waktu_scan, a.waktu_absen)
        ) = CURDATE()
      ORDER BY
        COALESCE(a.waktu_scan, a.waktu_absen) DESC
      LIMIT 1
    `,
    [student.id_siswa],
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
        a.waktu_absen,
        a.waktu_scan
      FROM absensi a
      WHERE a.id_siswa = ?
      ORDER BY
        COALESCE(a.waktu_scan, a.waktu_absen) DESC
      LIMIT 5
    `,
    [student.id_siswa],
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