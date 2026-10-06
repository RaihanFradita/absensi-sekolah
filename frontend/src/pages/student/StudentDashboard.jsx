import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  QrCode,
  School,
  UserCircle,
  AlertCircle,
  RefreshCw,
  CircleX,
} from "lucide-react";

import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import attendanceService from "../../services/attendanceService";
import useAuth from "../../hooks/useAuth";

function getStatusLabel(status) {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "hadir" || value === "present") {
    return "Hadir";
  }

  if (value === "terlambat" || value === "late") {
    return "Terlambat";
  }

  if (value === "izin" || value === "excused") {
    return "Izin";
  }

  if (value === "sakit" || value === "sick") {
    return "Sakit";
  }

  if (
    value === "tidak_hadir" ||
    value === "tidak hadir" ||
    value === "absent" ||
    value === "tanpa keterangan" ||
    value === "alpa" ||
    value === "alpha"
  ) {
    return "Tidak Hadir";
  }

  return "Belum Absen";
}

function getStatusStyle(status) {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "hadir" || value === "present") {
    return {
      wrapper:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      icon: CheckCircle2,
    };
  }

  if (value === "terlambat" || value === "late") {
    return {
      wrapper:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      icon: Clock3,
    };
  }

  if (value === "izin" || value === "excused") {
    return {
      wrapper:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
      icon: CalendarDays,
    };
  }

  if (value === "sakit" || value === "sick") {
    return {
      wrapper:
        "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
      icon: AlertCircle,
    };
  }

  return {
    wrapper:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    icon: CircleX,
  };
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateValue) {
  if (!dateValue) return "-";

  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed.slice(0, 5).replace(":", ".");
    }
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", ".");
}

