import { useCallback, useState } from "react";
import { RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import useAttendance from "../../hooks/useAttendance";
import attendanceService from "../../services/attendanceService";
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABEL,
  DEFAULT_PAGE_SIZE,
} from "../../utils/constants";

export default function AttendanceHistory() {
  const [filters, setFilters] = useState({ date: "", status: "" });
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(
    () =>
      attendanceService.getAttendanceHistory({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        date: filters.date || undefined,
        status: filters.status || undefined,
      }),
    [page, filters.date, filters.status],
  );
  const { data, isLoading, error, refetch } = useAttendance(fetchHistory);

  function updateFilter(key, value) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const totalPages = data
    ? Math.max(1, Math.ceil((data.total || 0) / DEFAULT_PAGE_SIZE))
    : 1;
  const hasActiveFilters = filters.date || filters.status;

  return (
    <PageContainer
      title="Riwayat Kehadiran"
      description="Satu catatan untuk setiap hari sekolah"
    >
      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4" aria-hidden="true" /> Filter Riwayat
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Tanggal"
            type="date"
            value={filters.date}
            onChange={(e) => updateFilter("date", e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>
            <select
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">Semua status</option>
              {Object.values(ATTENDANCE_STATUS)
                .filter((s) => s !== ATTENDANCE_STATUS.NOT_YET)
                .map((status) => (
                  <option key={status} value={status}>
                    {ATTENDANCE_STATUS_LABEL[status]}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </Card>

      {isLoading && <Loading label="Memuat riwayat kehadiran..." />}
      {!isLoading && error && (
        <EmptyState
          title="Gagal memuat riwayat"
          description={error}
          action={
            <Button variant="secondary" icon={RefreshCw} onClick={refetch}>
              Coba Lagi
            </Button>
          }
        />
      )}
      {!isLoading &&
        !error &&
        data &&
        (data.rows?.length > 0 ? (
          <>
            <AttendanceTable rows={data.rows} />
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Halaman {page} dari {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Selanjutnya <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Belum ada riwayat kehadiran"
            description={
              hasActiveFilters
                ? "Tidak ada data yang cocok dengan filter."
                : "Riwayat akan muncul setelah kamu melakukan absensi harian."
            }
          />
        ))}
    </PageContainer>
  );
}
