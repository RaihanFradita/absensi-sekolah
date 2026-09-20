import { pool } from "../config/database.js";

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
    [idUser]
  );

  return rows[0];
}