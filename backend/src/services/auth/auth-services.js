import { pool } from "../../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signIn = async (data) => {
  const identifier = data.username || data.identifier;

  if (!identifier || !data.password) {
    return {
      success: false,
      message: "Username/NIS dan password wajib diisi",
    };
  }

  const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [
    identifier,
  ]);

  if (users.length === 0) {
    return {
      success: false,
      message: "Username/NIS atau password salah",
    };
  }

  const currentUser = users[0];

  const isPassword = await bcrypt.compare(data.password, currentUser.password);

  if (!isPassword) {
    return {
      success: false,
      message: "Username/NIS atau password salah",
    };
  }

  const userId = currentUser.id_user;

  let payload = {
    id_user: userId,
    username: currentUser.username,
    role: currentUser.role,
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
