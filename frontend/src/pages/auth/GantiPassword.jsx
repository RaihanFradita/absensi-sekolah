import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";
import { APP_FULL_NAME, ROLES, ROLE_LABEL } from "../../utils/constants";
import schoolLogo from "../../assets/logo-sekolah.png";

const ROLE_HOME = {
  [ROLES.STUDENT]: "/student/dashboard",
  [ROLES.TEACHER]: "/teacher/dashboard",
  [ROLES.DUTY_TEACHER]: "/duty/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
  siswa: "/student/dashboard",
  guru: "/teacher/dashboard",
  guru_piket: "/duty/dashboard",
  admin: "/admin/dashboard",
};

export default function GantiPassword() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname;
  const isMandatory = Boolean(user?.mustChangePassword);

  // Validasi Frontend
  const validateForm = () => {
    const newErrors = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = "Password lama wajib diisi.";
    }

    if (!newPassword) {
      newErrors.newPassword = "Password baru wajib diisi.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password baru minimal 6 karakter.";
    } else if (oldPassword && newPassword === oldPassword) {
      newErrors.newPassword = "Password baru tidak boleh sama dengan password lama.";
    }

    // Pengecekan konfirmasi password hanya di bagian frontend
    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (confirmPassword.length < 6) {
      newErrors.confirmPassword = "Konfirmasi password minimal 6 karakter.";
    } else if (newPassword && confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok dengan password baru.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend hanya menerima oldPassword dan newPassword
      // konfirmasi password hanya dicek di frontend
      await changePassword({
        oldPassword,
        newPassword,
      });

      toast.success("Password berhasil diubah!");

      // Arahkan ke dashboard sesuai role
      setTimeout(() => {
        const destination = from || ROLE_HOME[user?.role] || "/";
        navigate(destination, { replace: true });
      }, 800);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengganti password. Periksa kembali password lama Anda.";
      setGeneralError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  };

  // Helper indikator validasi real-time
  const isLengthValid = newPassword.length >= 6;
  const isMatchValid =
    Boolean(confirmPassword) && newPassword === confirmPassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Toaster position="top-right" />
      <div className="w-full max-w-md animate-fade-in">
        {/* Header Branding */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src={schoolLogo}
            alt={`Logo ${APP_FULL_NAME}`}
            className="mb-3 h-16 w-16 object-contain"
          />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isMandatory ? "Wajib Ganti Password" : "Ganti Password"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isMandatory
              ? "Untuk alasan keamanan akun baru, Anda wajib memperbarui password sebelum melanjutkan."
              : "Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data."}
          </p>

          {/* User badge */}
          {user && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{user.name || user.username}</span>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {ROLE_LABEL[user.role] || user.role}
              </span>
            </div>
          )}
        </div>

        {/* Card Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* General Error Alert */}
            {generalError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
                <span>{generalError}</span>
              </div>
            )}

            {/* Input 1: Password Lama */}
            <Input
              label="Password Lama"
              icon={Lock}
              type={showOldPassword ? "text" : "password"}
              placeholder="Masukkan password saat ini"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (errors.oldPassword) {
                  setErrors((prev) => ({ ...prev, oldPassword: "" }));
                }
              }}
              error={errors.oldPassword}
              disabled={isSubmitting}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowOldPassword((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 focus:outline-none dark:hover:text-slate-200"
                  aria-label={
                    showOldPassword
                      ? "Sembunyikan password lama"
                      : "Tampilkan password lama"
                  }
                  tabIndex={-1}
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            {/* Input 2: Password Baru */}
            <Input
              label="Password Baru"
              icon={KeyRound}
              type={showNewPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                }
              }}
              error={errors.newPassword}
              disabled={isSubmitting}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 focus:outline-none dark:hover:text-slate-200"
                  aria-label={
                    showNewPassword
                      ? "Sembunyikan password baru"
                      : "Tampilkan password baru"
                  }
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            {/* Input 3: Konfirmasi Password Baru */}
            <Input
              label="Konfirmasi Password Baru"
              icon={ShieldCheck}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi password baru"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
              error={errors.confirmPassword}
              disabled={isSubmitting}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 focus:outline-none dark:hover:text-slate-200"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            {/* Live Requirements Indicator */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ketentuan Password:
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    isLengthValid
                      ? "text-emerald-500"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
                <span
                  className={
                    isLengthValid
                      ? "text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-slate-500 dark:text-slate-400"
                  }
                >
                  Minimal 6 karakter
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    isMatchValid
                      ? "text-emerald-500"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
                <span
                  className={
                    isMatchValid
                      ? "text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-slate-500 dark:text-slate-400"
                  }
                >
                  Konfirmasi password cocok
                </span>
              </div>
            </div>

            {/* Tombol Simpan */}
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              className="mt-2"
            >
              {isSubmitting ? "Menyimpan Password..." : "Simpan Password Baru"}
            </Button>
          </form>

          {/* Action Footer */}
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            {isMandatory ? (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Ingin ganti akun?</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() =>
                    navigate(from || ROLE_HOME[user?.role] || "/")
                  }
                  className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
