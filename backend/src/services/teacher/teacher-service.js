import { pool } from "../../config/database.js";

/**
 * Ambil semua kelas aktif, urut berdasarkan nama_kelas.
 * @returns {Array} [{ id_kelas, nama_kelas, tingkat }]
 */
export async function findAllActiveClasses() {
  const [rows] = await pool.query(
    `SELECT
      id_kelas,
      nama_kelas,
      tingkat
    FROM kelas
    WHERE status_aktif = 1
    ORDER BY tingkat ASC, nama_kelas ASC`,
  );
  return rows;
}

/**
 * Ambil data dashboard guru.
 * - Tidak lagi bergantung pada relasi wali kelas.
 * - Jika id_kelas tidak dikirim, pakai kelas pertama (urut nama_kelas).
 *
 * @param {number} idUser - ID user dari token JWT
 * @param {string} date   - Format YYYY-MM-DD
 * @param {number|null} idKelas - ID kelas (opsional)
 */
export async function findTeacherDashboardByUserId(
  idUser,
  date,
  idKelas = null,
) {
  console.log(
    "[teacher-service] idUser:",
    idUser,
    "date:",
    date,
    "idKelas:",
    idKelas,
  );

  // 1. Daftar semua kelas aktif
  const allClasses = await findAllActiveClasses();
  console.log("[teacher-service] allClasses count:", allClasses.length);

  if (!allClasses.length) {
    // Tidak ada kelas sama sekali – kembalikan respons kosong
    return {
      classes: [],
      class: null,
      summary: {
        hadir: 0,
        terlambat: 0,
        izin: 0,
        sakit: 0,
        tidak_hadir: 0,
        total: 0,
      },
      students: [],
    };
  }

  // 2. Tentukan kelas terpilih
  let classData = null;
  if (idKelas) {
    classData = allClasses.find((c) => c.id_kelas === Number(idKelas)) || null;
  }
  // Fallback: kelas pertama (sudah urut nama_kelas)
  if (!classData) {
    classData = allClasses[0];
  }

  console.log("[teacher-service] classData:", classData);

  // 3. Semua siswa aktif di kelas terpilih
  const [studentRows] = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.id_kelas
     FROM siswa s
     WHERE s.id_kelas = ? AND s.status_aktif = 1
     ORDER BY s.nama_siswa ASC`,
    [classData.id_kelas],
  );
  console.log("[teacher-service] studentRows count:", studentRows.length);

  // 4. Absensi berdasarkan tanggal dan kelas — join via sesi_absensi
  let attendanceRows = [];
  try {
    const [rows] = await pool.query(
      `SELECT
         a.id_siswa,
         a.status,
         a.waktu_scan AS waktu_absen
       FROM absensi a
       INNER JOIN sesi_absensi sa ON a.id_sesi = sa.id_sesi
       INNER JOIN siswa s ON a.id_siswa = s.id_siswa
       WHERE s.id_kelas = ?
         AND sa.tanggal = ?`,
      [classData.id_kelas, date],
    );
    attendanceRows = rows;
  } catch (err) {
    console.error(
      "[teacher-service] ERROR query absensi:",
      err.message,
      err.sqlMessage,
    );
    throw err;
  }
  console.log("[teacher-service] attendanceRows count:", attendanceRows.length);

  // 5. Map absensi per siswa (ambil entri terbaru jika ada duplikat)
  const attendanceMap = new Map();
  for (const a of attendanceRows) {
    attendanceMap.set(a.id_siswa, a);
  }

  // 6. Gabungkan siswa + absensi; siswa tanpa data → tidak_hadir
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

  // 7. Summary — hitung sakit secara terpisah
  const summary = {
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    tidak_hadir: 0,
    total: students.length,
  };
  for (const s of students) {
    const st = String(s.status || "").toLowerCase();
    if (st === "hadir") summary.hadir += 1;
    else if (st === "terlambat") summary.terlambat += 1;
    else if (st === "izin") summary.izin += 1;
    else if (st === "sakit") summary.sakit += 1;
    else summary.tidak_hadir += 1;
  }

  return {
    classes: allClasses,
    class: classData,
    summary,
    students,
  };
}
