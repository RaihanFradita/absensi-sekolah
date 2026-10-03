import { pool } from "../../config/database.js";

export async function findStudentDashboardByUserId(id_siswa) {
  // =========================
  // DATA SISWA
  // =========================
  const [studentRows] = await pool.query(
    `
      SELECT
        s.id_siswa,
        s.nama_siswa,
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
