import api from './api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';
import { MOCK_USERS, isMockMode, setMockMode, mockDelay } from './mockData';

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
  const { data } = await api.post(ENDPOINTS.LOGIN, { identifier, password });

  // Bentuk respons yang diharapkan dari backend:
  // { token: string, user: { id, name, role, ... } }
  const { token, user } = data;

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  return { token, user };
}

/**
 * MODE PRATINJAU — tidak memanggil backend sama sekali.
 * Hanya dipicu lewat tombol eksplisit "Coba tanpa backend" di halaman Login
 * (lihat src/pages/auth/Login.jsx), tidak pernah otomatis. Berguna untuk
 * melihat tampilan semua halaman sebelum backend sungguhan tersedia.
 */
async function loginMock(role) {
  await mockDelay(400);
  const user = MOCK_USERS[role];
  if (!user) throw new Error('Role pratinjau tidak dikenali.');

  setMockMode(true);
  localStorage.setItem(AUTH_TOKEN_KEY, `mock-token-${role}`);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  return { token: `mock-token-${role}`, user };
}

async function logout() {
  try {
    if (!isMockMode()) {
      await api.post(ENDPOINTS.LOGOUT);
    }
  } finally {
    // Selalu bersihkan sesi lokal walau request logout ke backend gagal.
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setMockMode(false);
  }
}

async function getCurrentUser() {
  if (isMockMode()) {
    return getStoredUser();
  }
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
  setMockMode(false);
}

const authService = {
  login,
  loginMock,
  logout,
  getCurrentUser,
  getStoredUser,
  getToken,
  clearSession,
};

export default authService;
