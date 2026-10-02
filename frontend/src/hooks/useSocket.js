import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AUTH_TOKEN_KEY } from "../utils/constants";

export default function useSocket({ sessionId, enabled = true, onEvent }) {
  const [status, setStatus] = useState("connecting");
  const onEventRef = useRef(onEvent);

  // Simpan handler terbaru tanpa memicu koneksi ulang
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setStatus("disconnected");
      return undefined;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    const joinRoom = () => {
      socket.emit("session:join", sessionId, (res) => {
        if (res?.ok) {
          setStatus("connected");
        } else {
          console.warn("[socket] Gagal join sesi:", res?.message);
          setStatus("error");
        }
      });
    };

    socket.on("connect", () => {
      joinRoom();
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
      setStatus("connecting");
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connect_error:", err.message);
      setStatus("error");
    });

    socket.on("attendance_created", (payload) => {
      onEventRef.current?.(payload);
    });

    return () => {
      socket.emit("session:leave", sessionId);
      socket.disconnect();
    };
  }, [sessionId, enabled]);

  return { status };
}
