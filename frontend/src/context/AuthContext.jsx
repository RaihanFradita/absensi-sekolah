import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import authService from "../services/authService";
import { registerUnauthorizedHandler } from "../services/api";

export const AuthContext = createContext(null);

// Sesi tersimpan (token + user) dicek secara sinkron dari localStorage saat
// context pertama kali dibuat, jadi tidak perlu state "isInitializing" +
// efek terpisah untuk kasus ini. Kalau nanti perlu validasi token ke backend
// saat reload, lakukan itu di sini dan set state async, bukan lewat effect.
function getInitialUser() {
  const storedUser = authService.getStoredUser();
  const token = authService.getToken();
  return storedUser && token ? storedUser : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Ketika API merespons 401 (sesi habis / token tidak valid), paksa logout.
    registerUnauthorizedHandler(() => {
      authService.clearSession();
      setUser(null);
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user: loggedInUser } = await authService.login({
        identifier,
        password,
      });
      // Role SELALU berasal dari respons backend, bukan dari form login.
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      const message = error?.message || "Username/NIS atau password salah.";
      setAuthError(message);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Mode pratinjau: login tanpa backend, hanya dipicu eksplisit dari tombol
  // "Coba tanpa backend" di halaman Login. Lihat services/mockData.js.
  const loginAsMock = useCallback(async (role) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user: loggedInUser } = await authService.loginMock(role);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      // Dipertahankan untuk kompatibilitas ProtectedRoute; false karena
      // pengecekan sesi awal di atas sudah sinkron (localStorage).
      isInitializing: false,
      isAuthenticating,
      authError,
      login,
      loginAsMock,
      logout,
    }),
    [user, isAuthenticating, authError, login, loginAsMock, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
