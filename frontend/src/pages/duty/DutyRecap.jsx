import { useCallback, useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import DailyAttendanceManager from "../../components/attendance/DailyAttendanceManager";
import useAuth from "../../hooks/useAuth";
import picketTeacherService from "../../services/picketTeacherService";

const getTodayWIB = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export default function DutyRecap({
  onlyNotScanned = false,
  title = "Rekap Kehadiran Harian",
}) {
  const { user } = useAuth();

  const [date, setDate] = useState(getTodayWIB());
  const [className, setClassName] = useState("");
  const [allowedClasses, setAllowedClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const LIMIT = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardRes, dailyRes] = await Promise.all([
        picketTeacherService.getDashboard({ date, className }),
        picketTeacherService.getDaily({ date, className, page, limit: LIMIT }),
      ]);

      if (dashboardRes?.allowedClasses) {
        setAllowedClasses(dashboardRes.allowedClasses);
      }

      let fetchedRows = dailyRes?.rows || [];
      if (onlyNotScanned) {
        fetchedRows = fetchedRows.filter(
          (r) =>
            r.currentStatus === "not_yet" ||
            r.status === "belum absen" ||
            !r.waktu_scan
        );
      }

      setRows(fetchedRows);
      setPagination(dailyRes?.pagination || null);
    } catch (err) {
      console.error("Gagal memuat rekap piket:", err);
      setError(err?.message || "Gagal memuat rekap kehadiran piket.");
    } finally {
      setLoading(false);
    }
  }, [date, className, page, onlyNotScanned]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset ke halaman 1 setiap kali filter utama berubah
  useEffect(() => {
    setPage(1);
  }, [date, className]);

  const handleExport = () => {
    setExporting(true);
    try {
      picketTeacherService.exportToCsv({
        date,
        className,
        rows,
      });
    } catch (err) {
      setError(err?.message || "Gagal mengekspor data ke Excel/CSV.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageContainer
      title={title}
      description={
        onlyNotScanned
          ? "Pantau siswa yang belum melakukan scan absensi QR hari ini."
          : "Rekap data kehadiran siswa seluruh kelas. Guru Piket memiliki hak akses pantau."
      }
    >
      {loading && rows.length === 0 && (
        <Loading label="Memuat rekap kehadiran harian..." />
      )}

      {!loading && error && rows.length === 0 && (
        <EmptyState
          title="Gagal memuat data"
          description={error}
          action={<Button onClick={loadData}>Coba Lagi</Button>}
        />
      )}

      {(!error || rows.length > 0) && (
        <DailyAttendanceManager
          title={title}
          subtitle="Guru Piket hanya dapat memantau data kehadiran. Perubahan status dilakukan oleh Guru Kelas."
          rows={rows}
          date={date}
          setDate={setDate}
          classes={allowedClasses}
          className={className}
          setClassName={setClassName}
          canEdit={false}
          onExport={handleExport}
          exporting={exporting}
          currentUserName={user?.name}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </PageContainer>
  );
}
