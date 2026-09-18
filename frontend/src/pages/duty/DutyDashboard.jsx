import { useCallback, useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import DailyAttendanceManager from "../../components/attendance/DailyAttendanceManager";
import useAuth from "../../hooks/useAuth";
import attendanceService from "../../services/attendanceService";

export default function DutyDashboard({ onlyNotScanned = false, title }) {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [className, setClassName] = useState("");
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [exporting, setExporting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await attendanceService.getDutyDashboard({ date, className });
      const daily = await attendanceService.getDailyAttendance({
        date,
        className,
      });
      let rows = daily.rows || [];
      if (onlyNotScanned) rows = rows.filter((r) => !r.scanTime);
      setData({ ...d, rows });
    } catch (e) {
      setError(e.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [date, className, onlyNotScanned]);
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
      title={title || `Piket Hari Ini · ${user?.name || "Guru Piket"}`}
      description={
        onlyNotScanned
          ? "Verifikasi siswa yang belum melakukan scan QR."
          : "Pantau dan verifikasi kehadiran seluruh siswa sesuai kewenangan piket."
      }
    >
      {loading && <Loading label="Memuat data piket..." />}
      {!loading && error && (
        <EmptyState
          title="Gagal memuat data"
          description={error}
          action={<Button onClick={load}>Coba Lagi</Button>}
        />
      )}{" "}
      {!loading && !error && data && (
        <DailyAttendanceManager
          title={onlyNotScanned ? "Siswa Belum Scan" : "Rekap Kehadiran Harian"}
          subtitle="Status dapat diverifikasi tanpa menghapus jejak scan asli."
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
