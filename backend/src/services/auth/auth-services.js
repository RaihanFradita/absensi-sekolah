import { pool } from "../../config/database.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

export const signIn = async (data) => {
  const identifier = data.username || data.identifier;

  if (!identifier || !data.password) {
    return {
      success: false,
      message: "Username dan password wajib diisi",
    };
  }

  const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [
    identifier,
  ]);

  if (users.length === 0) {
    return {
      success: false,
      message: "Username atau password salah",
    };
  }

  const currentUser = users[0];

  const isPassword = await bcrypt.compare(data.password, currentUser.password);

  if (!isPassword) {
    return {
      success: false,
      message: "Username atau password salah",
    };
  }

  if (currentUser.status_aktif !== 1) {
    return { success: false, message: "Akun sudah tidak aktif" };
  }

  const userId = currentUser.id_user;

  let payload = {
    id_user: userId,
    username: currentUser.username,
    role: currentUser.role,
    mustChangePassword: Boolean(currentUser.must_change_password),
  };

  if (currentUser.role === "guru") {
    const [guru] = await pool.query(
      `SELECT id_guru, nama_guru
       FROM guru
       WHERE id_user = ?`,
      [userId],
    );

    if (guru.length === 0) {
      return {
        success: false,
        message: "Data guru tidak ditemukan",
      };
    }

    payload = {
      ...payload,
      id_guru: guru[0].id_guru,
      name: guru[0].nama_guru,
    };
  }

  if (currentUser.role === "siswa") {
    const [siswa] = await pool.query(
      `SELECT id_siswa, nama_siswa
       FROM siswa
       WHERE id_user = ?`,
      [userId],
    );

    if (siswa.length === 0) {
      return {
        success: false,
        message: "Data siswa tidak ditemukan",
      };
    }

    payload = {
      ...payload,
      id_siswa: siswa[0].id_siswa,
      name: siswa[0].nama_siswa,
    };
  }

  if (currentUser.role === "admin") {
    payload.name = currentUser.username;
  }

  if (currentUser.role === "piket") {
    payload.name = currentUser.username;
  }

  const secretKey = process.env.SECRET_KEY;

  if (!secretKey) {
    throw new Error("SECRET_KEY belum dikonfigurasi");
  }

  const accessToken = jwt.sign(payload, secretKey, {
    expiresIn: "7d",
  });

  return {
    success: true,
    message: "Login berhasil",
    user: payload,
    accessToken,
  };
};

export const changePassword = async (reqUser, data) => {
  const { oldPassword, newPassword } = data;

  if (!oldPassword || !newPassword) {
    return { success: false, message: "Password lama dan baru wajib diisi" };
  }

  if (newPassword.length < 6) {
    return { success: false, message: "Password baru minimal 6 karakter" };
  }

  if (oldPassword === newPassword) {
    return {
      success: false,
      message: "Password baru tidak boleh sama dengan password lama",
    };
  }

  const [users] = await pool.query(
    `
    SELECT password FROM users WHERE id_user = ?
    `,
    [reqUser.id_user],
  );

  if (users.length === 0) {
    return {
      success: false,
      message: "User tidak ditemukan",
    };
  }

  const isMatch = await bcrypt.compare(oldPassword, users[0].password);

  if (!isMatch) {
    return {
      success: false,
      message: "Password lama salah",
    };
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `
    UPDATE users SET password = ?, must_change_password = 0 WHERE id_user = ?
    `,
    [hashPassword, reqUser.id_user],
  );

  const { iat, exp, ...basePayload } = reqUser;
  const payload = { ...basePayload, mustChangePassword: false };

  const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });

  return {
    success: true,
    message: "Password berhasil diganti",
    user: payload,
    accessToken,
  };
};
