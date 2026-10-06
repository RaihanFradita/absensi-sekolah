<<<<<<< HEAD
import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Clock,
  FileText,
  HeartPulse,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  FileBarChart,
  RefreshCw,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import AttendanceStatus from "../../components/attendance/AttendanceStatus";
import useAuth from "../../hooks/useAuth";
import picketTeacherService from "../../services/picketTeacherService";

const getTodayWIB = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export default function DutyDashboard({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState(getTodayWIB());
  const [className, setClassName] = useState("");
  const [allowedClasses, setAllowedClasses] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
    belumAbsen: 0,
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
=======
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import useAuth from "../../hooks/useAuth";
import attendanceService from "../../services/attendanceService";
import studentService from "../../services/studentService";

const localToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );

const STATUS = {
  hadir: {
    label: "Hadir",
    tone: "green",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  terlambat: {
    label: "Terlambat",
    tone: "amber",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  izin: {
    label: "Izin",
    tone: "blue",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  sakit: {
    label: "Sakit",
    tone: "blue",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  "tanpa keterangan": {
    label: "Tanpa Keterangan",
    tone: "red",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  "belum absen": {
    label: "Belum Absen",
    tone: "red",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
};

const FILTER_STATUSES = [
  { value: "all", label: "Semua Status" },
  { value: "hadir", label: "Hadir" },
  { value: "terlambat", label: "Terlambat" },
  { value: "izin", label: "Izin" },
  { value: "belum absen", label: "Belum Absen" },
];

function statusKey(value) {
  return String(value || "belum absen").toLowerCase();
}

function formatTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function StatCard({ icon: Icon, label, value, tone }) {
  const iconTone = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    red: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  };

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconTone[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

async function getActiveStudents() {
  const firstPage = await studentService.getStudents({ page: 1, limit: 100 });
  const allStudents = [...(firstPage?.data || [])];
  const totalPages = Number(firstPage?.pagination?.totalPages || 1);

  for (let page = 2; page <= totalPages; page += 1) {
    const result = await studentService.getStudents({ page, limit: 100 });
    allStudents.push(...(result?.data || []));
  }

  return allStudents.filter((student) => Number(student.status_aktif ?? 1) === 1);
}

function matchesStatus(row, filter) {
  if (filter === "all") return true;
  if (filter === "izin") return row.status === "izin" || row.status === "sakit";
  return row.status === filter;
}

export default function DutyDashboard() {
  const { user } = useAuth();
  const [date] = useState(localToday);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
>>>>>>> f19383f9d1053e139a280b772b4378a170a63153

  // Table filter & pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
<<<<<<< HEAD

    try {
      const [dashboardRes, dailyRes] = await Promise.all([
        picketTeacherService.getDashboard({ date, className }),
        picketTeacherService.getDaily({ date, className }),
      ]);

      if (dashboardRes) {
        setAllowedClasses(dashboardRes.allowedClasses || []);
        if (dashboardRes.summary) {
          setSummary(dashboardRes.summary);
        }
      }

      if (dailyRes && Array.isArray(dailyRes.rows)) {
        setRows(dailyRes.rows);
      }
    } catch (err) {
      console.error("Gagal memuat data piket:", err);
      setError(err?.message || "Gagal memuat data dashboard piket.");
=======
    try {
      const activeStudents = await getActiveStudents();
      const uniqueClasses = Array.from(
        new Map(
          activeStudents
            .filter((student) => student.id_kelas != null)
            .map((student) => [
              String(student.id_kelas),
              {
                id: String(student.id_kelas),
                name: `${student.tingkat || ""} ${student.nama_kelas || ""}`.trim(),
              },
            ]),
        ).values(),
      ).sort((a, b) => a.name.localeCompare(b.name, "id"));

      const activeIds = new Set(activeStudents.map((student) => String(student.id_siswa)));
      const attendanceByStudent = new Map();

      await Promise.all(
        uniqueClasses.map(async (classItem) => {
          const result = await attendanceService.getDailyByClass(classItem.id, date);
          const attendanceRows = Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result)
              ? result
              : [];
          attendanceRows.forEach((row) => {
            const id = String(row.id_siswa);
            if (activeIds.has(id)) attendanceByStudent.set(id, row);
          });
        }),
      );

      const mappedRows = activeStudents.map((student) => {
        const attendance = attendanceByStudent.get(String(student.id_siswa));
        return {
          id: student.id_siswa,
          name: student.nama_siswa || "—",
          classId: String(student.id_kelas),
          className: `${student.tingkat || ""} ${student.nama_kelas || ""}`.trim() || "—",
          status: statusKey(attendance?.status),
          scannedAt: attendance?.waktu_scan || null,
        };
      });

      setStudents(activeStudents);
      setClasses(uniqueClasses);
      setRows(mappedRows);
      setLastUpdated(new Date());
    } catch (loadError) {
      setError(loadError?.message || "Gagal memuat data absensi.");
>>>>>>> f19383f9d1053e139a280b772b4378a170a63153
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
<<<<<<< HEAD
    loadData();
  }, [loadData]);

  // Date label formatting
  const formattedDate = useMemo(() => {
    try {
      return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }, [date]);

  // Attendance rate calculations
  const total = summary.total || 0;
  const hadirDanTerlambat = (summary.hadir || 0) + (summary.terlambat || 0);
  const persentase =
    total > 0 ? ((hadirDanTerlambat / total) * 100).toFixed(1) : "0.0";

  // Filtered rows for the quick overview table
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.student?.name?.toLowerCase().includes(q) ||
        r.nama_siswa?.toLowerCase().includes(q) ||
        r.student?.nis?.toLowerCase().includes(q) ||
        r.nis?.toLowerCase().includes(q);

      const s = (r.status || "").toLowerCase().trim();
      const c = (r.currentStatus || "").toLowerCase().trim();
      const matchStatus =
        !statusFilter ||
        s === statusFilter.toLowerCase() ||
        c === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, page, itemsPerPage]);

  const handleExport = () => {
    try {
      setExporting(true);
      picketTeacherService.exportToCsv({
        date,
        className,
        rows: filteredRows.length > 0 ? filteredRows : rows,
      });
    } catch (e) {
      alert("Gagal mengekspor data: " + (e?.message || "Terjadi kesalahan"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageContainer
      title={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title || `Halo, ${user?.name || "Guru Piket"} 👋`}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Dashboard Piket — Pantau kehadiran seluruh siswa sekolah (
              {formattedDate})
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                setPage(1);
              }}
              aria-label="Filter Kelas"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="">Semua Kelas</option>
              {allowedClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              className="w-auto"
            />

            <Button
              variant="secondary"
              size="md"
              icon={RefreshCw}
              onClick={loadData}
              isLoading={loading}
              title="Perbarui Data"
            >
              Segarkan
            </Button>
          </div>
        </div>
      }
    >
      {loading && !summary.total && rows.length === 0 && (
        <Loading label="Memuat data dashboard piket..." />
      )}

      {!loading && error && (
        <EmptyState
          title="Gagal memuat data piket"
          description={error}
          action={<Button onClick={loadData}>Coba Lagi</Button>}
        />
      )}

      {(!error || rows.length > 0) && (
        <div className="space-y-6">
          {/* STATISTIK KEHADIRAN (7 KARTU) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {/* Total Siswa */}
            <Card
              padding="p-4"
              className="flex flex-col items-center justify-center text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {summary.total}
              </p>
              <p className="text-xs font-medium text-slate-500">Total Siswa</p>
            </Card>

            {/* Hadir */}
            <Card
              padding="p-4"
              className="flex flex-col items-center justify-center text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.hadir}
              </p>
              <p className="text-xs font-medium text-slate-500">Hadir Tepat</p>
            </Card>

            {/* Terlambat */}
            <Card
              padding="p-4"
              className="flex flex-col items-center justify-center text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {summary.terlambat}
              </p>
              <p className="text-xs font-medium text-slate-500">Terlambat</p>
            </Card>

            {/* Izin */}
            <Card
              padding="p-4"
              className="flex flex-col items-center justify-center text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.izin}
              </p>
              <p className="text-xs font-medium text-slate-500">Izin</p>
            </Card>

            {/* Sakit */}
            <Card
              padding="p-4"
              className="flex flex-col items-center justify-center text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <HeartPulse className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.sakit}
              </p>
              <p className="text-xs font-medium text-slate-500">Sakit</p>
            </Card>

            {/* Tanpa Keterangan */}
            <Card
              padding="p-4"
              className="flex flex-col items-center justify-center text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <XCircle className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {summary.tanpaKeterangan}
              </p>
              <p className="text-xs font-medium text-slate-500">Tanpa Ket.</p>
            </Card>

            {/* Belum Absen */}
            <Card
              padding="p-4"
              className="flex flex-col items-center justify-center text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {summary.belumAbsen}
              </p>
              <p className="text-xs font-medium text-slate-500">Belum Absen</p>
            </Card>
          </div>

          {/* HIGHLIGHTS & QUICK ACTIONS */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Progress Bar Persentase Kehadiran */}
            <Card className="lg:col-span-8">
              <CardHeader
                title="Tingkat Kehadiran Sekolah"
                subtitle={`${formattedDate} — ${className ? `Kelas ${className}` : "Seluruh Kelas"}`}
              />
              <div className="mt-2 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {persentase}%
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      siswa hadir di sekolah
                    </span>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {hadirDanTerlambat}
                    </span>{" "}
                    dari {total} siswa
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, Number(persentase)))}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Hadir: {summary.hadir}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Terlambat: {summary.terlambat}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                    Belum Absen: {summary.belumAbsen}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Tanpa Ket: {summary.tanpaKeterangan}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card className="flex flex-col justify-between lg:col-span-4">
              <div>
                <CardHeader
                  title="Aksi Cepat Piket"
                  subtitle="Akses menu rekap harian & ekspor berkas"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gunakan halaman Rekap Harian untuk melihat data absensi lengkap
                  dengan filter mendalam per status dan cetak laporan.
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <Button
                  fullWidth
                  variant="primary"
                  icon={FileBarChart}
                  onClick={() => navigate("/duty/recap")}
                >
                  Buka Rekap Harian Lengkap
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  icon={Download}
                  isLoading={exporting}
                  onClick={handleExport}
                >
                  Download Excel / CSV
                </Button>
=======
    load();
  }, [load]);

  const stats = useMemo(() => ({
    total: students.length,
    present: rows.filter((row) => row.status === "hadir").length,
    late: rows.filter((row) => row.status === "terlambat").length,
    excused: rows.filter((row) => row.status === "izin" || row.status === "sakit").length,
    missing: rows.filter((row) => row.status === "belum absen").length,
  }), [students.length, rows]);

  const recorded = stats.present + stats.late + stats.excused + rows.filter((row) => row.status === "tanpa keterangan").length;
  const attendancePercent = stats.total ? Math.round((recorded / stats.total) * 100) : 0;

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id");
    return rows.filter((row) => {
      const matchName = !keyword || row.name.toLocaleLowerCase("id").includes(keyword);
      const matchClass = classFilter === "all" || row.classId === classFilter;
      return matchName && matchClass && matchesStatus(row, statusFilter);
    });
  }, [rows, search, classFilter, statusFilter]);

  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${date}T12:00:00`));
  const greeting = getGreeting();

  return (
    <PageContainer
      title="Dashboard Guru Piket"
      description="Pantau kehadiran siswa hari ini."
      action={
        <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
          Perbarui Data
        </Button>
      }
    >
      <div className="space-y-5">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{greeting}, {user?.name || "Guru Piket"}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Ringkasan kehadiran sekolah</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CalendarDays className="h-4 w-4" />{dateLabel}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
              {lastUpdated ? `Data diperbarui pukul ${formatTime(lastUpdated)}` : "Data belum diperbarui"}
            </p>
          </div>
        </Card>

        {loading && <Loading label="Memuat dashboard kehadiran..." />}

        {!loading && error && (
          <EmptyState
            title="Data kehadiran belum dapat dimuat"
            description={error}
            action={<Button onClick={load}>Coba Lagi</Button>}
          />
        )}

        {!loading && !error && <>
          <section aria-label="Statistik kehadiran" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard icon={Users} label="Total Siswa" value={stats.total} tone="blue" />
            <StatCard icon={CheckCircle2} label="Hadir" value={stats.present} tone="green" />
            <StatCard icon={Clock3} label="Terlambat" value={stats.late} tone="amber" />
            <StatCard icon={CheckCircle2} label="Izin" value={stats.excused} tone="blue" />
            <StatCard icon={AlertCircle} label="Belum Absen" value={stats.missing} tone="red" />
          </section>

          {stats.missing > 0 && (
            <Card>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-200"><strong>{stats.missing} siswa</strong> belum melakukan absensi hari ini.</p>
                </div>
                <Button variant="secondary" onClick={() => setStatusFilter("belum absen")}>Lihat Siswa</Button>
              </div>
            </Card>
          )}

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader title="Distribusi Kehadiran" subtitle="Ringkasan status siswa hari ini" />
              <div className="mt-5 space-y-4">
                {[
                  { label: "Hadir", count: stats.present, color: "bg-emerald-500" },
                  { label: "Terlambat", count: stats.late, color: "bg-amber-500" },
                  { label: "Izin", count: stats.excused, color: "bg-blue-500" },
                  { label: "Belum Absen", count: stats.missing, color: "bg-rose-500" },
                ].map((item) => {
                  const percent = stats.total ? (item.count / stats.total) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">{item.label}</span><span className="font-medium text-slate-900 dark:text-white">{item.count}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <CardHeader title="Status Absensi Hari Ini" subtitle="Kemajuan pencatatan kehadiran seluruh siswa" />
              <div className="mt-5">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{recorded} dari {stats.total} siswa</p>
                  <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{attendancePercent}%</p>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={attendancePercent} aria-label="Persentase absensi tercatat">
                  <div className="h-full rounded-full bg-brand-600 transition-all dark:bg-brand-500" style={{ width: `${attendancePercent}%` }} />
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">sudah melakukan absensi · {stats.missing} belum absen</p>
>>>>>>> f19383f9d1053e139a280b772b4378a170a63153
              </div>
            </Card>
          </div>

<<<<<<< HEAD
          {/* TABEL PANTAU KEHADIRAN SISWA */}
          <Card padding="p-0" className="overflow-hidden">
            <div className="border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Daftar Absensi Siswa
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Menampilkan {filteredRows.length} dari {rows.length} siswa
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Cari nama atau NIS siswa..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    startAdornment={<Search className="h-4 w-4 text-slate-400" />}
                    className="w-full sm:w-60"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Filter Status"
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <option value="">Semua Status</option>
                    <option value="hadir">Hadir</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="tanpa keterangan">Tanpa Keterangan</option>
                    <option value="belum absen">Belum Absen</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3">No</th>
                    <th className="px-5 py-3">Nama Siswa</th>
                    <th className="px-5 py-3">Kelas</th>
                    <th className="px-5 py-3">Jam Scan</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-10 text-center text-sm text-slate-500"
                      >
                        Tidak ada siswa yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((r, idx) => (
                      <tr
                        key={r.id || `row-${idx}`}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-3 text-slate-400">
                          {(page - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                          <div>{r.student?.name || r.nama_siswa}</div>
                          {(r.student?.nis || r.nis) && (
                            <div className="text-xs font-normal text-slate-400">
                              NIS: {r.student?.nis || r.nis}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {r.student?.className || r.nama_kelas}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">
                          {r.scanTimeLabel || r.waktu_scan || "-"}
                        </td>
                        <td className="px-5 py-3">
                          <AttendanceStatus status={r.status || r.currentStatus} />
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {r.note || r.keterangan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  Halaman {page} dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    icon={ChevronLeft}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Selanjutnya <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
=======
          <Card padding="p-0">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <CardHeader title="Data Kehadiran Siswa" subtitle={`${filteredRows.length} dari ${rows.length} siswa`} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Input label="Cari nama siswa" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nama siswa" icon={Search} />
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Filter Kelas</span><select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><option value="all">Semua Kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Filter Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{FILTER_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{rows.length ? "Tidak ada siswa yang cocok dengan pencarian atau filter." : "Belum ada data siswa aktif."}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400"><tr><th className="w-16 px-4 py-3">No</th><th className="px-4 py-3">Nama Siswa</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Waktu Absen</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRows.map((row, index) => {
                      const status = STATUS[row.status] || STATUS["belum absen"];
                      return <tr key={row.id} className="text-slate-700 dark:text-slate-200"><td className="px-4 py-3.5 text-slate-500">{index + 1}</td><td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">{row.name}</td><td className="px-4 py-3.5">{row.className}</td><td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}>{status.label}</span></td><td className="px-4 py-3.5">{formatTime(row.scannedAt)}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>}
      </div>
>>>>>>> f19383f9d1053e139a280b772b4378a170a63153
    </PageContainer>
  );
}
