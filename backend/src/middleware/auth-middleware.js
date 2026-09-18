import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token =
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null) || req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token autentikasi tidak ditemukan.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "default_secret_key"
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Sesi tidak valid atau telah berakhir. Silakan login kembali.",
    });
  }
};
