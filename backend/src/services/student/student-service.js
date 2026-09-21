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
        s.nis,
        s.nama_siswa,
        s.id_kelas,
        s.status_aktif,
        k.nama_kelas,
        k.tingkat,
        k.tahun_ajaran
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
  //
  // Sesuaikan nama tabel/kolom
  // dengan schema absensi kamu.
  //
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
    const status = String(attendance.status).toLowerCase();

    if (status === "hadir") {
      present++;
    } else if (status === "terlambat") {
      late++;
    } else if (
      status === "tidak_hadir" ||
      status === "tidak hadir" ||
      status === "alpha" ||
      status === "alpa"
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
        a.status,
        a.waktu_absen
      FROM absensi a
      WHERE a.id_siswa = ?
        AND DATE(a.waktu_absen) = CURDATE()
      ORDER BY a.waktu_absen DESC
      LIMIT 1
    `,
    [student.id_siswa],
  );

  const today = todayRows[0] || null;

  return {
    student: {
      id: student.id_siswa,
      name: student.nama_siswa,
      nis: student.nis,
      className: student.nama_kelas,
      tingkat: student.tingkat,
      tahunAjaran: student.tahun_ajaran,
    },

    summary: {
      present,
      late,
      absent,
    },

    today,
  };
}

export async function findStudentProfileByUserId(idUser) {
  const [rows] = await pool.query(
    `
      SELECT
        s.id_siswa,
        s.id_user,
        s.nis,
        s.nama_siswa,
        s.id_kelas,
        k.nama_kelas,
        k.tingkat,
        k.tahun_ajaran,
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
