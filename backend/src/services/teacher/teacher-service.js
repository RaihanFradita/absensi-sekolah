import { pool } from "../../config/database.js";

export async function findTeacherDashboardByUserId(idUser, date) {
  console.log("[teacher-service] idUser:", idUser, "date:", date);

  // 1. Data guru
  const [teacherRows] = await pool.query(
    `SELECT g.id_guru, g.id_user, g.nama_guru FROM guru g WHERE g.id_user = ? LIMIT 1`,
    [idUser],
  );
  console.log("[teacher-service] teacherRows:", teacherRows);

  if (!teacherRows.length) return null;
  const teacher = teacherRows[0];

  // 2. Kelas guru — relasi ada di sesi_absensi (tidak ada id_guru di tabel kelas)
  //    Ambil kelas yang pernah/sedang dipakai guru ini, prioritaskan sesi terbaru.
  const [classRows] = await pool.query(
    `
    SELECT
      k.id_kelas,
      k.nama_kelas,
      k.tingkat
    FROM sesi_absensi sa
    INNER JOIN kelas k ON k.id_kelas = sa.id_kelas
    WHERE sa.id_guru = ?
      AND k.status_aktif = 1
    ORDER BY sa.id_sesi DESC
    LIMIT 1
    `,
    [teacher.id_guru],
  );
  console.log("[teacher-service] classRows:", classRows);

  const classData = classRows[0] || null;

  if (!classData) {
    return {
      teacher,
      class: null,
      summary: { hadir: 0, terlambat: 0, izin: 0, tidak_hadir: 0, total: 0 },
      students: [],
    };
  }

  // 3. Semua siswa di kelas
  const [studentRows] = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.id_kelas FROM siswa s WHERE s.id_kelas = ? AND s.status_aktif = 1 ORDER BY s.nama_siswa ASC`,
    [classData.id_kelas],
  );
  console.log("[teacher-service] studentRows count:", studentRows.length);

  // 4. Absensi berdasarkan tanggal — join via sesi_absensi
  let attendanceRows = [];
  try {
    const [rows] = await pool.query(
      `
      SELECT
        a.id_siswa,
        a.status,
        a.waktu_scan AS waktu_absen
      FROM absensi a
      INNER JOIN sesi_absensi sa ON a.id_sesi = sa.id_sesi
      INNER JOIN siswa s ON a.id_siswa = s.id_siswa
      WHERE s.id_kelas = ?
        AND sa.tanggal = ?
      `,
      [classData.id_kelas, date],
    );
    attendanceRows = rows;
  } catch (err) {
    console.error("[teacher-service] ERROR query absensi:", err.message, err.sqlMessage);
    throw err;
  }
  console.log("[teacher-service] attendanceRows count:", attendanceRows.length);

  // 5. Map absensi
  const attendanceMap = new Map();
  for (const a of attendanceRows) {
    attendanceMap.set(a.id_siswa, a);
  }

  // 6. Gabungkan siswa + absensi
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

  // 7. Summary
  const summary = { hadir: 0, terlambat: 0, izin: 0, tidak_hadir: 0, total: students.length };
  for (const s of students) {
    const st = String(s.status || "").toLowerCase();
    if (st === "hadir") summary.hadir += 1;
    else if (st === "terlambat") summary.terlambat += 1;
    else if (st === "izin" || st === "sakit") summary.izin += 1;
    else summary.tidak_hadir += 1;
  }

  return { teacher, class: classData, summary, students };
}
