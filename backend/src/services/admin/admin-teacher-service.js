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
          nama_guru,
          jenis_kelamin
        )
        VALUES (?, ?, ?)
      `,
      [idUser, data.nama_guru, data.jenis_kelamin],
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

export const findAllTeacher = async ({ page = 1, limit = 10, search } = {}) => {
  // sanitasi input suapaya aman dan tidak negatif
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (currentPage - 1) * perPage;

  // WHERE dinamis
  const conditions = ["g.status_aktif = 1"];
  const params = [];

  const keyword = typeof search === "string" ? search.trim() : "";

  if (keyword) {
    conditions.push("(g.nama_guru LIKE ? OR u.username LIKE ?)");
    const like = `%${keyword}%`;
    params.push(like, like);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // hitung total data
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM guru g
    INNER JOIN users u ON u.id_user = g.id_user
    ${whereClause}
    `,
    params,
  );

  // ambil data sesuai halaman
  const [teachers] = await pool.query(
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
    INNER JOIN users u ON u.id_user = g.id_user
    ${whereClause}
    ORDER BY g.nama_guru ASC, g.id_guru ASC
    LIMIT ? OFFSET ?
    `,
    [...params, perPage, offset],
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
        jenis_kelamin = ?
        WHERE id_guru = ?
      `,
      [data.nama_guru, data.jenis_kelamin, data.id_guru],
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
      `SELECT
      id_kelas,
      nama_kelas,
      tingkat
    FROM kelas
    WHERE status_aktif = 1
    ORDER BY tingkat ASC,
      FIELD(nama_kelas, 'MM1', 'MM2', 'A', 'B', 'C', 'D', 'E', 'F'),
      id_kelas ASC`,
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
      username: guru.username,
      role: guru.role,
      status_aktif: guru.status_aktif === 1,
    },
  };
};

export const adminResetTeacherPassword = async (id_guru, customPassword) => {
  const teacherResult = await findTeacherById(id_guru);
  if (!teacherResult.success || !teacherResult.data) {
    return {
      success: false,
      message: "Data guru tidak ditemukan",
    };
  }

  const teacher = teacherResult.data;

  const cleanName = (teacher.nama_guru || "guru")
    .replace(/^(drs\.|dra\.|dr\.|prof\.|h\.|hj\.|ust\.|ustadz\.)\s+/i, "")
    .trim();

  const firstName =
    cleanName.split(/\s+/)[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, "") ||
    "guru";

  const tempPassword =
    typeof customPassword === "string" && customPassword.trim().length >= 6
      ? customPassword.trim()
      : `smp4#${firstName}`;

  const hashPassword = await bcrypt.hash(tempPassword, 10);

  await pool.query(
    `
    UPDATE users 
    SET password = ?, must_change_password = 1 
    WHERE id_user = ?
    `,
    [hashPassword, teacher.id_user]
  );

  return {
    success: true,
    message: "Password guru berhasil direset",
    data: {
      id_guru: teacher.id_guru,
      nama_guru: teacher.nama_guru,
      username: teacher.username,
      tempPassword,
    },
  };
};

