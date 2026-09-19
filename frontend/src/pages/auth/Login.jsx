import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  IdCard,
  Lock,
  AlertCircle,
  FlaskConical,
  GraduationCap,
  Users,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";
import { APP_FULL_NAME, ROLES } from "../../utils/constants";
import schoolLogo from "../../assets/logo-sekolah.png";

const ROLE_HOME = {
  [ROLES.STUDENT]: "/student/dashboard",
  [ROLES.TEACHER]: "/teacher/dashboard",
  [ROLES.DUTY_TEACHER]: "/duty/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
};

// Tombol mode pratinjau hanya muncul saat `npm run dev` (import.meta.env.DEV),
// tidak pernah ikut ke build production — jadi aman, tidak akan terlihat oleh
// siswa/guru sungguhan setelah di-deploy.
const MOCK_ROLE_OPTIONS = [
  { role: ROLES.STUDENT, label: "Siswa", icon: GraduationCap },
  { role: ROLES.TEACHER, label: "Guru Kelas", icon: Users },
  { role: ROLES.DUTY_TEACHER, label: "Guru Piket", icon: ClipboardCheck },
  { role: ROLES.ADMIN, label: "Admin", icon: ShieldCheck },
];

export default function Login() {
  const { login, loginAsMock, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [mockRoleLoading, setMockRoleLoading] = useState(null);

  const from = location.state?.from?.pathname;

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!identifier.trim() || !password) {
      setFormError("Username/NIS dan password wajib diisi.");
      return;
    }

    try {
      const user = await login({ identifier: identifier.trim(), password });
      // Redirect berdasarkan role dari backend, atau kembali ke halaman asal jika ada.
      navigate(from || ROLE_HOME[user?.role] || "/", { replace: true });
    } catch (error) {
      setFormError(error?.message || "Username/NIS atau password salah.");
    }
  }

  async function handleMockLogin(role) {
    setFormError("");
    setMockRoleLoading(role);
    try {
      const user = await loginAsMock(role);
      navigate(ROLE_HOME[user?.role] || "/", { replace: true });
    } finally {
      setMockRoleLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Toaster />
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={schoolLogo}
            alt={`Logo ${APP_FULL_NAME}`}
            className="mb-3 h-20 w-20 object-contain"
          />
          <h1 className="text-lg font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
            {APP_FULL_NAME}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sistem absensi siswa berbasis QR Code
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{formError}</span>
              </div>
            )}

            <Input
              label="Username atau NIS"
              icon={IdCard}
              placeholder="Masukkan username atau NIS"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isAuthenticating}
            />

            <Input
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAuthenticating}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <Button type="submit" fullWidth isLoading={isAuthenticating}>
              {isAuthenticating ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
              Mode Pratinjau (development saja)
            </div>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Lihat tampilan tiap role tanpa backend, pakai data contoh. Bagian
              ini tidak ikut ter-build ke production.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_ROLE_OPTIONS.map(({ role, label, icon: Icon }) => (
                <Button
                  key={role}
                  variant="secondary"
                  size="sm"
                  icon={Icon}
                  onClick={() => handleMockLogin(role)}
                  isLoading={mockRoleLoading === role}
                  disabled={isAuthenticating || Boolean(mockRoleLoading)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Lupa password atau tidak bisa masuk?{" "}
          <a
            href="mailto:admin@sekolah.sch.id"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Hubungi admin sekolah
          </a>
        </p>
      </div>
    </div>
  );
}
