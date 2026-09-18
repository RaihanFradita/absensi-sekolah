import { signIn } from "../services/auth-services.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi!",
    });
  }

  try {
    const result = await signIn({ username, password });

    if (!result.success) {
      return res.status(400).json({
        success: result.success,
        message: result.message,
      });
    }

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      success: result.success,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
