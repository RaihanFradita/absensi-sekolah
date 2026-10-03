import { pool } from "../../config/database.js";

/**
 * Mengambil dashboard Guru berdasarkan id_user.
 *
 * Data:
 * - teacher  : informasi guru
 * - class    : kelas yang menjadi tanggung jawab guru
 * - summary  : jumlah status kehadiran
 * - students : daftar siswa dan status absensi pada tanggal tertentu
 */
export async function findTeacherDashboardByUserId(idUser, date) {
  // =========================
  // 1. Ambil data guru
  // =========================
  const [teacherRows] = await pool.query(
    `
    SELECT
      g.id_guru,
      g.id_user,
      g.nama_guru
    FROM guru g
    WHERE g.id_user = ?
    LIMIT 1
    `,
    [idUser],
  );

  if (!teacherRows.length) {
    return null;
  }

  const teacher = teacherRows[0];

  // =========================
  // 2. Ambil kelas guru
  // =========================
  const [classRows] = await pool.query(
    `
    SELECT
      k.id_kelas,
      k.nama_kelas,
      k.tingkat
    FROM kelas k
    WHERE k.id_guru = ?
      AND k.status_aktif = 1
    LIMIT 1
    `,
    [teacher.id_guru],
  );

  const classData = classRows[0] || null;

  // Guru belum memiliki kelas
  if (!classData) {
    return {
      teacher,
      class: null,
      summary: {
        hadir: 0,
        terlambat: 0,
        izin: 0,
        tidak_hadir: 0,
        total: 0,
      },
      students: [],
    };
  }

  // =========================
  // 3. Ambil semua siswa di kelas
  // =========================
  const [studentRows] = await pool.query(
    `
    SELECT
      s.id_siswa,
      s.nama_siswa,
      s.id_kelas
    FROM siswa s
    WHERE s.id_kelas = ?
      AND s.status_aktif = 1
    ORDER BY s.nama_siswa ASC
    `,
    [classData.id_kelas],
  );

  // =========================
  // 4. Ambil absensi berdasarkan tanggal
  // =========================
  const [attendanceRows] = await pool.query(
    `
    SELECT
      a.id_siswa,
      a.status,
      a.waktu_absen
    FROM absensi a
    INNER JOIN siswa s
      ON s.id_siswa = a.id_siswa
    WHERE s.id_kelas = ?
      AND DATE(a.waktu_absen) = ?
    `,
    [classData.id_kelas, date],
  );

  // =========================
  // 5. Buat map absensi
  // =========================
  const attendanceMap = new Map();

  for (const attendance of attendanceRows) {
    attendanceMap.set(attendance.id_siswa, attendance);
  }

  // =========================
  // 6. Gabungkan siswa + absensi
  // =========================
  const students = studentRows.map((student) => {
    const attendance = attendanceMap.get(student.id_siswa);

    return {
      id_siswa: student.id_siswa,
      nama_siswa: student.nama_siswa,
      id_kelas: student.id_kelas,
      status: attendance?.status || "tidak_hadir",
      waktu_absen: attendance?.waktu_absen || null,
    };
  });

  // =========================
  // 7. Hitung summary
  // =========================
  const summary = {
    hadir: 0,
    terlambat: 0,
    izin: 0,
    tidak_hadir: 0,
    total: students.length,
  };

  for (const student of students) {
    const status = String(student.status || "").toLowerCase();

    if (status === "hadir") {
      summary.hadir += 1;
    } else if (status === "terlambat") {
      summary.terlambat += 1;
    } else if (status === "izin") {
      summary.izin += 1;
    } else {
      summary.tidak_hadir += 1;
    }
  }

  // =========================
  // 8. Return dashboard
  // =========================
  return {
    teacher,
    class: classData,
    summary,
    students,
  };
}
