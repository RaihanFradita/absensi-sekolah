import "dotenv/config";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  //   autentikasi: client mengirim access token saat handshake
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      if (typeof token === "string" && token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      const payload = jwt.verify(token, process.env.SECRET_KEY);
      socket.user = payload;
      next();
    } catch (error) {
      console.error("[socket auth error]:", error.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // hanya guru yang boleh memantau sesi
    socket.on("session:join", (sessionId, ack) => {
      if (socket.user.role !== "guru") {
        return ack?.({ ok: false, message: "Forbidden" });
      }

      if (sessionId) {
        socket.join(`session:${sessionId}`);
      }
      ack?.({ ok: true });
    });

    socket.on("session:leave", (sessionId) => {
      socket.leave(`session:${sessionId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io belum diinisialisasi");
  }
  return io;
};