function StatCard({ icon: Icon, label, value, description, iconClassName }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await attendanceService.getStudentDashboard();

      const result = response?.data ?? response;

      setDashboard(result);
    } catch (err) {
      console.error("Gagal memuat dashboard siswa:", err);

      setError(err?.message || "Gagal mengambil data dashboard siswa.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
   * =========================
   * DATA SISWA
   * =========================
   */
  const student =
    dashboard?.student ||
    dashboard?.siswa ||
    dashboard?.data?.student ||
    dashboard?.data?.siswa ||
    {};

  const studentName =
    student?.nama_siswa ||
    student?.name ||
    student?.nama ||
    user?.name ||
    "Siswa";

  const className = `${student?.tingkat}${student?.className}` || "-";

  /*
   * =========================
   * STATUS HARI INI
   * =========================
   */
  const todayAttendance =
    dashboard?.today ||
    dashboard?.todayAttendance ||
    dashboard?.attendanceToday ||
    dashboard?.kehadiran_hari_ini ||
    dashboard?.data?.today ||
    null;

  const todayStatus =
    todayAttendance?.status ||
    todayAttendance?.status_kehadiran ||
    dashboard?.today_status ||
    dashboard?.status_hari_ini ||
    null;

  const todayTime =
    todayAttendance?.waktu_scan ||
    todayAttendance?.waktu_absen ||
    todayAttendance?.scannedAt ||
    todayAttendance?.time ||
    null;

  const statusLabel = getStatusLabel(todayStatus);
  const statusStyle = getStatusStyle(todayStatus);
  const StatusIcon = statusStyle.icon;

  /*
   * =========================
   * SUMMARY
   * =========================
   */
  const summary =
    dashboard?.summary ||
    dashboard?.ringkasan ||
    dashboard?.data?.summary ||
    {};

  const hadir = summary?.hadir ?? summary?.present ?? 0;

  const terlambat = summary?.terlambat ?? summary?.late ?? 0;

  const tidakHadir =
    summary?.tidak_hadir ?? summary?.tidakHadir ?? summary?.absent ?? 0;

  /*
   * =========================
   * RIWAYAT
   * =========================
   */
  const history =
    dashboard?.recentAttendance ||
    dashboard?.recent_attendance ||
    dashboard?.recentHistory ||
    dashboard?.recent_history ||
    dashboard?.history ||
    dashboard?.attendance_history ||
    dashboard?.riwayat ||
    dashboard?.data?.recentAttendance ||
    dashboard?.data?.recentHistory ||
    [];

  const recentHistory = Array.isArray(history) ? history.slice(0, 5) : [];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* =====================================
            HEADER
        ====================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
              Sistem Absensi Sekolah
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Halo, {studentName}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pantau kehadiran sekolahmu hari ini.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CalendarDays className="h-4 w-4" />

            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* =====================================
            ERROR
        ====================================== */}
        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />

              <span>{error}</span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={loadDashboard}
              className="sm:ml-auto"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {/* =====================================
            INFO SISWA + SCAN
        ====================================== */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          {/* DATA SISWA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <UserCircle className="h-8 w-8" />
              </div>

              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {studentName}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <School className="h-4 w-4" />
                    {className}
                  </span>

                  <span>•</span>

                  <span>Siswa</span>
                </div>
              </div>
            </div>
          </div>

          {/* SCAN BUTTON */}
          <button
            type="button"
            onClick={() => navigate("/student/scan")}
            className="group flex min-h-[120px] items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-left transition-all hover:border-brand-300 hover:bg-brand-100 dark:border-brand-900/60 dark:bg-brand-950/40 dark:hover:bg-brand-950"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <QrCode className="h-6 w-6" />
            </div>

            <div>
              <p className="font-bold text-brand-800 dark:text-brand-300">
                Scan Kehadiran
              </p>

              <p className="mt-1 text-xs leading-relaxed text-brand-700/70 dark:text-brand-400/70">
                Scan QR untuk mencatat kehadiran hari ini.
              </p>
            </div>
          </button>
        </div>

        {/* =====================================
            STATUS HARI INI
        ====================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Status Kehadiran Hari Ini
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusStyle.wrapper}`}
                >
                  <StatusIcon className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {isLoading ? "Memuat..." : statusLabel}
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {todayTime
                      ? `Dicatat pukul ${formatTime(todayTime)}`
                      : "Belum ada catatan kehadiran hari ini"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-5 py-4 dark:bg-slate-800/70">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Tanggal
              </p>

              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================
            RINGKASAN
        ====================================== */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Ringkasan Kehadiran
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Rekap status kehadiranmu.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={CheckCircle2}
              label="Hadir"
              value={hadir}
              description="Hari hadir"
              iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            />

            <StatCard
              icon={Clock3}
              label="Terlambat"
              value={terlambat}
              description="Hari terlambat"
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            />

            <StatCard
              icon={CircleX}
              label="Tidak Hadir"
              value={tidakHadir}
              description="Tidak tercatat hadir"
              iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            />
          </div>
        </div>

        {/* =====================================
            RIWAYAT TERBARU
        ====================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-brand-600 dark:text-brand-400" />

                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  Riwayat Terbaru
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Catatan kehadiran terbaru.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/student/history")}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Lihat Semua
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : recentHistory.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentHistory.map((item, index) => {
                const itemStatus =
                  item?.status || item?.status_kehadiran || item?.currentStatus;

                const itemStyle = getStatusStyle(itemStatus);

                const ItemIcon = itemStyle.icon;

                const date =
                  item?.tanggal ||
                  item?.date ||
                  item?.waktu_scan ||
                  item?.waktu_absen ||
                  item?.created_at;

                const time =
                  item?.waktu_scan ||
                  item?.waktu_absen ||
                  item?.time ||
                  item?.scannedAt ||
                  item?.scanTime;

                const note = item?.keterangan || item?.note || "";

                return (
                  <div
                    key={item?.id_absensi || item?.id || `history-${index}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${itemStyle.wrapper}`}
                      >
                        <ItemIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {formatDate(date)}
                        </p>

                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {time
                              ? `Jam ${formatTime(time)}`
                              : "Waktu tidak tersedia"}
                          </span>

                          {note && (
                            <>
                              <span>•</span>
                              <span className="truncate italic">{note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${itemStyle.wrapper}`}
                    >
                      {getStatusLabel(itemStatus)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <History className="h-6 w-6" />
              </div>

              <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
                Belum ada riwayat kehadiran
              </p>

              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Riwayat kehadiran akan muncul setelah kamu melakukan scan QR.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
