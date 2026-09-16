import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, RefreshCw, Radio, IdCard, School } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import useAttendance from '../../hooks/useAttendance';
import useAuth from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';
import { formatTimeShort } from '../../utils/formatTime';

// Bentuk data yang diharapkan dari GET /student/dashboard:
// {
//   student: { name, nis, className },
//   today: { present: number, late: number, absent: number },
//   recentHistory: [{ id, date, subject, time, status }],
//   activeSession: { subject, teacher, className, endsAt } | null
// }
export default function StudentDashboard() {
  const { user } = useAuth();
  const fetchDashboard = useCallback(() => attendanceService.getStudentDashboard(), []);
  const { data, isLoading, error, refetch } = useAttendance(fetchDashboard);

  return (
    <PageContainer
      title={`Halo, ${user?.name || 'Siswa'}`}
      description="Ringkasan kehadiranmu hari ini"
    >
      {isLoading && <Loading label="Memuat dashboard..." />}

      {!isLoading && error && (
        <EmptyState
          title="Gagal memuat dashboard"
          description={error}
          action={
            <Button variant="secondary" icon={RefreshCw} onClick={refetch}>
              Coba Lagi
            </Button>
          }
        />
      )}

      {!isLoading && !error && data && (
        <div className="space-y-6">
          {/* Info identitas siswa */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {(data.student?.name || user?.name || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {data.student?.name || user?.name}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <IdCard className="h-3.5 w-3.5" aria-hidden="true" />
                      NIS {data.student?.nis || '-'}
                    </span>
                    <span className="flex items-center gap-1">
                      <School className="h-3.5 w-3.5" aria-hidden="true" />
                      Kelas {data.student?.className || '-'}
                    </span>
                  </div>
                </div>
              </div>
              <Button as={Link} to="/student/scan" icon={QrCode}>
                Scan QR
              </Button>
            </div>
          </Card>

          {/* Status sesi absensi aktif */}
          {data.activeSession && (
            <Card className="border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Radio className="h-4 w-4 animate-pulse" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                    Sesi absensi sedang berlangsung: {data.activeSession.subject}
                  </p>
                  <p className="text-xs text-brand-700 dark:text-brand-400">
                    Kelas {data.activeSession.className} &middot; berakhir{' '}
                    {formatTimeShort(data.activeSession.endsAt)}
                  </p>
                </div>
                <Button as={Link} to="/student/scan" size="sm" icon={QrCode}>
                  Scan
                </Button>
              </div>
            </Card>
          )}

          {/* Ringkasan kehadiran hari ini */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ringkasan Hari Ini
            </h2>
            <AttendanceStats
              items={[
                { key: 'present', label: 'Hadir', value: data.today?.present ?? 0 },
                { key: 'late', label: 'Terlambat', value: data.today?.late ?? 0 },
                { key: 'absent', label: 'Tidak Hadir', value: data.today?.absent ?? 0 },
              ]}
            />
          </div>

          {/* Riwayat absensi terbaru */}
          <Card>
            <CardHeader
              title="Riwayat Terbaru"
              action={
                <Link
                  to="/student/history"
                  className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Lihat semua
                </Link>
              }
            />
            {data.recentHistory?.length > 0 ? (
              <AttendanceTable rows={data.recentHistory} />
            ) : (
              <EmptyState title="Belum ada riwayat absensi" description="Riwayat absensimu akan muncul di sini." />
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
