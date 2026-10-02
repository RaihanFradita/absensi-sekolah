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
  CheckCircle2,
  Users,
  UserCheck,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Badge from "../../components/ui/Badge";
import QRDisplay from "../../components/attendance/QRDisplay";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import useAttendance from "../../hooks/useAttendance";
import attendanceService from "../../services/attendanceService";
import {
  formatCountdown,
  formatTime,
  formatTimeShort,
  getSecondsUntil,
} from "../../utils/formatTime";
import useSocket from "../../hooks/useSocket";
import toast from "react-hot-toast";

function renderStatusBadge(status) {
  const isLate = status === "terlambat" || status === "late";
  const isPresent = status === "hadir" || status === "present";

  if (isLate) {
    return (
      <Badge tone="warning" className="gap-1">
        <Clock className="h-3.5 w-3.5" />
        Terlambat
      </Badge>
    );
  }

  if (isPresent) {
    return (
      <Badge tone="success" className="gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Hadir
      </Badge>
    );
  }

  return (
    <Badge tone="neutral" className="gap-1">
      {status || "-"}
    </Badge>
  );
}

function displayScanTime(value) {
  if (!value) return "-";
  if (typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value;
  }
  const formatted = formatTime(value);
  return formatted !== "-" ? formatted : String(value);
}

// Satu sesi = QR kehadiran harian sekolah. Tidak terkait mata pelajaran.
export default function AttendanceSession() {
  // Route menyediakan :sessionId agar URL sesi bisa dibagikan/di-bookmark,
  // namun data diambil lewat getActiveSession() (endpoint di services spec)
  // yang mengembalikan sesi aktif milik guru yang sedang login.
  const { sessionId } = useParams();
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
  const [scannedStudents, setScannedStudents] = useState([]);

  const endsAt = data?.endsAt || data?.waktu_tutup;
  const sessionIdValue = data?.id || data?.id_sesi;

  // Inisialisasi daftar siswa yang sudah scan jika data sesi menyediakannya
  useEffect(() => {
    if (data?.attendees && Array.isArray(data.attendees)) {
      setScannedStudents(data.attendees);
    } else if (data?.events && Array.isArray(data.events)) {
      setScannedStudents(
        data.events.map((e) => ({
          id_siswa: e.id_siswa || e.student?.id || e.id,
          nama_siswa: e.nama_siswa || e.student?.name,
          nama_kelas: e.nama_kelas || e.student?.className,
          status: e.status,
          waktu_scan: e.waktu_scan || e.time,
        })),
      );
    }
  }, [data]);

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

  // Update jumlah hadir/terlambat/belum dan tabel secara real-time lewat socket.io
  const { status: wsStatus } = useSocket({
    sessionId: sessionIdValue,
    enabled: Boolean(sessionIdValue),
    onEvent: (payload) => {
      const isLate = payload.status === "terlambat" || payload.status === "late";
      if (payload.nama_siswa) {
        toast.success(
          `${payload.nama_siswa} (${payload.nama_kelas || ""}) telah absen [${isLate ? "Terlambat" : "Hadir"}]`,
          { id: `att-${payload.id_siswa}-${Date.now()}` },
        );
      }

      // Menambahkan siswa yang berhasil scan ke dalam tabel
      setScannedStudents((prev) => {
        const newItem = {
          id_siswa: payload.id_siswa,
          nama_siswa: payload.nama_siswa,
          nama_kelas: payload.nama_kelas,
          status: payload.status,
          waktu_scan: payload.waktu_scan || new Date().toISOString(),
        };

        const exists = prev.some(
          (s) =>
            (payload.id_siswa && s.id_siswa === payload.id_siswa) ||
            (!payload.id_siswa && s.nama_siswa === payload.nama_siswa),
        );

        if (exists) {
          return prev.map((s) =>
            (payload.id_siswa && s.id_siswa === payload.id_siswa) ||
            (!payload.id_siswa && s.nama_siswa === payload.nama_siswa)
              ? newItem
              : s,
          );
        }

        return [newItem, ...prev];
      });

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          presentCount: isLate
            ? (prev.presentCount ?? 0)
            : (prev.presentCount ?? 0) + 1,
          lateCount: isLate ? (prev.lateCount ?? 0) + 1 : (prev.lateCount ?? 0),
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
              {data.attendanceDate.split("T")[0] || data.tanggal || "Hari ini"}
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

        {/* Tabel Siswa yang Berhasil Scan */}
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Siswa Berhasil Scan
              </h3>
            </div>
            <Badge tone="brand">
              {scannedStudents.length} Siswa
            </Badge>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="max-h-80 overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <tr>
                    <th className="w-14 px-4 py-3 text-center">No</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Waktu Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
                  {scannedStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500"
                      >
                        <UserCheck className="mx-auto mb-2 h-7 w-7 text-slate-300 dark:text-slate-600" />
                        Belum ada siswa yang melakukan scan QR pada sesi ini.
                      </td>
                    </tr>
                  ) : (
                    scannedStudents.map((student, index) => (
                      <tr
                        key={
                          student.id_siswa
                            ? `${student.id_siswa}-${index}`
                            : `${student.nama_siswa}-${index}`
                        }
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
                      >
                        <td className="px-4 py-3 text-center font-medium text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {student.nama_siswa || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {student.nama_kelas || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {renderStatusBadge(student.status)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                          {displayScanTime(student.waktu_scan)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
