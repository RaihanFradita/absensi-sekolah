import { signIn } from "../services/auth-services.js";

export const login = async (req, res) => {
  const { username, identifier, password } = req.body;
  const userIdentifier = username || identifier;

  if (!userIdentifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Username/NIS dan password wajib diisi!",
    });
  }

  try {
    const result = await signIn({ username: userIdentifier, password });

    if (!result.success) {
      return res.status(400).json({
        success: result.success,
        message: result.message,
      });
    }

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json({
      success: result.success,
      message: result.message,
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memproses logout",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
    });
  }
};

