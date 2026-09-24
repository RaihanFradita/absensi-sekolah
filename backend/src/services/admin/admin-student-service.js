import { pool } from "../../config/database.js";
import bcrypt from "bcrypt";

export const insertStudents = async ({
  nis,
  namaSiswa,
  idKelas,
  username,
  password,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ambil data user
    const [user] = await connection.query(
      `
      SELECT * FROM users WHERE username = ?
      `,
      [username],
    );

    if (user.length > 0) {
      await connection.rollback();
      return {
        success: false,
        message: "Username / NIS sudah digunakan",
      };
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // tambahkan data user
    const [insertUser] = await connection.query(
      `
      INSERT INTO users (username, password, role) VALUES
      (?, ?, ?)
      `,
      [username, passwordHash, "siswa"],
    );

    // jika gagal menambahkan data
    if (insertUser.affectedRows === 0) {
      await connection.rollback();
      return {
        success: false,
        message: "Gagal menambahkan data user",
      };
    }

    // ambil id yang baru dibuat
    const idUser = insertUser.insertId;

    // insert data siswa
    await connection.query(
      `
      INSERT INTO siswa (id_user, nis, nama_siswa, id_kelas) VALUES
      (?, ?, ?, ?)
      `,
      [idUser, nis, namaSiswa, idKelas],
    );

    // semua berhasil
    await connection.commit();
    return {
      success: true,
      message: "Data siswa berhasil ditambahkan",
    };
  } catch (error) {
    // kalau terjadi error
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export async function findAllStudents() {
  const [rows] = await pool.query(`
    SELECT
      s.id_siswa,
      s.id_user,
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
        s.id_user,
        s.nis,
        s.nama_siswa,
        s.id_kelas,
        u.username,
        k.nama_kelas,
        k.tingkat,
        s.status_aktif
      FROM siswa s
      JOIN kelas k ON s.id_kelas = k.id_kelas
      JOIN users u ON s.id_user = u.id_user
      WHERE s.id_siswa = ?
    `,
    [id],
  );

  return rows[0];
}

export const updateStudentById = async ({
  id_user,
  id_siswa,
  nis,
  namaSiswa,
  username,
  password,
  idKelas,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let updateUser;

    if (!password || password.trim() === "") {
      [updateUser] = await connection.query(
        `
        UPDATE users set username = ? WHERE id_user = ?
        `,
        [username, id_user],
      );
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      [updateUser] = await connection.query(
        `
        UPDATE users set username = ?, password = ? WHERE
        id_user = ?
        `,
        [username, passwordHash, id_user],
      );
    }

    if (updateUser.affectedRows === 0) {
      await connection.rollback();
      return {
        success: false,
        message: "gagal mengubah data",
      };
    }

    const [updateSiswa] = await connection.query(
      `
      UPDATE siswa set nis = ?, nama_siswa = ?, id_kelas = ? WHERE id_siswa = ?
      `,
      [nis, namaSiswa, idKelas, id_siswa],
    );

    await connection.commit();

    return {
      success: true,
      message: "Update berhasil",
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

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
