import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, RefreshCw, Radio, Clock, School, ArrowRight } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import useAttendance from '../../hooks/useAttendance';
import useAuth from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';
import { formatTimeShort } from '../../utils/formatTime';

// Bentuk data yang diharapkan dari GET /teacher/dashboard:
// {
//   teacher: { name },
//   todaySchedule: [{ id, subject, className, startTime, endTime }],
//   activeSession: { id, subject, className, presentCount, lateCount, notYetCount } | null,
// }
export default function TeacherDashboard() {
  const { user } = useAuth();
  const fetchDashboard = useCallback(() => attendanceService.getTeacherDashboard(), []);
  const { data, isLoading, error, refetch } = useAttendance(fetchDashboard);

  return (
    <PageContainer title={`Halo, ${user?.name || 'Guru'}`} description="Ringkasan mengajar hari ini">
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
          {/* Sesi absensi yang sedang aktif */}
          {data.activeSession ? (
            <Card className="border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Radio className="h-4 w-4 animate-pulse" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                      Sesi aktif: {data.activeSession.subject}
                    </p>
                    <p className="text-xs text-brand-700 dark:text-brand-400">
                      Kelas {data.activeSession.className} &middot;{' '}
                      {data.activeSession.presentCount ?? 0} hadir, {data.activeSession.lateCount ?? 0} terlambat
                    </p>
                  </div>
                </div>
                <Button as={Link} to={`/teacher/sessions/${data.activeSession.id}`} icon={ArrowRight}>
                  Buka Sesi
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Tidak ada sesi absensi yang sedang berlangsung
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Buat sesi baru untuk mulai mengambil absensi kelas.
                  </p>
                </div>
                <Button as={Link} to="/teacher/sessions/create" icon={CalendarPlus}>
                  Buat Sesi
                </Button>
              </div>
            </Card>
          )}

          {/* Statistik sesi aktif */}
          {data.activeSession && (
            <AttendanceStats
              items={[
                { key: 'present', label: 'Hadir', value: data.activeSession.presentCount ?? 0 },
                { key: 'late', label: 'Terlambat', value: data.activeSession.lateCount ?? 0 },
                { key: 'total', label: 'Belum Absen', value: data.activeSession.notYetCount ?? 0 },
              ]}
            />
          )}

          {/* Jadwal hari ini */}
          <Card>
            <CardHeader title="Jadwal Hari Ini" />
            {data.todaySchedule?.length > 0 ? (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.todaySchedule.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.subject}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <School className="h-3.5 w-3.5" aria-hidden="true" />
                          {item.className}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatTimeShort(item.startTime)} - {formatTimeShort(item.endTime)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Tidak ada jadwal hari ini" />
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
