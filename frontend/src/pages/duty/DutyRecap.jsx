import { useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import DailyAttendanceManager from "../../components/attendance/DailyAttendanceManager";
import useAuth from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
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
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [activeStatus, setActiveStatus] = useState(
    onlyNotScanned ? "not_yet" : "total",
  );
  const LIMIT = 20;

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reloadData = () => {
    setLoading(true);
    setError("");
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      try {
        const statusToQuery = onlyNotScanned
          ? "belum absen"
          : activeStatus === "total"
            ? undefined
            : activeStatus;

        const [dashboardRes, dailyRes] = await Promise.all([
          picketTeacherService.getDashboard({ date, className }),
          picketTeacherService.getDaily({
            date,
            className,
            status: statusToQuery,
            search: debouncedSearch,
            page,
            limit: LIMIT,
          }),
        ]);

        if (isCancelled) return;

        if (dashboardRes?.allowedClasses) {
          setAllowedClasses(dashboardRes.allowedClasses);
        }

        if (dashboardRes?.summary) {
          setSummary(dashboardRes.summary);
        }

        setRows(dailyRes?.rows || []);
        setPagination(dailyRes?.pagination || null);
      } catch (err) {
        if (isCancelled) return;
        console.error("Gagal memuat rekap piket:", err);
        setError(err?.message || "Gagal memuat rekap kehadiran piket.");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [
    date,
    className,
    page,
    onlyNotScanned,
    activeStatus,
    debouncedSearch,
    refreshTrigger,
  ]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const statusToQuery = onlyNotScanned
        ? "belum absen"
        : activeStatus === "total"
          ? undefined
          : activeStatus;

      await picketTeacherService.exportDailyCsv({
        date,
        className,
        status: statusToQuery,
        search: debouncedSearch,
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
          action={<Button onClick={reloadData}>Coba Lagi</Button>}
        />
      )}

      {(!error || rows.length > 0) && (
        <DailyAttendanceManager
          title={title}
          subtitle={
            onlyNotScanned
              ? "Menampilkan siswa yang belum melakukan scan absensi QR hari ini."
              : "Guru Piket hanya dapat memantau data kehadiran. Perubahan status dilakukan oleh Guru Kelas."
          }
          rows={rows}
          date={date}
          setDate={(d) => {
            setDate(d);
            setPage(1);
          }}
          classes={allowedClasses}
          className={className}
          setClassName={(c) => {
            setClassName(c);
            setPage(1);
          }}
          canEdit={false}
          onExport={handleExport}
          exporting={exporting}
          currentUserName={user?.name}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          loading={loading}
          summary={summary}
          activeStatus={activeStatus}
          onStatusChange={(st) => {
            setActiveStatus(st);
            setPage(1);
          }}
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          showStats={!onlyNotScanned}
        />
      )}
    </PageContainer>
  );
}
