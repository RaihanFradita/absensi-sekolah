import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../utils/constants';

// Base URL diambil dari environment variable, lihat .env.example
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor request: sisipkan token autentikasi jika tersedia.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Callback opsional yang bisa didaftarkan AuthContext untuk menangani logout paksa
// ketika sesi berakhir (401), tanpa membuat api.js bergantung langsung pada React.
let onUnauthorized = null;
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Interceptor response: tangani 401 (sesi habis) dan sembunyikan detail error backend.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      if (onUnauthorized) onUnauthorized();
    }

    // Jangan tampilkan detail error internal backend (stack trace, query, dsb) ke user.
    const safeMessage =
      status && status < 500
        ? error?.response?.data?.message || 'Permintaan tidak dapat diproses.'
        : 'Terjadi kesalahan pada server. Silakan coba lagi.';

    return Promise.reject({
      status,
      message: safeMessage,
      raw: import.meta.env.DEV ? error : undefined,
    });
  }
);

export default api;
