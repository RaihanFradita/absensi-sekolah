import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  UserX,
  QrCode,
  X,
  Edit2
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import useAuth from "../../hooks/useAuth";
import attendanceService from "../../services/attendanceService";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSession, setActiveSession] = useState(null);

  // Table state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const dashboard = await attendanceService.getTeacherDashboard({ date });
      setData(dashboard);
    } catch (e) {
      console.error("TeacherDashboard:", e);
      setError(e?.message || "Gagal memuat data dashboard guru.");
    } finally {
      setLoading(false);
    }

    try {
      const sessionRes = await attendanceService.getTodayActiveSession();
      if (sessionRes?.success && sessionRes?.data) {
        setActiveSession(sessionRes.data);
      } else {
        setActiveSession(null);
      }
    } catch (e) {
      // It's normal for this to fail (e.g. 404) if there's no active session
      setActiveSession(null);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtering & Pagination
  const students = data?.students ?? [];
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchName = s.nama_siswa.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? s.status === statusFilter : true;
      return matchName && matchStatus;
    });
  }, [students, search, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Mapping nilai UI → nilai ENUM di database
  const STATUS_TO_DB = {
    hadir: "hadir",
    terlambat: "terlambat",
    izin: "izin",
    sakit: "sakit",
    tidak_hadir: "tanpa keterangan",
  };

  const handleUpdateStatus = async () => {
    if (!editingStudent) return;
    setIsUpdating(true);
    try {
      const dbStatus = STATUS_TO_DB[editStatus] ?? editStatus;
      await attendanceService.manualAttendance({
        id_siswa: editingStudent.id_siswa,
        id_kelas: data.class.id_kelas,
        tanggal: date,
        status: dbStatus,
      });
      await load();
      setEditingStudent(null);
    } catch (e) {
      alert(e?.message || "Gagal mengubah status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !data) {
    return (
      <PageContainer title="Dashboard Guru Kelas" description="Memuat informasi kelas...">
        <Loading label="Memuat dashboard..." />
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer title="Dashboard Guru Kelas">
        <EmptyState title="Gagal memuat data dashboard." description={error} action={<Button onClick={load}>Coba Lagi</Button>} />
      </PageContainer>
    );
  }

  if (data && !data.class) {
    return (
      <PageContainer title={`Halo, ${user?.name || data?.teacher?.nama_guru} 👋`} description="Dashboard Guru Kelas">
        <EmptyState title="Tidak ada kelas yang ditugaskan." description="Anda belum ditugaskan sebagai wali kelas untuk kelas manapun." />
      </PageContainer>
    );
  }

  if (!data) return null;

  const { teacher, class: classData, summary } = data;
  const { hadir = 0, terlambat = 0, izin = 0, tidak_hadir = 0, total = 0 } = summary || {};
  const hadirDanTerlambat = hadir + terlambat;
  const persentase = total > 0 ? ((hadirDanTerlambat / total) * 100).toFixed(1) : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "hadir": 
        return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Hadir</span>;
      case "terlambat": 
        return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Terlambat</span>;
      case "izin": 
        return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">Izin</span>;
      case "sakit": 
        return <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">Sakit</span>;
      default: 
        return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Tidak Hadir</span>;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const belumAbsenStudents = students.filter(s => s.status === "tidak_hadir" || !s.status);

  return (
    <PageContainer
      title={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Selamat datang, Pak/Bu {teacher.nama_guru} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Wali Kelas {classData.nama_kelas}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      }
    >
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* KOLOM KIRI (UTAMA) */}
        <div className="space-y-6 xl:col-span-8">
          
          {/* STATISTIK */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card padding="p-4" className="flex flex-col items-center justify-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{hadir}</p>
              <p className="text-sm font-medium text-slate-500">Hadir</p>
            </Card>
            
            <Card padding="p-4" className="flex flex-col items-center justify-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{terlambat}</p>
              <p className="text-sm font-medium text-slate-500">Terlambat</p>
            </Card>
            
            <Card padding="p-4" className="flex flex-col items-center justify-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{izin}</p>
              <p className="text-sm font-medium text-slate-500">Izin</p>
            </Card>
            
            <Card padding="p-4" className="flex flex-col items-center justify-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{tidak_hadir}</p>
              <p className="text-sm font-medium text-slate-500">Tidak Hadir</p>
            </Card>
          </div>

          {/* TABEL KEHADIRAN SISWA */}
          <Card padding="p-0" className="overflow-hidden">
            <div className="border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Daftar Kehadiran Siswa</h2>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Cari nama siswa..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    startAdornment={<Search className="h-4 w-4 text-slate-400" />}
                    className="w-full sm:w-56"
                  />
                  <select
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    <option value="">Semua Status</option>
                    <option value="hadir">Hadir</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="izin">Izin</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                  </select>
                </div>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Belum ada data siswa.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-5 py-3 font-medium">No</th>
                      <th className="px-5 py-3 font-medium">Nama Siswa</th>
                      <th className="px-5 py-3 font-medium">Jam Scan</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-slate-500">Tidak ada siswa yang cocok dengan pencarian.</td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s, idx) => (
                        <tr key={s.id_siswa} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-5 py-3">{(page - 1) * itemsPerPage + idx + 1}</td>
                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{s.nama_siswa}</td>
                          <td className="px-5 py-3">{formatTime(s.waktu_absen)}</td>
                          <td className="px-5 py-3">{getStatusBadge(s.status)}</td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => {
                                setEditingStudent(s);
                                setEditStatus(s.status || "tidak_hadir");
                              }}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span className="font-medium">Ubah Status</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-800">
                <p className="text-sm text-slate-500">
                  Halaman {page} dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} icon={ChevronLeft}>Sebelumnya</Button>
                  <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Selanjutnya <ChevronRight className="ml-1 h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </Card>

        </div>

        {/* KOLOM KANAN (SIDEBAR) */}
        <div className="space-y-6 xl:col-span-4">
          
          {/* INFO KELAS */}
          <Card>
            <CardHeader title="Informasi Kelas" />
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kelas {classData.nama_kelas}</h3>
                <p className="text-sm text-slate-500">Tingkat {classData.tingkat}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">Jumlah Siswa</span>
                <span className="font-semibold text-slate-900 dark:text-white">{total} Siswa</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Wali Kelas</span>
                <span className="font-semibold text-slate-900 dark:text-white">{teacher.nama_guru}</span>
              </div>
            </div>
          </Card>

          {/* PERSENTASE KEHADIRAN */}
          <Card>
            <CardHeader title="Kehadiran Hari Ini" />
            <div className="mt-2">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{persentase}%</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                <strong className="font-semibold text-slate-900 dark:text-slate-200">{hadirDanTerlambat}</strong> dari {total} siswa sudah melakukan absensi.
              </p>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-1000 ease-out"
                  style={{ width: `${persentase}%` }}
                />
              </div>
            </div>
          </Card>

          {/* QR KEHADIRAN */}
          <Card>
            <CardHeader title="Sesi QR Kehadiran" />
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/20">
              <div className="mb-4 rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <QrCode className="h-7 w-7 text-slate-400" />
              </div>
              {activeSession ? (
                <>
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    Sesi QR Aktif
                  </div>
                  <Button fullWidth onClick={() => navigate(`/teacher/sessions/${activeSession.kode_qr}`)}>
                    Lihat QR Code
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-5 text-sm text-slate-500">Belum ada sesi QR yang sedang aktif.</p>
                  <Button fullWidth onClick={() => navigate("/teacher/sessions/create")}>
                    Buka QR Kehadiran
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* SISWA BELUM ABSEN */}
          <Card>
            <CardHeader title="Siswa Belum Absen" />
            <div className="mt-2">
              {belumAbsenStudents.length === 0 ? (
                <div className="flex flex-col items-center p-6 text-center">
                  <div className="mb-3 rounded-full bg-emerald-50 p-2 dark:bg-emerald-900/20">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Hebat!</p>
                  <p className="mt-1 text-sm text-slate-500">Semua siswa sudah melakukan absensi.</p>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      {belumAbsenStudents.length}
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      siswa belum melakukan absensi
                    </p>
                  </div>
                  <ul className="max-h-60 space-y-2 overflow-y-auto pr-2">
                    {belumAbsenStudents.map((s) => (
                      <li key={s.id_siswa} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                          <UserX className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="truncate font-medium">{s.nama_siswa}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Card>
          
        </div>
      </div>

      {/* MODAL UBAH STATUS */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ubah Status Kehadiran</h3>
              <button onClick={() => setEditingStudent(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6 space-y-4 text-sm">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="mb-2 flex justify-between">
                  <span className="text-slate-500">Nama Siswa</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{editingStudent.nama_siswa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Absensi</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{date}</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">Pilih Status Baru</label>
                <div className="grid grid-cols-2 gap-2">
                  {['hadir', 'terlambat', 'izin', 'tidak_hadir'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => setEditStatus(statusOption)}
                      className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors ${
                        editStatus === statusOption 
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' 
                          : 'border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {statusOption === 'hadir' && 'Hadir'}
                      {statusOption === 'terlambat' && 'Terlambat'}
                      {statusOption === 'izin' && 'Izin'}
                      {statusOption === 'tidak_hadir' && 'Tidak Hadir'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setEditingStudent(null)} disabled={isUpdating}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleUpdateStatus} isLoading={isUpdating}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
