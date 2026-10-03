import { io } from "socket.io-client";
import { AUTH_TOKEN_KEY } from "../utils/constants";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socketInstance;
};

export const connectSocket = () => {
  const socket = getSocket();
  const token =
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
};
