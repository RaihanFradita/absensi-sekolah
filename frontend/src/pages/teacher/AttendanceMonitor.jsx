import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Pencil,
  Check,
  X,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  HeartPulse,
  FileText,
  AlertCircle,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import useAttendance from "../../hooks/useAttendance";
import attendanceService from "../../services/attendanceService";
import { teacherServices } from "../../services/teacher/teacherService";

const STATUS_OPTIONS = [
  { value: "hadir", label: "Hadir" },
  { value: "terlambat", label: "Terlambat" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
  { value: "tanpa keterangan", label: "Tanpa Keterangan" },
];

const STATUS_STYLE = {
  hadir:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800",
  terlambat:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800",
  sakit:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800",
  izin:
    "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800",
  "tanpa keterangan":
    "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800",
  "belum absen":
    "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

const normalizeStatus = (s) => {
  if (!s) return "belum absen";
  const lower = String(s).toLowerCase().trim();
  if (lower === "present") return "hadir";
  if (lower === "late") return "terlambat";
  if (lower === "sick") return "sakit";
  if (lower === "permission") return "izin";
  if (lower === "absent" || lower === "alpha" || lower === "alpa")
    return "tanpa keterangan";
  return lower;
};

const getStatusLabel = (status) => {
  const opt = STATUS_OPTIONS.find((o) => o.value === status);
  if (opt) return opt.label;
  if (status === "belum absen") return "Belum Absen";
  return status || "-";
};

const formatTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AttendanceMonitor() {
  // daftar kelas untuk filter dari API
  const fetchClasses = useCallback(() => teacherServices.getAllClass(), []);
  const {
    data: classes,
    isLoading: isClassesLoading,
    error: classesError,
  } = useAttendance(fetchClasses);

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // state edit status
  const [editingId, setEditingId] = useState(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const classList = Array.isArray(classes) ? classes : classes?.data || [];

  // pilih kelas pertama otomatis saat daftar kelas berhasil dimuat
  useEffect(() => {
    if (!classId && classList.length > 0) {
      setClassId(String(classList[0].id || classList[0].id_kelas));
    }
  }, [classList, classId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadAttendance = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await attendanceService.getDailyByClass(
        classId,
        selectedDate,
      );
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.data)
            ? result.data.data
            : [];

      setRows(
        list.map((r) => ({
          id: r.id_siswa ?? r.id_absensi ?? `${r.nis}-${r.nama_siswa}`,
          studentId: r.id_siswa,
          attendanceId: r.id_absensi || null,
          name: r.nama_siswa || "-",
          nis: r.nis || "-",
          className: r.nama_kelas || "-",
          time: r.waktu_scan || null,
          status: normalizeStatus(r.status),
          description: r.keterangan || "-",
        })),
      );
    } catch (err) {
      setError(err?.message || "Gagal memuat data kehadiran.");
    } finally {
      setIsLoading(false);
    }
  }, [classId, selectedDate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const startEdit = (row) => {
    setEditingId(row.id);
    const isValidOption = STATUS_OPTIONS.some((o) => o.value === row.status);
    setDraftStatus(isValidOption ? row.status : "hadir");
    setSaveError("");
    setSuccessMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftStatus("");
    setSaveError("");
  };

  const saveEdit = async (row) => {
    if (draftStatus === row.status) return cancelEdit();
    setIsSaving(true);
    setSaveError("");
    setSuccessMessage("");
    try {
      const payload = {
        id_siswa: row.studentId,
        id_kelas: Number(classId),
        tanggal: selectedDate,
        status: draftStatus,
      };

      const response = await attendanceService.manualAttendance(payload);

      if (response && response.success === false) {
        throw new Error(response.message || "Gagal mengubah status kehadiran.");
      }

      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: draftStatus } : r)),
      );
      setSuccessMessage(
        response?.message || `Status absensi ${row.name} berhasil diperbarui.`,
      );
      cancelEdit();

      // Sinkronkan data absensi terbaru dari database
      await loadAttendance();
    } catch (err) {
      setSaveError(err?.message || "Gagal mengubah status absensi.");
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    total: rows.length,
    hadir: rows.filter((r) => r.status === "hadir").length,
    terlambat: rows.filter((r) => r.status === "terlambat").length,
    sakit: rows.filter((r) => r.status === "sakit").length,
    izin: rows.filter((r) => r.status === "izin").length,
    tanpaKeterangan: rows.filter((r) => r.status === "tanpa keterangan").length,
    belumAbsen: rows.filter((r) => r.status === "belum absen").length,
  };

  return (
    <PageContainer
      title="Data Kehadiran Siswa"
      description="Lihat data absensi siswa harian per kelas dan ubah status bila diperlukan"
    >
      <div className="space-y-6">
        {/* Filter bar: Tanggal & Kelas */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tanggal Terpilih
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  "id-ID",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="date-filter"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Tanggal:
              </label>
              <input
                type="date"
                id="date-filter"
                value={selectedDate}
                onChange={(e) => {
                  cancelEdit();
                  setSelectedDate(e.target.value);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="class-filter"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Kelas:
              </label>
              <select
                id="class-filter"
                value={classId}
                disabled={isClassesLoading || classList.length === 0}
                onChange={(e) => {
                  cancelEdit();
                  setClassId(e.target.value);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isClassesLoading ? (
                  <option value="">Memuat kelas...</option>
                ) : classList.length === 0 ? (
                  <option value="">Tidak ada kelas</option>
                ) : (
                  classList.map((kelas) => {
                    const id = kelas.id || kelas.id_kelas;
                    return (
                      <option key={id} value={id}>
                        {kelas.tingkat ? `${kelas.tingkat} ` : ""}
                        {kelas.nama_kelas}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={loadAttendance}
              isLoading={isLoading}
            >
              Muat Ulang
            </Button>
          </div>
        </div>

        {/* Ringkasan status kehadiran */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Users className="h-3.5 w-3.5" /> Total
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.total}
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Hadir
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {stats.hadir}
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" /> Terlambat
            </div>
            <div className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-400">
              {stats.terlambat}
            </div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
              <HeartPulse className="h-3.5 w-3.5" /> Sakit
            </div>
            <div className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-400">
              {stats.sakit}
            </div>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 shadow-sm dark:border-purple-900/50 dark:bg-purple-950/20">
            <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-400">
              <FileText className="h-3.5 w-3.5" /> Izin
            </div>
            <div className="mt-1 text-xl font-bold text-purple-700 dark:text-purple-400">
              {stats.izin}
            </div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" /> Tanpa Ket.
            </div>
            <div className="mt-1 text-xl font-bold text-rose-700 dark:text-rose-400">
              {stats.tanpaKeterangan}
            </div>
          </div>
        </div>

        {/* Tabel Data Absensi Siswa */}
        <Card>
          <CardHeader
            title="Daftar Kehadiran Siswa"
            subtitle={`${rows.length} siswa terdaftar di kelas`}
          />
          {saveError && (
            <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isLoading ? (
            <Loading label="Memuat data kehadiran..." />
          ) : error ? (
            <EmptyState
              title="Gagal memuat data"
              description={error}
              action={
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  onClick={loadAttendance}
                >
                  Coba Lagi
                </Button>
              }
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Belum ada data"
              description="Tidak ada data siswa untuk kelas dan tanggal yang dipilih."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama Siswa</th>
                    <th className="px-4 py-3 font-medium">NIS</th>
                    <th className="px-4 py-3 font-medium">Kelas</th>
                    <th className="px-4 py-3 font-medium">Waktu Absen</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row) => {
                    const isEditing = editingId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {row.nis}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {row.className}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {formatTime(row.time)}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={draftStatus}
                              onChange={(e) => setDraftStatus(e.target.value)}
                              disabled={isSaving}
                              className="rounded-md border border-brand-500 bg-white px-2.5 py-1 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-brand-500 dark:bg-slate-900 dark:text-slate-100"
                            >
                              {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                STATUS_STYLE[row.status] ||
                                "border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {getStatusLabel(row.status)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  icon={Check}
                                  onClick={() => saveEdit(row)}
                                  disabled={isSaving}
                                  isLoading={isSaving}
                                >
                                  Simpan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  icon={X}
                                  onClick={cancelEdit}
                                  disabled={isSaving}
                                >
                                  Batal
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={Pencil}
                                onClick={() => startEdit(row)}
                              >
                                Edit Status
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
