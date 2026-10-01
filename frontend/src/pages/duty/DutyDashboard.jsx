import { useCallback, useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import DailyAttendanceManager from '../../components/attendance/DailyAttendanceManager';
import useAuth from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';

export default function DutyDashboard({ title }) {
  const { user } = useAuth();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [className, setClassName] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const dashboard = await attendanceService.getDutyDashboard({
        date,
        className,
      });

      const daily = await attendanceService.getDailyAttendance({
        date,
        className,
      });

      setData({
        ...dashboard,
        rows: daily.rows || [],
      });
    } catch (e) {
      setError(e.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [date, className]);

  useEffect(() => {
    load();
  }, [load]);

  async function exportExcel() {
    setExporting(true);

    try {
      const file = await attendanceService.exportAttendanceExcel({
        date,
        className,
      });

      attendanceService.downloadBlob(file);
    } catch (e) {
      setError(e.message || 'Gagal mengekspor data.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <PageContainer
      title={
        title ||
        `Piket Hari Ini · ${user?.name || 'Guru Piket'}`
      }
      description="Pantau kehadiran seluruh siswa tanpa mengubah status absensi."
    >
      {loading && (
        <Loading label="Memuat data piket..." />
      )}

      {!loading && error && (
        <EmptyState
          title="Gagal memuat data"
          description={error}
          action={
            <Button onClick={load}>
              Coba Lagi
            </Button>
          }
        />
      )}

      {!loading && !error && data && (
        <DailyAttendanceManager
          title="Rekap Kehadiran Harian"
          subtitle="Guru Piket hanya dapat memantau data kehadiran. Perubahan status dilakukan oleh Guru Kelas."
          rows={data.rows}
          date={date}
          setDate={setDate}
          classes={data.allowedClasses || []}
          className={className}
          setClassName={setClassName}

          // Guru Piket tidak boleh mengubah status
          canEdit={false}

          onUpdate={undefined}

          onExport={exportExcel}
          exporting={exporting}
          currentUserName={user?.name}
        />
      )}
    </PageContainer>
  );
}