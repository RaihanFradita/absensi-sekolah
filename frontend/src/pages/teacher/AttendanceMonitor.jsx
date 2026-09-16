import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import LiveAttendanceFeed from '../../components/attendance/LiveAttendanceFeed';
import useAttendance from '../../hooks/useAttendance';
import useWebSocket from '../../hooks/useWebSocket';
import attendanceService from '../../services/attendanceService';

const WS_STATUS_LABEL = {
  idle: 'Belum terhubung',
  connecting: 'Menghubungkan...',
  connected: 'Terhubung',
  reconnecting: 'Koneksi terputus. Mencoba menghubungkan kembali.',
  disconnected: 'Terputus',
  failed: 'Gagal terhubung',
  error: 'Terjadi kesalahan koneksi',
};

// Bentuk data yang diharapkan dari GET /attendance/sessions/active lalu
// GET /attendance/sessions/:id/monitor:
// activeSession: { id, subject, className }
// monitor: { events: [{ id, student, subject, time, status }], presentCount, lateCount }
export default function AttendanceMonitor() {
  const fetchActiveSession = useCallback(() => attendanceService.getActiveSession(), []);
  const { data: session, isLoading: isSessionLoading, error: sessionError, refetch: refetchSession } =
    useAttendance(fetchActiveSession);

  const [events, setEvents] = useState([]);
  const [counts, setCounts] = useState({ present: 0, late: 0 });
  const [monitorError, setMonitorError] = useState('');
  const [isMonitorLoading, setIsMonitorLoading] = useState(false);

  useEffect(() => {
    if (!session?.id) return;
    let cancelled = false;

    async function loadMonitor() {
      setIsMonitorLoading(true);
      setMonitorError('');
      try {
        const result = await attendanceService.getAttendanceMonitor(session.id);
        if (cancelled) return;
        setEvents(result.events || []);
        setCounts({ present: result.presentCount || 0, late: result.lateCount || 0 });
      } catch (err) {
        if (!cancelled) setMonitorError(err?.message || 'Gagal memuat data monitor.');
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
      if (payload?.event !== 'attendance_created') return;
      const newEvent = {
        id: `${payload.student?.name}-${payload.time}-${Math.random()}`,
        student: payload.student,
        subject: payload.subject,
        time: payload.time,
        status: payload.status,
      };
      setEvents((prev) => [newEvent, ...prev]);
      setCounts((prev) => ({
        present: payload.status === 'present' ? prev.present + 1 : prev.present,
        late: payload.status === 'late' ? prev.late + 1 : prev.late,
      }));
    },
  });

  const isConnected = wsStatus === 'connected';

  return (
    <PageContainer
      title="Monitor Absensi"
      description={session ? `${session.subject} \u2014 Kelas ${session.className}` : 'Pantau absensi secara real-time'}
    >
      {isSessionLoading && <Loading label="Memuat sesi aktif..." />}

      {!isSessionLoading && sessionError && (
        <EmptyState
          title="Gagal memuat sesi"
          description={sessionError}
          action={
            <Button variant="secondary" icon={RefreshCw} onClick={refetchSession}>
              Coba Lagi
            </Button>
          }
        />
      )}

      {!isSessionLoading && !sessionError && !session && (
        <EmptyState
          title="Tidak ada sesi absensi aktif"
          description="Buat sesi absensi terlebih dahulu untuk memulai monitor."
        />
      )}

      {!isSessionLoading && !sessionError && session && (
        <div className="space-y-6">
          {/* Indikator koneksi WebSocket */}
          <div
            className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
              isConnected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400'
            }`}
          >
            <span className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4" aria-hidden="true" />
              )}
              {WS_STATUS_LABEL[wsStatus] || WS_STATUS_LABEL.idle}
            </span>
            {!isConnected && wsStatus !== 'connecting' && (
              <Button size="sm" variant="secondary" icon={RefreshCw} onClick={reconnect}>
                Sambungkan Ulang
              </Button>
            )}
          </div>

          <AttendanceStats
            items={[
              { key: 'present', label: 'Hadir', value: counts.present },
              { key: 'late', label: 'Terlambat', value: counts.late },
            ]}
          />

          <Card>
            <CardHeader title="Baru Saja Scan" subtitle="Urutan terbaru berada paling atas" />
            {isMonitorLoading ? (
              <Loading label="Memuat data absensi..." />
            ) : monitorError ? (
              <EmptyState title="Gagal memuat data" description={monitorError} />
            ) : (
              <LiveAttendanceFeed events={events} />
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
