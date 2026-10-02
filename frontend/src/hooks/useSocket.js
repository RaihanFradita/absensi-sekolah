import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { io } from "socket.io-client";

export default function useSocket({ sessionId, enabled = true, onEvent }) {
  const [status, setStatus] = useState("connecting");
  const onEventRef = useRef(onEvent);

  //   simpan handler terbaru tanpa memicu koneksi ulang
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !sessionId) return undefined;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: localStorage.getItem("accessToken") },
      transports: ["websocket"],
    });

    const joinRoom = () => {
      socket.emit("session:join", sessionId, (res) => {
        setStatus(res?.ok ? "connected" : "error");
      });
    };

    // 'connect' juga terpicu saat reconnect, jadi join ulang otomatis
    socket.on("connect", joinRoom);
    socket.on("disconnect", () => setStatus("connecting"));
    socket.on("connect_error", () => setStatus("error"));
    socket.on("attendance_created", (payload) => onEventRef.current?.(payload));

    return () => {
      socket.emit("session:leave", sessionId);
      socket.disconnect();
    };
  }, [sessionId, enabled]);

  return { status };
}
