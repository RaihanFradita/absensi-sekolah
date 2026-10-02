import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  //   autentikasi: client mengirim access token saat handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));

      const payload = jwt.verify(token, process.env.SECRET_KEY);
      socket.user = payload;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // hanya guru yang boleh memantau sesi
    socket.on("session:join", (sessionId, ack) => {
      if (socket.user.role !== "guru") {
        return ack?.({ ok: false, message: "Forbidden" });
      }

      socket.join(`session;${sessionId}`);
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
    return io;
  }
};
