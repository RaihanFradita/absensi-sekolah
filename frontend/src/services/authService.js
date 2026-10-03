import api from './api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';

// Endpoint placeholder — sesuaikan dengan kontrak backend yang sebenarnya.
const ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

/**
 * Login dengan username/NIS dan password.
 * PENTING: role user TIDAK diambil dari input form, melainkan dari
 * respons backend agar tidak bisa dimanipulasi dari sisi client.
 */
async function login({ identifier, password }) {
  const { data } = await api.post(ENDPOINTS.LOGIN, {
    username: identifier,
    identifier,
    password,
  });

  // Bentuk respons dari backend:
  // { success: true, message: string, token: string, user: { id, username, name, role } }
  const token =
    data.token ||
    data.accessToken ||
    data.data?.token ||
    data.data?.accessToken;
  const user = data.user || data.data?.user;

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  return { token, user };
}

async function logout() {
  try {
    await api.post(ENDPOINTS.LOGOUT);
  } finally {
    // Selalu bersihkan sesi lokal walau request logout ke backend gagal.
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

async function getCurrentUser() {
  const { data } = await api.get(ENDPOINTS.ME);
  return data.user ?? data;
}

function getStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

const authService = {
  login,
  logout,
  getCurrentUser,
  getStoredUser,
  getToken,
  clearSession,
};

export default authService;
