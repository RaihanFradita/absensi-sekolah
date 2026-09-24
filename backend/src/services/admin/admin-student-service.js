import { pool } from "../../config/database.js";

export async function findAllStudents() {
  const [rows] = await pool.query(`
    SELECT
      s.id_siswa,
      s.nis,
      s.nama_siswa,
      s.id_kelas,
      k.nama_kelas,
      k.tingkat,
      s.status_aktif
    FROM siswa s
    INNER JOIN kelas k ON s.id_kelas = k.id_kelas
    ORDER BY s.nama_siswa ASC
  `);

  return rows;
}

export async function findStudentById(id) {
  const [rows] = await pool.query(
    `
      SELECT
        s.id_siswa,
        s.nis,
        s.nama_siswa,
        s.id_kelas,
        k.nama_kelas,
        k.tingkat,
        s.status_aktif
      FROM siswa s
      INNER JOIN kelas k ON s.id_kelas = k.id_kelas
      WHERE s.id_siswa = ?
    `,
    [id],
  );

  return rows[0];
}

export async function findAllClasses() {
  const [rows] = await pool.query(`
    SELECT
      id_kelas,
      nama_kelas,
      tingkat
    FROM kelas
    WHERE status_aktif = 1
    ORDER BY tingkat ASC, nama_kelas ASC
  `);

  return rows;
}
