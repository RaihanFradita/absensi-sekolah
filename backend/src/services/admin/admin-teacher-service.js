import { pool } from "../../config/database.js";
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

export const findTeacherById = async (id_guru) => {
  const [[teacher]] = await pool.query(
    `
      SELECT 
        g.id_guru, g.nip, g.nama_guru, g.status_aktif,
        u.username, u.role
        FROM guru g JOIN 
        users u ON u.id_user = g.id_user
        WHERE g.id_guru = ?;
    `,
    [id_guru],
  );

  return {
    success: true,
    message: "data berhasil diambil",
    data: teacher,
  };
};

export const updateTeacherById = async (data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [updateUser] = await connection.query(
      `
            UPDATE users SET username = ?
            WHERE id_user = ?
        `,
      [data.username, data.id_user],
    );

    if (updateUser.affectedRows === 0) {
      return {
        success: false,
        message: "gagal mengubah data",
      };
    }

    await connection.query(
      `
      UPDATE guru SET nip = ?, nama_guru = ?
      WHERE id_guru = ?
      `,
      [data.nip, data.nama_guru, data.id_guru],
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

export const softDeleteTeacher = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query(
      `UPDATE users SET status_aktif = ? WHERE id_user = ?`,
      [0, data.id_user],
    );
    await connection.query(
      `UPDATE guru SET status_aktif = ? WHERE id_guru = ?`,
      [0, data.id_guru],
    );

    await connection.commit();

    return {
      success: true,
      message: "update berhasil",
    };
  } catch (error) {
    await connection.rollback();
  } finally {
    connection.release();
  }
};
