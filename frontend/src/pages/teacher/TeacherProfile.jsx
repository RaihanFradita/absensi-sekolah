import { useEffect, useState } from "react";
import {
  UserCircle,
  BadgeCheck,
  User,
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";
import { teacherServices } from "../../services/teacher/teacherService";

function InfoItem({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p
        className={`text-base font-semibold ${accent ?? "text-slate-900 dark:text-slate-100"}`}
      >
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function TeacherProfile() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await teacherServices.getProfile();
      if (result?.success === false) {
        throw new Error(result.message || "Gagal memuat profil.");
      }
      setProfile(result?.data ?? null);
    } catch (err) {
      setError(err?.message || "Gagal memuat profil guru.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fallback dari token jika API belum selesai
  const displayName =
    profile?.nama_guru || user?.name || user?.fullName || "Guru";
  const displayUsername = profile?.username || user?.username || "-";
  const displayStatus = profile?.status_aktif;

  return (
    <PageContainer
      title="Profil Guru"
      description="Informasi akun dan data guru pada sistem absensi sekolah."
    >
      <div className="space-y-6">
        {/* ── Header Profil ── */}
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-md">
                <UserCircle className="h-12 w-12" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                {isLoading ? (
                  <div className="h-6 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {displayName}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Guru
                    </span>
                    {displayStatus === true && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Aktif
                      </span>
                    )}
                    {displayStatus === false && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Tidak Aktif
                      </span>
                    )}
                  </div>
                )}

                {isLoading ? (
                  <div className="mt-2 h-4 w-52 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                ) : (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    @{displayUsername} · Sistem Absensi Sekolah
                  </p>
                )}
              </div>
            </div>

            {/* Tombol Logout */}
            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              isLoading={isLoggingOut}
              disabled={isLoggingOut}
              className="self-start sm:self-auto"
            >
              Keluar
            </Button>
          </div>
        </Card>

        {/* ── Error State ── */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={loadProfile}
              className="ml-auto"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* ── Data Guru ── */}
        <Card>
          <CardHeader
            title="Informasi Guru"
            subtitle="Data identitas guru yang terdaftar di sistem."
          />

          {isLoading ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={User}
                label="Nama Lengkap"
                value={displayName}
              />
              <InfoItem
                icon={User}
                label="Username"
                value={displayUsername}
              />
              <InfoItem
                icon={ShieldCheck}
                label="Role"
                value="Guru"
              />
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}