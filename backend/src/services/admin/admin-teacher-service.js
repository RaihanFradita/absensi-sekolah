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
          nip,
          nama_guru,
          jenis_kelamin
        )
        VALUES (?, ?, ?, ?)
      `,
      [idUser, data.nip, data.nama_guru, data.jenis_kelamin],
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

export const findAllTeacher = async ({ page = 1, limit = 10 } = {}) => {
  // sanitasi input suapaya aman dan tidak negatif
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (currentPage - 1) * perPage;

  // hitung total data
  const [[{ total }]] = await pool.query(`
    SELECT COUNT(*) AS total FROM guru g INNER JOIN users u
    ON u.id_user = g.id_user;
    `);

  // ambil data sesuai halaman
  const [teachers] = await pool.query(
    `
    SELECT
      g.id_guru,
      g.id_user,
      g.nip,
      g.nama_guru,
      g.jenis_kelamin,
      g.status_aktif,
      u.username,
      u.role
    FROM guru g
    INNER JOIN users u
      ON u.id_user = g.id_user
    ORDER BY g.nama_guru ASC, g.id_guru ASC
    LIMIT ? OFFSET ?
  `,
    [perPage, offset],
  );

  const totalPage = Math.ceil(total / perPage);

  return {
    success: true,
    message: "Data guru berhasil diambil",
    data: teachers,
    pagination: {
      page: currentPage,
      limit: perPage,
      totalItems: total,
      totalPage,
      hasNextPage: currentPage < totalPage,
      hasPrevPage: currentPage > 1,
    },
  };
};

export const findTeacherById = async (id_guru) => {
  const [[teacher]] = await pool.query(
    `
      SELECT
        g.id_guru,
        g.id_user,
        g.nama_guru,
        g.jenis_kelamin,
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
        SET nama_guru = ?,
        jenis_kelamin = ?,
        nip = ?
        WHERE id_guru = ?
      `,
      [data.nama_guru, data.jenis_kelamin, data.nip, data.id_guru],
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

// ambil data kelas untuk keperluan input
export const findAllClass = async () => {
  try {
    const [kelas] = await pool.query(
      "SELECT * FROM kelas WHERE status_aktif = ?",
      [1],
    );

    return {
      success: true,
      message: "data berhasil diambil",
      data: kelas,
    };
  } catch (error) {
    return {
      success: false,
      message: "Terjadi kesalahan server",
    };
  }
};

/**
 * Ambil profil lengkap guru berdasarkan id_user dari token.
 * Termasuk: data guru, akun user, dan kelas yang menjadi wali kelas (jika ada).
 */
export const findTeacherProfile = async (idUser) => {
  const [[guru]] = await pool.query(
    `
    SELECT
      g.id_guru,
      g.nip,
      g.nama_guru,
      g.jenis_kelamin,
      g.status_aktif,
      u.username,
      u.role
    FROM guru g
    INNER JOIN users u ON u.id_user = g.id_user
    WHERE g.id_user = ?
    LIMIT 1
    `,
    [idUser],
  );

  if (!guru) {
    return {
      success: false,
      message: "Data guru tidak ditemukan",
    };
  }

  return {
    success: true,
    message: "Profil guru berhasil diambil",
    data: {
      id_guru: guru.id_guru,
      nama_guru: guru.nama_guru,
      jenis_kelamin: guru.jenis_kelamin,
      nip: guru.nip || null,
      username: guru.username,
      role: guru.role,
      status_aktif: guru.status_aktif === 1,
    },
  };
};
