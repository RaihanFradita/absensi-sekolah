import { useCallback, useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import DailyAttendanceManager from "../../components/attendance/DailyAttendanceManager";
import useAuth from "../../hooks/useAuth";
import attendanceService from "../../services/attendanceService";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [className, setClassName] = useState(user?.homeroomClass || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const dashboard = await attendanceService.getTeacherDashboard({
        date,
        className,
      });
      const daily = await attendanceService.getDailyAttendance({
        date,
        className: className || dashboard.allowedClasses?.[0],
      });
      setData({ ...dashboard, rows: daily.rows || [] });
      if (!className && dashboard.allowedClasses?.length === 1)
        setClassName(dashboard.allowedClasses[0]);
    } catch (e) {
      setError(e.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [date, className]);
  useEffect(() => {
    load();
  }, [load]);
  async function update(id, payload) {
    await attendanceService.updateAttendanceStatus(id, payload);
    await load();
  }
  async function exportExcel() {
    setExporting(true);
    try {
      const file = await attendanceService.exportAttendanceExcel({
        date,
        className,
      });
      attendanceService.downloadBlob(file);
    } finally {
      setExporting(false);
    }
  }
  return (
    <PageContainer
      title={`Halo, ${user?.name || "Guru Kelas"}`}
      description="Rekap kehadiran harian kelas yang menjadi tanggung jawab Anda."
    >
      {loading && <Loading label="Memuat rekap kelas..." />}
      {!loading && error && (
        <EmptyState
          title="Gagal memuat data"
          description={error}
          action={<Button onClick={load}>Coba Lagi</Button>}
        />
      )}{" "}
      {!loading && !error && data && (
        <DailyAttendanceManager
          title="Rekap Kehadiran Kelas"
          subtitle="Klik kartu status untuk melihat nama siswa dalam kategori tersebut."
          rows={data.rows}
          date={date}
          setDate={setDate}
          classes={data.allowedClasses || []}
          className={className}
          setClassName={setClassName}
          canEdit
          onUpdate={update}
          onExport={exportExcel}
          exporting={exporting}
          currentUserName={user?.name}
        />
      )}
    </PageContainer>
  );
}
