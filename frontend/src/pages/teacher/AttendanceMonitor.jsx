import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff, CalendarDays } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import AttendanceStats from "../../components/attendance/AttendanceStats";
import LiveAttendanceFeed from "../../components/attendance/LiveAttendanceFeed";
import useAttendance from "../../hooks/useAttendance";
import useWebSocket from "../../hooks/useWebSocket";
import attendanceService from "../../services/attendanceService";

const WS_STATUS_LABEL = {
  idle: "Belum terhubung",
  connecting: "Menghubungkan...",
  connected: "Terhubung",
  reconnecting: "Koneksi terputus. Mencoba kembali.",
  disconnected: "Terputus",
  failed: "Gagal terhubung",
  error: "Terjadi kesalahan koneksi",
};

export default function AttendanceMonitor() {
  const fetchActiveSession = useCallback(
    () => attendanceService.getActiveSession(),
    [],
  );
  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useAttendance(fetchActiveSession);
  const [events, setEvents] = useState([]);
  const [counts, setCounts] = useState({ present: 0, late: 0 });
  const [monitorError, setMonitorError] = useState("");
  const [isMonitorLoading, setIsMonitorLoading] = useState(false);

  useEffect(() => {
    if (!session?.id) return undefined;
    let cancelled = false;
    async function loadMonitor() {
      setIsMonitorLoading(true);
      setMonitorError("");
      try {
        const result = await attendanceService.getAttendanceMonitor(session.id);
        if (!cancelled) {
          setEvents(result.events || []);
          setCounts({
            present: result.presentCount || 0,
            late: result.lateCount || 0,
          });
        }
      } catch (err) {
        if (!cancelled)
          setMonitorError(err?.message || "Gagal memuat data monitor.");
      } finally {
        if (!cancelled) setIsMonitorLoading(false);
      }
    }
    loadMonitor();
    return () => {
      cancelled = true;
    };
  }, [session?.id]);

  const wsPath = session?.id ? `/sessions/${session.id}/monitor` : null;
  const { status: wsStatus, reconnect } = useWebSocket(wsPath, {
    enabled: Boolean(session?.id),
    onMessage: (payload) => {
      if (payload?.event !== "attendance_created") return;
      const newEvent = {
        id: `${payload.student?.name}-${payload.time}-${Math.random()}`,
        student: payload.student,
        time: payload.time,
        status: payload.status,
      };
      setEvents((prev) => [newEvent, ...prev]);
      setCounts((prev) => ({
        present: payload.status === "present" ? prev.present + 1 : prev.present,
        late: payload.status === "late" ? prev.late + 1 : prev.late,
      }));
    },
  });
  const isConnected = wsStatus === "connected";

  return (
    <PageContainer
      title="Monitor Kehadiran Harian"
      description={
        session
          ? "Pantau siswa yang sudah scan QR masuk sekolah secara real-time"
          : "Pantau absensi masuk sekolah secara real-time"
      }
    >
      {isSessionLoading && <Loading label="Memuat QR kehadiran aktif..." />}
      {!isSessionLoading && sessionError && (
        <EmptyState
          title="Gagal memuat sesi harian"
          description={sessionError}
          action={
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={refetchSession}
            >
              Coba Lagi
            </Button>
          }
        />
      )}
      {!isSessionLoading && !sessionError && !session && (
        <EmptyState
          title="Belum ada QR kehadiran aktif"
          description="Buat QR kehadiran harian terlebih dahulu untuk memulai monitor."
        />
      )}
      {!isSessionLoading && !sessionError && session && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <CalendarDays className="h-4 w-4" />
            {session.attendanceDate || "Hari ini"}
            <span className="ml-auto">
              {session.startTime || ""}
              {session.endTime ? ` - ${session.endTime}` : ""}
            </span>
          </div>
          <div
            className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${isConnected ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400" : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"}`}
          >
            <span className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {WS_STATUS_LABEL[wsStatus] || WS_STATUS_LABEL.idle}
            </span>
            {!isConnected && wsStatus !== "connecting" && (
              <Button
                size="sm"
                variant="secondary"
                icon={RefreshCw}
                onClick={reconnect}
              >
                Sambungkan Ulang
              </Button>
            )}
          </div>
          <AttendanceStats
            items={[
              { key: "present", label: "Hadir", value: counts.present },
              { key: "late", label: "Terlambat", value: counts.late },
            ]}
          />
          <Card>
            <CardHeader
              title="Siswa yang Baru Scan"
              subtitle="Setiap siswa hanya dapat tercatat satu kali hari ini"
            />
            {isMonitorLoading ? (
              <Loading label="Memuat data absensi..." />
            ) : monitorError ? (
              <EmptyState
                title="Gagal memuat data"
                description={monitorError}
              />
            ) : (
              <LiveAttendanceFeed events={events} />
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
