import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  User,
  School,
  Clock,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";

const QRScanner = lazy(() => import("../../components/attendance/QRScanner"));
import attendanceService from "../../services/attendanceService";
import { formatTimeShort } from "../../utils/formatTime";

const ERROR_MESSAGES = {
  invalid_qr: "QR Code kehadiran tidak valid.",
  session_expired: "QR kehadiran hari ini sudah tidak aktif.",
  already_scanned:
    "Kamu sudah melakukan absensi hari ini. Satu siswa hanya dapat absen satu kali per hari.",
  class_mismatch: "QR Code tidak berlaku untuk akunmu.",
  default: "Absensi gagal diproses. Silakan coba lagi.",
};

export default function ScanAttendance() {
  const [phase, setPhase] = useState("scanning");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleScan(sessionToken) {
    if (phase === "processing") return;
    setPhase("processing");
    try {
      const data = await attendanceService.scanAttendance({ sessionToken });
      setResult(data);
      setPhase("success");
    } catch (error) {
      const reason = error?.raw?.response?.data?.reason;
      setErrorMessage(
        ERROR_MESSAGES[reason] || error?.message || ERROR_MESSAGES.default,
      );
      setPhase("error");
    }
  }

  function reset() {
    setResult(null);
    setErrorMessage("");
    setPhase("scanning");
  }

  return (
    <PageContainer
      title="Scan Kehadiran"
      description="Scan QR Code kehadiran saat masuk sekolah. Cukup satu kali setiap hari."
      action={
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      }
    >
      <div className="mx-auto max-w-sm">
        {(phase === "scanning" || phase === "processing") && (
          <>
            <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-center text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200">
              <strong>Absensi Harian Sekolah</strong>
              <br />
              QR ini bukan QR per mata pelajaran.
            </div>
            <Suspense fallback={<Loading label="Menyiapkan kamera..." />}>
              <QRScanner
                onScan={handleScan}
                isProcessing={phase === "processing"}
              />
            </Suspense>
          </>
        )}

        {phase === "success" && (
          <Card className="animate-scale-in text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              Kehadiran berhasil dicatat!
            </p>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Kamu sudah tercatat hadir untuk hari ini.
            </p>
            <div className="mb-4 flex justify-center">
              <AttendanceStatus status={result?.status} />
            </div>
            <dl className="space-y-2.5 rounded-lg bg-slate-50 p-4 text-left text-sm dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <dt className="sr-only">Nama</dt>
                <dd>{result?.studentName}</dd>
              </div>
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-slate-400" />
                <dt className="sr-only">Kelas</dt>
                <dd>{result?.className}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <dt className="sr-only">Waktu</dt>
                <dd>Masuk {formatTimeShort(result?.scannedAt)}</dd>
              </div>
            </dl>
            <Button
              as={Link}
              to="/student/dashboard"
              fullWidth
              className="mt-5"
            >
              Kembali ke Beranda
            </Button>
          </Card>
        )}

        {phase === "error" && (
          <Card className="animate-scale-in text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
              <XCircle className="h-7 w-7" />
            </div>
            <p className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              Absensi gagal
            </p>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              {errorMessage}
            </p>
            <Button
              variant="secondary"
              icon={RotateCcw}
              fullWidth
              onClick={reset}
            >
              Coba Scan Lagi
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
