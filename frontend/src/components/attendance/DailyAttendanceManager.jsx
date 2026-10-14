import { useCallback, useMemo, useState } from "react";
import { Download, Search, Save, X, History, ChevronLeft, ChevronRight } from "lucide-react";
import Card, { CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import AttendanceStats from "./AttendanceStats";
import AttendanceStatus from "./AttendanceStatus";
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABEL,
} from "../../utils/constants";

const selectClass =
  "h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

const EDITABLE = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.EXCUSED,
  ATTENDANCE_STATUS.SICK,
  ATTENDANCE_STATUS.NOT_YET,
];

export default function DailyAttendanceManager({
  title = "Rekap Kehadiran",
  subtitle,
  rows = [],
  date,
  setDate,
  classes = [],
  className = "",
  setClassName,
  canEdit = false,
  onUpdate,
  onExport,
  exporting = false,
  currentUserName,
  pagination = null,
  page = 1,
  onPageChange,
  loading = false,
  summary = null,
  activeStatus: controlledActiveStatus,
  onStatusChange,
  search: controlledSearch,
  onSearchChange,
  showStats = true,
}) {
  const [internalActiveStatus, setInternalActiveStatus] = useState("total");
  const activeStatus =
    controlledActiveStatus !== undefined
      ? controlledActiveStatus
      : internalActiveStatus;

  const handleStatusClick = (newStatus) => {
    if (controlledActiveStatus === undefined) {
      setInternalActiveStatus(newStatus);
    }
    onStatusChange?.(newStatus);
  };

  const [internalSearch, setInternalSearch] = useState("");
  const search =
    controlledSearch !== undefined ? controlledSearch : internalSearch;

  const handleSearchChange = (val) => {
    if (controlledSearch === undefined) {
      setInternalSearch(val);
    }
    onSearchChange?.(val);
  };

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    status: "",
    note: "",
  });

  const filtered = useMemo(() => {
    // Jika data sudah dipaginasi dan difilter oleh server melalui onSearchChange/onStatusChange
    if (pagination && (onSearchChange || onStatusChange)) {
      return rows;
    }

    return rows.filter((r) => {
      const statusOk =
        activeStatus === "total" || r.currentStatus === activeStatus;

      const q = search.trim().toLowerCase();
      const name = (r.student?.name || r.nama_siswa || "").toLowerCase();
      const nis = (r.student?.nis || r.nis || "").toLowerCase();
      const searchOk = !q || name.includes(q) || nis.includes(q);

      const rowClass = (r.student?.className || r.nama_kelas || "").trim();
      const classOk = !className || rowClass === className.trim();

      return statusOk && searchOk && classOk;
    });
  }, [
    rows,
    activeStatus,
    search,
    className,
    pagination,
    onSearchChange,
    onStatusChange,
  ]);

  // Rows setelah filter kelas (untuk stat count agar sinkron dgn filter kelas jika client-side)
  const classFilteredRows = useMemo(() => {
    if (!className) return rows;
    return rows.filter((r) => {
      const rowClass = (r.student?.className || r.nama_kelas || "").trim();
      return rowClass === className.trim();
    });
  }, [rows, className]);

  const count = useCallback(
    (status) =>
      classFilteredRows.filter((r) => r.currentStatus === status).length,
    [classFilteredRows],
  );

  const stats = useMemo(() => {
    if (summary) {
      return [
        {
          key: "total",
          label: "Total Siswa",
          value: summary.total ?? 0,
        },
        {
          key: "present",
          label: "Hadir",
          value: summary.hadir ?? 0,
        },
        {
          key: "absent",
          label: "Tidak Hadir",
          value: summary.tanpaKeterangan ?? 0,
        },
        {
          key: "late",
          label: "Terlambat",
          value: summary.terlambat ?? 0,
        },
        {
          key: "excused",
          label: "Izin",
          value: summary.izin ?? 0,
        },
        {
          key: "sick",
          label: "Sakit",
          value: summary.sakit ?? 0,
        },
        {
          key: "not_yet",
          label: "Belum Absen",
          value: summary.belumAbsen ?? 0,
        },
      ];
    }

    return [
      {
        key: "total",
        label: "Total Siswa",
        value: classFilteredRows.length,
      },
      {
        key: "present",
        label: "Hadir",
        value: count(ATTENDANCE_STATUS.PRESENT),
      },
      {
        key: "absent",
        label: "Tidak Hadir",
        value: count(ATTENDANCE_STATUS.ABSENT),
      },
      {
        key: "late",
        label: "Terlambat",
        value: count(ATTENDANCE_STATUS.LATE),
      },
      {
        key: "excused",
        label: "Izin",
        value: count(ATTENDANCE_STATUS.EXCUSED),
      },
      {
        key: "sick",
        label: "Sakit",
        value: count(ATTENDANCE_STATUS.SICK),
      },
      {
        key: "not_yet",
        label: "Belum Absen",
        value: count(ATTENDANCE_STATUS.NOT_YET),
      },
    ];
  }, [summary, classFilteredRows, count]);

  function startEdit(row) {
    setEditingId(row.id);

    setDraft({
      status: row.currentStatus,
      note: row.note || "",
    });
  }

  async function save(row) {
    await onUpdate?.(row.id, {
      status: draft.status,
      note: draft.note,
      changedBy: currentUserName,
    });

    setEditingId(null);
  }

  return (
    <div className="space-y-5">
      {/* Filter */}
      <Card>
        <CardHeader
          title={title}
          subtitle={subtitle}
          action={
            <Button
              variant="secondary"
              icon={Download}
              isLoading={exporting}
              onClick={onExport}
            >
              Download Excel
            </Button>
          }
        />

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Tanggal"
            type="date"
            value={date}
            onChange={(e) => setDate?.(e.target.value)}
          />

          {classes.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Kelas
              </label>

              <select
                className={`${selectClass} w-full`}
                value={className}
                onChange={(e) => setClassName?.(e.target.value)}
              >
                {classes.length > 1 && <option value="">Semua kelas</option>}

                {classes.map((classItem) => (
                  <option key={classItem} value={classItem}>
                    {classItem}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Cari siswa"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Nama Siswa"
            startAdornment={<Search className="h-4 w-4" />}
          />
        </div>
      </Card>

      {/* Statistik */}
      {showStats && (
        <AttendanceStats
          items={stats}
          onItemClick={handleStatusClick}
          activeKey={activeStatus}
        />
      )}

      {/* Tabel */}
      <Card padding="p-0">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Daftar{" "}
            {activeStatus === "total"
              ? "Semua Siswa"
              : ATTENDANCE_STATUS_LABEL[activeStatus]}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {filtered.length} siswa ditampilkan
            {pagination
              ? ` (halaman ${pagination.page} dari ${pagination.totalPages}, total ${pagination.totalItems} siswa)`
              : "."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">Nama</th>

                <th className="px-4 py-3">Kelas</th>

                <th className="px-4 py-3">Jam Scan</th>

                {/* Hanya satu kolom Status */}
                <th className="px-4 py-3">Status</th>

                <th className="px-4 py-3">Keterangan</th>

                {canEdit && <th className="px-4 py-3">Aksi</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map((row) => {
                const editing = editingId === row.id;

                return (
                  <tr
                    key={row.id}
                    className="bg-white align-top dark:bg-slate-900"
                  >
                    {/* Nama */}
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {row.student?.name || row.nama_siswa}
                      {row.student?.nis && (
                        <div className="text-xs font-normal text-slate-400">
                          NIS: {row.student.nis}
                        </div>
                      )}

                      {row.changedBy && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-normal text-slate-400">
                          <History className="h-3 w-3" aria-hidden="true" />
                          Diubah {row.changedBy}
                        </div>
                      )}
                    </td>

                    {/* Kelas */}
                    <td className="px-4 py-3">{row.student?.className || row.nama_kelas}</td>

                    {/* Jam Scan */}
                    <td className="px-4 py-3 font-mono">
                      {row.scanTimeLabel || "-"}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      {editing ? (
                        <select
                          className={selectClass}
                          value={draft.status}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              status: e.target.value,
                            }))
                          }
                        >
                          {EDITABLE.map((status) => (
                            <option key={status} value={status}>
                              {ATTENDANCE_STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <AttendanceStatus status={row.currentStatus} />
                      )}
                    </td>

                    {/* Keterangan */}
                    <td className="px-4 py-3">
                      {editing ? (
                        <input
                          className="h-10 w-52 rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
                          value={draft.note}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              note: e.target.value,
                            }))
                          }
                          placeholder="Alasan/keterangan"
                        />
                      ) : (
                        <span className="text-slate-600 dark:text-slate-300">
                          {row.note || "-"}
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    {canEdit && (
                      <td className="px-4 py-3">
                        {editing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              icon={Save}
                              onClick={() => save(row)}
                            >
                              Simpan
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              icon={X}
                              onClick={() => setEditingId(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => startEdit(row)}
                          >
                            Ubah
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={canEdit ? 6 : 5}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Tidak ada siswa yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Halaman{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {pagination.page}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-1">
              <button
                id="pagination-prev"
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => onPageChange?.(page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <button
                id="pagination-next"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => onPageChange?.(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
