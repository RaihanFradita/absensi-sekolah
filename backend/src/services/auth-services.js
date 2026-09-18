import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signIn = async (data) => {
  const [user] = await pool.query("SELECT * FROM users WHERE username = ?", [
    data.username,
  ]);

  if (user.length === 0) {
    return {
      success: false,
      message: "username atau password salah",
    };
  }

  // const isPassword = await bcrypt.compare(data.password, user[0].password);
  const isPassword = data.password === user[0].password;

  if (!isPassword) {
    return {
      success: false,
      message: "username atau password salah",
    };
  }

  const payload = {
    id: user[0].id_user,
    username: user[0].username,
    role: user[0].role,
  };

  const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });

  return {
    success: true,
    message: "Login berhasil",
    user: payload,
    accessToken,
  };
};
