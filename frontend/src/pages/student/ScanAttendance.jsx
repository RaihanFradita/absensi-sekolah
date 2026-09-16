import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, User, School, BookOpen, Clock } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import AttendanceStatus from '../../components/attendance/AttendanceStatus';

// html5-qrcode cukup besar; lazy-load supaya tidak membebani bundle awal
// halaman lain yang tidak butuh akses kamera.
const QRScanner = lazy(() => import('../../components/attendance/QRScanner'));
import attendanceService from '../../services/attendanceService';
import { formatTimeShort } from '../../utils/formatTime';

// Pesan error yang dipetakan dari kode/alasan yang dikirim backend.
// Backend yang menentukan alasan gagal; frontend hanya menampilkannya.
const ERROR_MESSAGES = {
  invalid_qr: 'QR Code tidak valid.',
  session_expired: 'Sesi absensi sudah berakhir.',
  already_scanned: 'Anda sudah melakukan absensi untuk sesi ini.',
  class_mismatch: 'Kelas pada QR Code tidak sesuai dengan kelas Anda.',
  default: 'Absensi gagal diproses. Silakan coba lagi.',
};

// idle -> scanning -> processing -> success | error
export default function ScanAttendance() {
  const [phase, setPhase] = useState('scanning');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleScan(sessionToken) {
    if (phase === 'processing') return; // Cegah scan ganda saat masih diproses
    setPhase('processing');

    try {
      // Identitas siswa TIDAK dikirim dari sini — backend membacanya dari token
      // Authorization milik siswa yang sedang login.
      const data = await attendanceService.scanAttendance({ sessionToken });
      setResult(data);
      setPhase('success');
    } catch (error) {
      const reason = error?.raw?.response?.data?.reason;
      setErrorMessage(ERROR_MESSAGES[reason] || error?.message || ERROR_MESSAGES.default);
      setPhase('error');
    }
  }

  function reset() {
    setResult(null);
    setErrorMessage('');
    setPhase('scanning');
  }

  return (
    <PageContainer
      title="Scan Absensi"
      description="Arahkan kamera ke QR Code yang ditampilkan guru"
      action={
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali
        </Link>
      }
    >
      <div className="mx-auto max-w-sm">
        {(phase === 'scanning' || phase === 'processing') && (
          <Suspense fallback={<Loading label="Menyiapkan kamera..." />}>
            <QRScanner onScan={handleScan} isProcessing={phase === 'processing'} />
          </Suspense>
        )}

        {phase === 'success' && (
          <Card className="animate-scale-in text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              Absensi berhasil!
            </p>
            <div className="mb-4 flex justify-center">
              <AttendanceStatus status={result?.status} />
            </div>

            <dl className="space-y-2.5 rounded-lg bg-slate-50 p-4 text-left text-sm dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Nama siswa</dt>
                <dd className="text-slate-700 dark:text-slate-300">{result?.studentName}</dd>
              </div>
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Kelas</dt>
                <dd className="text-slate-700 dark:text-slate-300">{result?.className}</dd>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Mata pelajaran</dt>
                <dd className="text-slate-700 dark:text-slate-300">{result?.subject}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <dt className="sr-only">Waktu scan</dt>
                <dd className="text-slate-700 dark:text-slate-300">{formatTimeShort(result?.scannedAt)}</dd>
              </div>
            </dl>

            <Button as={Link} to="/student/dashboard" fullWidth className="mt-5">
              Kembali ke Beranda
            </Button>
          </Card>
        )}

        {phase === 'error' && (
          <Card className="animate-scale-in text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
              <XCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              Absensi gagal
            </p>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{errorMessage}</p>
            <Button variant="secondary" icon={RotateCcw} fullWidth onClick={reset}>
              Coba Scan Lagi
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
