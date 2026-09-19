import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

export const insertTeacher = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ambil data user
    const [user] = await connection.query(
      "SELECT * FROM users WHERE username = ?",
      [data.username],
    );

    //   jika user ada
    if (user.length > 0) {
      return {
        success: false,
        message: "Username sudah digunakan",
      };
    }

    //   hash pasword
    const passwordHash = await bcrypt.hash(data.password, 10);

    //   tambahkan data user
    const [insertUser] = await connection.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [data.username, passwordHash, "guru"],
    );

    //   jika gagal menambahkan data
    if (insertUser.affectedRows === 0) {
      return {
        success: false,
        message: "gagal menambahkan data",
      };
    }

    //   ambil id yang baru dibuat
    const idUser = insertUser.insertId;

    //   insert data guru
    await connection.query(
      `
    INSERT INTO guru (id_user, nip, nama_guru) VALUES (?, ?, ?)
    `,
      [idUser, data.nip, data.nama_guru],
    );

    // semua berhasil
    await connection.commit();

    return {
      success: true,
      message: "Data guru berhasil ditambahkan",
    };
  } catch (error) {
    // kalau terjadi error, batalkan semua
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

export const findAllTeacher = async () => {
  const [teachers] = await pool.query(`
        SELECT 
        g.id_guru, g.nip, g.nama_guru, g.status_aktif,
        u.username, u.role
        FROM guru g JOIN 
        users u ON u.id_user = g.id_user;
        `);

  return {
    success: true,
    message: "data berhasil diambil",
    data: teachers,
  };
};
