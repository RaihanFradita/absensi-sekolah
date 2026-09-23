import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Maximize,
  Minimize,
  Square,
  RefreshCw,
  CalendarDays,
  User,
  Clock,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import QRDisplay from "../../components/attendance/QRDisplay";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import useAttendance from "../../hooks/useAttendance";
import useWebSocket from "../../hooks/useWebSocket";
import attendanceService from "../../services/attendanceService";
import {
  formatCountdown,
  formatTimeShort,
  getSecondsUntil,
} from "../../utils/formatTime";

// Satu sesi = QR kehadiran harian sekolah. Tidak terkait mata pelajaran.
export default function AttendanceSession() {
  // Route menyediakan :sessionId agar URL sesi bisa dibagikan/di-bookmark,
  // namun data diambil lewat getActiveSession() (endpoint di services spec)
  // yang mengembalikan sesi aktif milik guru yang sedang login.
  const { sessionId } = useParams();
  console.log(sessionId);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const fetchSession = useCallback(
    () => attendanceService.getActiveSession(sessionId),
    [sessionId],
  );
  const { data, isLoading, error, refetch, setData } =
    useAttendance(fetchSession);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState("");

  const endsAt = data?.endsAt || data?.waktu_tutup;
  const sessionIdValue = data?.id || data?.id_sesi;

  // Countdown masa aktif QR, dihitung ulang tiap detik dari waktu berakhir backend.
  useEffect(() => {
    if (!endsAt) return undefined;
    // Inisialisasi + tick countdown dari waktu berakhir yang dikirim backend —
    // bukan hasil fetch di effect ini, hanya sinkronisasi timer lokal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecondsLeft(getSecondsUntil(endsAt));
    const interval = setInterval(
      () => setSecondsLeft(getSecondsUntil(endsAt)),
      1000,
    );
    return () => clearInterval(interval);
  }, [endsAt]);

  // Update jumlah hadir/terlambat/belum secara real-time lewat WebSocket.
  const wsPath = sessionIdValue ? `/sessions/${sessionIdValue}/monitor` : null;
  const { status: wsStatus } = useWebSocket(wsPath, {
    enabled: Boolean(sessionIdValue),
    onMessage: (payload) => {
      if (payload?.event !== "attendance_created") return;
      setData((prev) => {
        if (!prev) return prev;
        const isLate = payload.status === "late";
        return {
          ...prev,
          presentCount: isLate
            ? prev.presentCount
            : (prev.presentCount ?? 0) + 1,
          lateCount: isLate ? (prev.lateCount ?? 0) + 1 : prev.lateCount,
          notYetCount: Math.max(0, (prev.notYetCount ?? 0) - 1),
        };
      });
    },
  });

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  async function handleEndSession() {
    setIsEnding(true);
    setEndError("");
    try {
      await attendanceService.endAttendanceSession(sessionIdValue);
      setIsEndDialogOpen(false);
      navigate("/teacher/dashboard", { replace: true });
    } catch (error) {
      setEndError(
        error?.message || "Gagal mengakhiri sesi. Silakan coba lagi.",
      );
    } finally {
      setIsEnding(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="Sesi Absensi">
        <Loading label="Memuat sesi absensi..." />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer title="Sesi Absensi">
        <EmptyState
          title="Tidak dapat memuat sesi"
          description={error || "Sesi tidak ditemukan atau sudah berakhir."}
          action={
            <Button variant="secondary" icon={RefreshCw} onClick={refetch}>
              Coba Lagi
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="QR Kehadiran Harian"
      description="Gunakan QR ini untuk absensi siswa saat masuk sekolah"
    >
      <div
        ref={containerRef}
        className="rounded-2xl bg-white p-4 dark:bg-slate-950 sm:p-8"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" aria-hidden="true" />
              {data.teacherName || data.nama_guru || "Guru"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {data.attendanceDate || data.tanggal || "Hari ini"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatTimeShort(data.startsAt || data.waktu_buka)} -{" "}
              {formatTimeShort(data.endsAt || data.waktu_tutup)}
            </span>
          </div>
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              wsStatus === "connected"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                wsStatus === "connected"
                  ? "bg-emerald-500"
                  : "bg-amber-500 animate-pulse"
              }`}
            />
            {wsStatus === "connected" ? "Live" : "Menghubungkan..."}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <QRDisplay value={data.qrToken || data.kode_qr} size={280} />

          <div className="mt-5 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              QR aktif selama jendela absensi
            </p>
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCountdown(secondsLeft)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AttendanceStats
            items={[
              { key: "present", label: "Hadir", value: data.presentCount ?? 0 },
              { key: "late", label: "Terlambat", value: data.lateCount ?? 0 },
              {
                key: "total",
                label: "Belum Absen",
                value: data.notYetCount ?? 0,
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button
          variant="secondary"
          icon={isFullscreen ? Minimize : Maximize}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
        </Button>
        <Button
          variant="danger"
          icon={Square}
          onClick={() => setIsEndDialogOpen(true)}
        >
          Tutup QR
        </Button>
      </div>

      {endError && (
        <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">
          {endError}
        </p>
      )}

      <ConfirmDialog
        open={isEndDialogOpen}
        title="Tutup QR kehadiran hari ini?"
        description="Siswa tidak akan bisa melakukan scan lagi setelah QR ditutup. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Tutup QR"
        isLoading={isEnding}
        onConfirm={handleEndSession}
        onCancel={() => setIsEndDialogOpen(false)}
      />
    </PageContainer>
  );
}
