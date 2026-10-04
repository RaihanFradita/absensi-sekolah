import { useCallback, useState } from "react";
import {
  UserCircle,
  BadgeCheck,
  User,
  School,
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";

import useAttendance from "../../hooks/useAttendance";
import useAuth from "../../hooks/useAuth";
import attendanceService from "../../services/attendanceService";

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>

      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {value || "-"}
      </p>
    </div>
  );
}

export default function StudentProfile() {
  const { user, logout } = useAuth();

  const fetchProfile = useCallback(
    () => attendanceService.getStudentProfile(),
    [],
  );

  const { data, isLoading, error, refetch } = useAttendance(fetchProfile);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const student = data?.student || data || null;

  const studentName =
    student?.nama_siswa || student?.name || user?.name || "Siswa";

  const username = student?.username || user?.username || "-";

  const className = `${student?.tingkat}${student?.nama_kelas}` || "-";

  const isActive =
    student?.status_aktif === undefined || student?.status_aktif === null
      ? true
      : Number(student.status_aktif) === 1;

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <PageContainer
      title="Profil Siswa"
      description="Informasi akun dan data siswa pada sistem absensi sekolah."
    >
      <div className="space-y-6">
        {/* =========================
            HEADER PROFIL
        ========================== */}
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* ICON PROFIL, TANPA FOTO */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <UserCircle className="h-11 w-11" />
              </div>

              <div className="min-w-0">
                {isLoading ? (
                  <>
                    <div className="h-6 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />

                    <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {studentName}
                      </h2>

                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Siswa
                      </span>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Tidak Aktif
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      @{username} · Sistem Absensi Sekolah
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* LOGOUT */}
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

        {/* =========================
            ERROR
        ========================== */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />

              <span>Gagal mengambil profil siswa.</span>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={refetch}
              className="sm:ml-auto"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* =========================
            INFORMASI SISWA
        ========================== */}
        {!isLoading && !error && student && (
          <Card>
            <CardHeader
              title="Informasi Siswa"
              subtitle="Data identitas siswa yang terdaftar di sistem."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={User} label="Nama Lengkap" value={studentName} />

              <InfoItem icon={School} label="Kelas" value={className} />

              <InfoItem icon={User} label="Username" value={username} />

              <InfoItem icon={ShieldCheck} label="Role" value="Siswa" />
            </div>
          </Card>
        )}

        {/* =========================
            LOADING
        ========================== */}
        {isLoading && <Loading label="Memuat profil siswa..." />}

        {/* =========================
            DATA KOSONG
        ========================== */}
        {!isLoading && !error && !student && (
          <EmptyState
            title="Profil siswa tidak ditemukan"
            description="Data profil siswa belum tersedia."
            action={
              <Button variant="secondary" icon={RefreshCw} onClick={refetch}>
                Coba Lagi
              </Button>
            }
          />
        )}
      </div>
    </PageContainer>
  );
}
