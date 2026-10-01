import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ArrowLeft,
  User,
  School,
  IdCard,
  Calendar,
  LayoutDashboard,
  QrCode,
  ShieldAlert,
  Sparkles,
  Info,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";
import attendanceService from "../../services/attendanceService";
import useAuth from "../../hooks/useAuth";
import { ATTENDANCE_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import { formatTime } from "../../utils/formatTime";

function getNormalizedStatus(rawStatus) {
  if (!rawStatus) return ATTENDANCE_STATUS.PRESENT;
  const s = String(rawStatus).toLowerCase();
  if (s === "hadir" || s === "present") return ATTENDANCE_STATUS.PRESENT;
  if (s === "terlambat" || s === "late") return ATTENDANCE_STATUS.LATE;
  if (s === "sakit" || s === "sick") return ATTENDANCE_STATUS.SICK;
  if (s === "izin" || s === "excused") return ATTENDANCE_STATUS.EXCUSED;
  if (s === "alpa" || s === "absent" || s === "tidak hadir")
    return ATTENDANCE_STATUS.ABSENT;
  return ATTENDANCE_STATUS.PRESENT;
}

function AttendanceScan() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [scanData, setScanData] = useState(null);

  // Mencegah API dipanggil dua kali saat React StrictMode aktif
  const hasScanned = useRef(false);

  const token = searchParams.get("token");

  const handleAttendance = async () => {
    try {
      setLoading(true);

      const response = await attendanceService.scanAttendance({
        kode_qr: token,
      });

      console.log("Response absensi:", response);

      setSuccess(true);
      setMessage(response.message || "Absensi berhasil dicatat.");
      setScanData(response.data || null);
    } catch (error) {
      console.error("Gagal melakukan absensi:", error);

      setSuccess(false);

      const serverMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Absensi gagal dilakukan.";

      setMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage("Token QR tidak ditemukan pada URL.");
      return;
    }

    if (hasScanned.current) {
      return;
    }

    hasScanned.current = true;
    handleAttendance();
  }, [token]);

  const normalizedStatus = getNormalizedStatus(scanData?.status);
  const isLate = normalizedStatus === ATTENDANCE_STATUS.LATE;
  const scanTime = scanData?.waktu_scan || new Date();

  return (
    <PageContainer
      title={
        loading
          ? "Memproses Absensi..."
          : success
            ? isLate
              ? "Absensi Dicatat (Terlambat)"
              : "Kehadiran Berhasil"
            : "Absensi Gagal"
      }
      description={
        loading
          ? "Sedang memverifikasi QR Code dan mencatat data kehadiranmu."
          : success
            ? "Data kehadiranmu telah tersimpan di sistem absensi sekolah."
            : "Proses verifikasi QR Code absensi tidak dapat diselesaikan."
      }
      action={
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      }
    >
      <div className="mx-auto max-w-lg space-y-6">
        {/* =========================
            1. LOADING STATE
        ========================= */}
        {loading && (
          <Card className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-8 ring-brand-50/50 dark:bg-brand-950 dark:text-brand-400 dark:ring-brand-950/50">
              <QrCode className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Memverifikasi QR Code...
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Mohon tunggu sejenak, data kehadiran kamu sedang dikirim ke
              server.
            </p>
            <div className="mt-6 flex justify-center">
              <Loading label="Memproses absensi..." />
            </div>
          </Card>
        )}

        {/* =========================
            2. SUCCESS STATE
        ========================= */}
        {!loading && success && (
          <Card className="animate-scale-in text-center shadow-lg transition-all border-slate-200 dark:border-slate-800">
            {/* Header Icon */}
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ring-8 ${
                isLate
                  ? "bg-amber-50 text-amber-600 ring-amber-50/60 dark:bg-amber-950/80 dark:text-amber-400 dark:ring-amber-950/40"
                  : "bg-emerald-50 text-emerald-600 ring-emerald-50/60 dark:bg-emerald-950/80 dark:text-emerald-400 dark:ring-emerald-950/40"
              }`}
            >
              {isLate ? (
                <Clock className="h-10 w-10 animate-bounce" />
              ) : (
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              )}
            </div>

            {/* Title & Badge */}
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Status
                Kehadiran
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isLate ? "Hadir Terlambat" : "Kehadiran Berhasil!"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {message}
            </p>

            <div className="my-4 flex justify-center">
              <AttendanceStatus
                status={normalizedStatus}
                className="text-sm px-3 py-1"
              />
            </div>

            {/* Student & Attendance Info Card */}
            <div className="my-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <User className="h-4 w-4 text-brand-500" />
                  <span>Nama Siswa</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {scanData.siswa.nama_siswa || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <IdCard className="h-4 w-4 text-brand-500" />
                  <span>NIS / NISN</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {scanData.siswa.nis || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <School className="h-4 w-4 text-brand-500" />
                  <span>Kelas</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {scanData.siswa.kelas || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  <span>Waktu Absen</span>
                </div>
                <span className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(scanTime)}, {formatTime(scanTime)}
                </span>
              </div>

              {token && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Token QR</span>
                  <span className="font-mono text-xs text-slate-500 truncate max-w-[180px] bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                    {token}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                as={Link}
                to="/student/dashboard"
                icon={LayoutDashboard}
                fullWidth
              >
                Dashboard
              </Button>
              <Button
                as={Link}
                to="/student/history"
                variant="secondary"
                icon={Calendar}
                fullWidth
              >
                Riwayat Absen
              </Button>
            </div>
          </Card>
        )}

        {/* =========================
            3. ERROR / FAILED STATE
        ========================= */}
        {!loading && !success && (
          <Card className="animate-scale-in text-center shadow-lg transition-all border-red-100 dark:border-red-950/40">
            {/* Error Icon */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/60 dark:bg-red-950/80 dark:text-red-400 dark:ring-red-950/40">
              <XCircle className="h-10 w-10" />
            </div>

            <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-500">
              <ShieldAlert className="h-4 w-4" /> Gagal Mencatat Absensi
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Tidak Dapat Melakukan Absensi
            </h2>

            {/* Backend Message Highlight */}
            <div className="my-4 rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
              {message}
            </div>

            {/* Hint / Context information */}
            <div className="mb-6 rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Catatan untuk Siswa:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Siswa hanya dapat melakukan absensi 1 (satu) kali setiap
                      harinya.
                    </li>
                    <li>
                      Pastikan QR Code dipindai dari layar resmi Guru Kelas /
                      Guru Piket.
                    </li>
                    <li>
                      Jika sesi sudah berakhir, hubungi guru piket untuk
                      konfirmasi kehadiran manual.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button as={Link} to="/student/scan" icon={RotateCcw} fullWidth>
                Scan Ulang
              </Button>
              <Button
                as={Link}
                to="/student/dashboard"
                variant="secondary"
                icon={LayoutDashboard}
                fullWidth
              >
                Ke Beranda
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

export default AttendanceScan;
