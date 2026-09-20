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

  const [user] = await pool.query("SELECT * FROM users WHERE username = ?", [
    identifier,
  ]);

  if (!user || user.length === 0) {
    return {
      success: false,
      message: "Username/NIS atau password salah",
    };
  }

  const currentUser = user[0];
  let isPassword = false;

  if (currentUser.password) {
    if (
      currentUser.password.startsWith("$2a$") ||
      currentUser.password.startsWith("$2b$")
    ) {
      isPassword = await bcrypt.compare(data.password, currentUser.password);
    } else {
      isPassword = data.password === currentUser.password;
    }
  }

  if (!isPassword) {
    return {
      success: false,
      message: "Username/NIS atau password salah",
    };
  }

  const payload = {
    id: currentUser.id_user || currentUser.id,
    username: currentUser.username,
    name: currentUser.nama || currentUser.name || currentUser.username,
    role: currentUser.role,
  };

  const secretKey = process.env.SECRET_KEY || "default_secret_key";
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
