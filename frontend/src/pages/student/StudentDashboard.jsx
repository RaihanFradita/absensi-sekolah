import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, RefreshCw, Radio, IdCard, School, CheckCircle2, Clock3 } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import AttendanceStatus from '../../components/attendance/AttendanceStatus';
import useAttendance from '../../hooks/useAttendance';
import useAuth from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';
import { formatTimeShort } from '../../utils/formatTime';

export default function StudentDashboard() {
  const { user } = useAuth();
  const fetchDashboard = useCallback(() => attendanceService.getStudentDashboard(), []);
  const { data, isLoading, error, refetch } = useAttendance(fetchDashboard);
  const todayStatus = data?.today?.status;

  return (
    <PageContainer title={`Halo, ${user?.name || 'Siswa'}`} description="Pantau kehadiran sekolahmu hari ini">
      {isLoading && <Loading label="Memuat dashboard..." />}
      {!isLoading && error && <EmptyState title="Gagal memuat dashboard" description={error} action={<Button variant="secondary" icon={RefreshCw} onClick={refetch}>Coba Lagi</Button>} />}
      {!isLoading && !error && data && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {(data.student?.name || user?.name || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{data.student?.name || user?.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><IdCard className="h-3.5 w-3.5" />NIS {data.student?.nis || '-'}</span>
                    <span className="flex items-center gap-1"><School className="h-3.5 w-3.5" />Kelas {data.student?.className || '-'}</span>
                  </div>
                </div>
              </div>
              <Button as={Link} to="/student/scan" icon={QrCode}>Scan Kehadiran</Button>
            </div>
          </Card>

          {data.activeSession && (
            <Card className="border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white"><Radio className="h-4 w-4 animate-pulse" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-900 dark:text-brand-200">Absensi masuk sekolah sedang dibuka</p>
                  <p className="text-xs text-brand-700 dark:text-brand-400">Scan QR sekali saja hari ini. QR aktif sampai {formatTimeShort(data.activeSession.endsAt)}.</p>
                </div>
                <Button as={Link} to="/student/scan" size="sm" icon={QrCode}>Scan</Button>
              </div>
            </Card>
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Status Hari Ini</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${todayStatus ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                  {todayStatus ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Kehadiran</p>
                  {todayStatus ? <AttendanceStatus status={todayStatus} /> : <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Belum Absen</p>}
                  {data.today?.scannedAt && <p className="mt-1 text-xs text-slate-500">Scan {formatTimeShort(data.today.scannedAt)}</p>}
                </div>
              </Card>
              <AttendanceStats items={data.summary ? [
                { key: 'present', label: 'Hadir', value: data.summary.present ?? 0 },
                { key: 'late', label: 'Terlambat', value: data.summary.late ?? 0 },
                { key: 'absent', label: 'Tidak Hadir', value: data.summary.absent ?? 0 },
              ] : []} />
            </div>
          </div>

          <Card>
            <CardHeader title="Riwayat Terbaru" action={<Link to="/student/history" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">Lihat semua</Link>} />
            {data.recentHistory?.length > 0 ? <AttendanceTable rows={data.recentHistory} /> : <EmptyState title="Belum ada riwayat" description="Riwayat kehadiran harianmu akan muncul di sini." />}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
