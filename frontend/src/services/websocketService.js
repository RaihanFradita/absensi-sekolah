import { AUTH_TOKEN_KEY } from '../utils/constants';

// Base URL WebSocket diambil dari environment variable.
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Wrapper kecil di atas native WebSocket dengan auto-reconnect.
 * Dipakai lewat hook useWebSocket, bukan langsung di komponen.
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.manuallyClosed = false;
    this.path = '';
  }

  connect(path) {
    this.path = path;
    this.manuallyClosed = false;
    this._open();
  }

  _open() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const url = `${WS_BASE_URL}${this.path}${token ? `?token=${token}` : ''}`;

    this._setStatus('connecting');

    try {
      this.socket = new WebSocket(url);
    } catch {
      this._setStatus('error');
      this._scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this._setStatus('connected');
    };

    this.socket.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.socket.onclose = () => {
      this._setStatus('disconnected');
      if (!this.manuallyClosed) {
        this._scheduleReconnect();
      }
    };

    this.socket.onerror = () => {
      this._setStatus('error');
    };
  }

  handleMessage(event) {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return; // Abaikan pesan yang bukan JSON valid.
    }
    this.listeners.forEach((listener) => listener(payload));
  }

  onMessage(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatusChange(listener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  _setStatus(status) {
    this.statusListeners.forEach((listener) => listener(status));
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this._setStatus('failed');
      return;
    }
    this.reconnectAttempts += 1;
    this._setStatus('reconnecting');
    this.reconnectTimer = setTimeout(() => this._open(), RECONNECT_DELAY_MS);
  }

  reconnect() {
    this.reconnectAttempts = 0;
    this._open();
  }

  disconnect() {
    this.manuallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) this.socket.close();
    this.socket = null;
  }
}

// Setiap pemanggil membuat instance baru agar tiap halaman (mis. monitor sesi berbeda)
// punya koneksi & listener terisolasi.
export default function createWebSocketService() {
  return new WebSocketService();
}
