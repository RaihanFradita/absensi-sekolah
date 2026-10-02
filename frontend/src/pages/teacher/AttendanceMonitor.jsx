import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Pencil, Check, X, CalendarDays } from "lucide-react";
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
];

const STATUS_STYLE = {
  hadir:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  terlambat: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const normalizeStatus = (s) =>
  s === "late" ? "terlambat" : s === "present" ? "hadir" : s;

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

export default function AttendanceMonitor() {
  // daftar kelas untuk filter dari API
  const fetchClasses = useCallback(() => teacherServices.getAllClass(), []);
  const {
    data: classes,
    isLoading: isClassesLoading,
    error: classesError,
  } = useAttendance(fetchClasses);

  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // state edit status
  const [editingId, setEditingId] = useState(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const classList = Array.isArray(classes) ? classes : classes?.data || [];

  // pilih kelas pertama otomatis saat daftar kelas berhasil dimuat
  useEffect(() => {
    if (!classId && classList.length > 0) {
      setClassId(String(classList[0].id || classList[0].id_kelas));
    }
  }, [classList, classId]);

  const loadAttendance = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await attendanceService.getDailyByClass(classId);
      const list = Array.isArray(result)
        ? result
        : result?.rows || result?.data || result?.events || [];
      setRows(
        list.map((r) => ({
          id: r.id || r.id_kehadiran,
          name: r.nama_siswa || r.student?.name || "-",
          nis: r.nis || r.student?.nis || "-",
          className: r.nama_kelas || r.student?.className || "-",
          time: r.waktu_scan || r.time || null,
          status: normalizeStatus(r.status),
        })),
      );
    } catch (err) {
      setError(err?.message || "Gagal memuat data kehadiran.");
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const startEdit = (row) => {
    setEditingId(row.id);
    setDraftStatus(row.status);
    setSaveError("");
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
    try {
      await attendanceService.updateStatus(row.id, draftStatus);
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: draftStatus } : r)),
      );
      cancelEdit();
    } catch (err) {
      setSaveError(err?.message || "Gagal mengubah status.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="Data Kehadiran Siswa"
      description="Lihat kehadiran siswa per kelas dan ubah status bila diperlukan"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <CalendarDays className="h-4 w-4" />
          <span>
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="class-filter" className="text-slate-500">
              Kelas
            </label>
            <select
              id="class-filter"
              value={classId}
              disabled={isClassesLoading || classList.length === 0}
              onChange={(e) => {
                cancelEdit();
                setClassId(e.target.value);
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
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
                      {kelas.tingkat}
                      {kelas.nama_kelas}
                    </option>
                  );
                })
              )}
            </select>
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={loadAttendance}
            >
              Muat Ulang
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader
            title="Daftar Kehadiran"
            subtitle={`${rows.length} siswa tercatat`}
          />
          {saveError && (
            <p className="px-4 pb-2 text-sm text-red-600">{saveError}</p>
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
              description="Belum ada siswa yang tercatat hadir di kelas ini hari ini."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama Siswa</th>
                    <th className="px-4 py-3 font-medium">NIS</th>
                    <th className="px-4 py-3 font-medium">Kelas</th>
                    <th className="px-4 py-3 font-medium">Waktu Scan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row) => {
                    const isEditing = editingId === row.id;
                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3">{row.name}</td>
                        <td className="px-4 py-3">{row.nis}</td>
                        <td className="px-4 py-3">{row.className}</td>
                        <td className="px-4 py-3">{formatTime(row.time)}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={draftStatus}
                              onChange={(e) => setDraftStatus(e.target.value)}
                              disabled={isSaving}
                              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                            >
                              {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[row.status] || "bg-slate-100 text-slate-600"}`}
                            >
                              {STATUS_OPTIONS.find(
                                (o) => o.value === row.status,
                              )?.label ||
                                row.status ||
                                "-"}
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
                                Edit
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
