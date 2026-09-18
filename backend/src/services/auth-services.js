import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

export const signIn = async (data) => {
  const [user] = pool.query("SELECT * FROM users WHERE username = ?", [
    data.username,
  ]);

  if (user.length === 0) {
    return {
      success: false,
      message: "username atau password salah",
    };
  }

  const isPassword = await bcrypt.compare(data.password, user[0].password);

  if (!isPassword) {
    return {
      success: false,
      message: "username atau password salah",
    };
  }

  return {
    success: true,
    message: "Login berhasil",
  };
};
