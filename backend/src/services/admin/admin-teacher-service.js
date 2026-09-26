import { pool } from "../../config/database.js";
import bcrypt from "bcrypt";

export const insertTeacher = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Cek apakah username sudah digunakan
    const [existingUser] = await connection.query(
      `
        SELECT id_user
        FROM users
        WHERE username = ?
        LIMIT 1
      `,
      [data.username],
    );

    if (existingUser.length > 0) {
      await connection.rollback();

      return {
        success: false,
        message: "Username sudah digunakan",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Tambahkan user
    const [insertUser] = await connection.query(
      `
        INSERT INTO users (
          username,
          password,
          role
        )
        VALUES (?, ?, ?)
      `,
      [data.username, passwordHash, "guru"],
    );

    if (insertUser.affectedRows === 0) {
      await connection.rollback();

      return {
        success: false,
        message: "Gagal menambahkan user",
      };
    }

    const idUser = insertUser.insertId;

    // Tambahkan data guru
    await connection.query(
      `
        INSERT INTO guru (
          id_user,
          nama_guru
        )
        VALUES (?, ?)
      `,
      [idUser, data.nama_guru],
    );

    // Simpan semua perubahan
    await connection.commit();

    return {
      success: true,
      message: "Data guru berhasil ditambahkan",
    };
  } catch (error) {
    await connection.rollback();

    console.error("insertTeacher:", error);

    throw error;
  } finally {
    connection.release();
  }
};

export const findAllTeacher = async () => {
  const [teachers] = await pool.query(`
    SELECT
      g.id_guru,
      g.id_user,
      g.nama_guru,
      g.status_aktif,
      u.username,
      u.role
    FROM guru g
    INNER JOIN users u
      ON u.id_user = g.id_user
    ORDER BY g.nama_guru ASC
  `);

  return {
    success: true,
    message: "Data guru berhasil diambil",
    data: teachers,
  };
};

export const findTeacherById = async (id_guru) => {
  const [[teacher]] = await pool.query(
    `
      SELECT
        g.id_guru,
        g.id_user,
        g.nama_guru,
        g.status_aktif,
        u.username,
        u.role
      FROM guru g
      INNER JOIN users u
        ON u.id_user = g.id_user
      WHERE g.id_guru = ?
      LIMIT 1
    `,
    [id_guru],
  );

  if (!teacher) {
    return {
      success: false,
      message: "Data guru tidak ditemukan",
    };
  }

  return {
    success: true,
    message: "Data guru berhasil diambil",
    data: teacher,
  };
};

export const updateTeacherById = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Update username
    const [updateUser] = await connection.query(
      `
        UPDATE users
        SET username = ?
        WHERE id_user = ?
      `,
      [data.username, data.id_user],
    );

    if (updateUser.affectedRows === 0) {
      await connection.rollback();

      return {
        success: false,
        message: "User guru tidak ditemukan",
      };
    }

    // Update nama guru
    const [updateGuru] = await connection.query(
      `
        UPDATE guru
        SET nama_guru = ?
        WHERE id_guru = ?
      `,
      [data.nama_guru, data.id_guru],
    );

    if (updateGuru.affectedRows === 0) {
      await connection.rollback();

      return {
        success: false,
        message: "Data guru tidak ditemukan",
      };
    }

    await connection.commit();

    return {
      success: true,
      message: "Data guru berhasil diperbarui",
    };
  } catch (error) {
    await connection.rollback();

    console.error("updateTeacherById:", error);

    throw error;
  } finally {
    connection.release();
  }
};

export const softDeleteTeacher = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Nonaktifkan user
    await connection.query(
      `
        UPDATE users
        SET status_aktif = ?
        WHERE id_user = ?
      `,
      [0, data.id_user],
    );

    // Nonaktifkan guru
    await connection.query(
      `
        UPDATE guru
        SET status_aktif = ?
        WHERE id_guru = ?
      `,
      [0, data.id_guru],
    );

    await connection.commit();

    return {
      success: true,
      message: "Data guru berhasil dinonaktifkan",
    };
  } catch (error) {
    await connection.rollback();

    console.error("softDeleteTeacher:", error);

    throw error;
  } finally {
    connection.release();
  }
};
