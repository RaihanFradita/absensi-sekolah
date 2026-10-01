import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  console.log("===== VERIFY TOKEN =====");
  console.log("PATH:", req.originalUrl);
  console.log("AUTH HEADER:", authHeader ? "ADA" : "TIDAK ADA");
  console.log(
    "COOKIE TOKEN:",
    req.cookies?.accessToken ? "ADA" : "TIDAK ADA",
  );

  const token =
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null) || req.cookies?.accessToken;

  console.log("TOKEN:", token ? "ADA" : "TIDAK ADA");

  if (!token) {
    console.log("❌ TOKEN TIDAK DITEMUKAN");

    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token autentikasi tidak ditemukan.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "default_secret_key",
    );

    console.log("✅ TOKEN VALID");
    console.log("USER:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ TOKEN TIDAK VALID");
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      success: false,
      message: "Sesi tidak valid atau telah berakhir. Silakan login kembali.",
    });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(400).json({
        success: false,
        message: "Akses ditolak untuk role ini!",
      });
    }

    next();
  };
};