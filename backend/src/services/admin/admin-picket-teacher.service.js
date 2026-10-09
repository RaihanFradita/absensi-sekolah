import { pool } from "../../config/database.js";
import bcrypt from "bcrypt";

export const insertPicketTeacher = async ({ username, password }) => {
  // cek apakah username suda digunakan
  const [existingUser] = await pool.query(
    `
        SELECT * FROM users WHERE username = ?
        `,
    [username],
  );

  if (existingUser.length > 0) {
    return {
      success: false,
      message: "Username atau passsword sudah digunakan!",
    };
  }

  //   hash password
  const passwordHash = await bcrypt.hash(password, 10);

  //   tambahkan user
  const [insertUser] = await pool.query(
    `
    INSERT INTO users (username, password, role) VALUES
    (?, ?, ?)
    `,
    [username, passwordHash, "guru_piket"],
  );

  if (insertUser.affectedRows === 0) {
    return {
      success: false,
      message: "Gagal menambahkan user",
    };
  }

  return {
    success: true,
    message: "Akun guru piket berhasil dibuat",
  };
};

export const findAllPicketTeacher = async ({ page = 1, limit = 10 } = {}) => {
  // sanitasi input supaya aman dan tidak negatif
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (currentPage - 1) * perPage;

  //   hitung total dataa
  const [[{ total }]] = await pool.query(`
    SELECT COUNT(*) as total FROM users WHERE role = 'guru_piket';
    `);

  // ambil data sesuai halaman
  const [picketTeacher] = await pool.query(
    `
        SELECT * FROM users WHERE role = 'guru_piket' AND status_aktif = 1
        ORDER BY username ASC LIMIT ? OFFSET ?
        `,
    [perPage, offset],
  );

  const totalPage = Math.ceil(total / perPage);

  return {
    success: true,
    message: "Data guru piket berhasil diambil",
    data: picketTeacher,
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

export const findPicketTeacherById = async (id_user) => {
  const [[picketTeacher]] = await pool.query(
    `
        SELECT * FROM users WHERE id_user = ? AND role = ? LIMIT 1
        `,
    [id_user, "guru_piket"],
  );

  if (!picketTeacher) {
    return {
      success: false,
      message: "Data guru tidak ditemukan",
    };
  }

  return {
    success: true,
    message: "Data guru berhasil diambil",
    data: picketTeacher,
  };
};

export const updatePicketTeacherById = async ({
  id_user,
  username,
  password,
}) => {
  // cari username by id
  const [existingUser] = await pool.query(
    `SELECT id_user, username FROM users WHERE username = ?`,
    [username],
  );

  if (existingUser.length === 0) {
    return {
      success: false,
      message: "Username sudah digunakan",
    };
  }

  if (password.trim() || password !== null) {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
        UPDATE users SET username = ?, password = ? WHERE id_user = ?`,
      [username, passwordHash, id_user],
    );
  } else {
    await pool.query(
      `
        UPDATE users SET username = ? WHERE id_user = ?
        `,
      [username, id_user],
    );
  }

  return {
    success: true,
    message: "Data guru berhasil diperbarui",
  };
};

export const softDeletePicketTeacher = async (id_user) => {
  const [deactivate] = await pool.query(
    `
        UPDATE users SET status_aktif = ? WHERE id_user = ?
        `,
    [0, id_user],
  );

  if (deactivate.affectedRows === 0) {
    return {
      success: false,
      message: "gagal menonaktifkan guru piket",
    };
  }

  return {
    success: true,
    message: "guru piket berhasil dinonaktifkan",
  };
};
