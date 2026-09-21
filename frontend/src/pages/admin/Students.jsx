import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  GraduationCap,
  X,
  CheckCircle2,
  XCircle,
  User,
  Hash,
  School,
} from "lucide-react";

import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";
import studentService from "../../services/studentService";

const EMPTY_FORM = {
  id_siswa: null,
  nis: "",
  nama_siswa: "",
  id_kelas: "",
  nama_kelas: "",
  tingkat: "",
};

export default function Students() {
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Soft delete confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getStudents();
      if (response && response.success && response.students) {
        setStudents(response.students);
      } else if (response && response.data) {
        setStudents(response.data);
      } else if (Array.isArray(response)) {
        setStudents(response);
      } else if (response?.students) {
        setStudents(response.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data siswa:", error);
      showToast(error?.message || "Gagal memuat data siswa", { tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter & Search
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const keyword = search.toLowerCase().trim();
      const kelasString = `${student.tingkat || ""} ${student.nama_kelas || ""}`.trim();
      const matchSearch =
        !keyword ||
        String(student.nama_siswa || "")
          .toLowerCase()
          .includes(keyword) ||
        String(student.nis || "")
          .toLowerCase()
          .includes(keyword) ||
        kelasString.toLowerCase().includes(keyword);

      const isActive = Number(student.status_aktif ?? 1) === 1;
      let matchStatus = true;
      if (statusFilter === "active") matchStatus = isActive;
      if (statusFilter === "inactive") matchStatus = !isActive;

      return matchSearch && matchStatus;
    });
  }, [students, search, statusFilter]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (student) => {
    setIsEditMode(true);
    setFormData({
      id_siswa: student.id_siswa || student.id,
      nis: student.nis || "",
      nama_siswa: student.nama_siswa || student.name || "",
      id_kelas: student.id_kelas || "",
      nama_kelas: student.nama_kelas || student.className || "",
      tingkat: student.tingkat || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  // Form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Create / Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validasi
    if (!formData.nis.trim() || !formData.nama_siswa.trim()) {
      setFormError("NIS dan Nama Siswa wajib diisi!");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        if (studentService.updateStudent) {
          await studentService.updateStudent(formData.id_siswa, {
            nis: formData.nis,
            nama_siswa: formData.nama_siswa,
            id_kelas: formData.id_kelas,
          });
        }
        showToast("Data siswa berhasil diperbarui!", { tone: "success" });
      } else {
        if (studentService.createStudent) {
          await studentService.createStudent({
            nis: formData.nis,
            nama_siswa: formData.nama_siswa,
            id_kelas: formData.id_kelas,
          });
        }
        showToast("Siswa baru berhasil ditambahkan!", { tone: "success" });
      }

      handleCloseModal();
      await fetchStudents();
    } catch (error) {
      console.error("Gagal menyimpan data siswa:", error);
      setFormError(
        error?.message || "Terjadi kesalahan saat menyimpan data siswa.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Open soft delete / deactivate confirmation
  const handlePromptDelete = (student) => {
    setDeleteTarget(student);
  };

  // Confirm soft delete / delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const studentId = deleteTarget.id_siswa || deleteTarget.id;
      if (studentService.deleteStudent) {
        await studentService.deleteStudent(studentId);
      }
      showToast(
        `Siswa ${deleteTarget.nama_siswa || deleteTarget.name} berhasil dihapus/dinonaktifkan!`,
        { tone: "success" },
      );
      setDeleteTarget(null);
      await fetchStudents();
    } catch (error) {
      console.error("Gagal memproses data siswa:", error);
      showToast(error?.message || "Gagal memproses data siswa.", {
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer
      title="Data Siswa"
      description="Kelola informasi data siswa, pembagian kelas, dan status keaktifan dalam sistem absensi."
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchStudents}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Tambah Siswa
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card padding="p-5">
          {/* Header & Filter Bar */}
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Daftar Peserta Didik
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Menampilkan {filteredStudents.length} dari total{" "}
                {students.length} siswa
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Status */}
              <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("active")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "active"
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("inactive")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "inactive"
                      ? "bg-white text-red-700 shadow-sm dark:bg-slate-700 dark:text-red-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Nonaktif
                </button>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="mt-4">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan NIS, Nama Siswa, atau Kelas..."
            />
          </div>

          {/* Table Content */}
          <div className="mt-4">
            {loading ? (
              <Loading label="Memuat data siswa..." />
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title={
                  search || statusFilter !== "all"
                    ? "Siswa tidak ditemukan"
                    : "Belum ada data siswa"
                }
                description={
                  search || statusFilter !== "all"
                    ? "Coba sesuaikan kata kunci pencarian atau ubah filter status."
                    : "Tambahkan data siswa baru dengan menekan tombol 'Tambah Siswa' di atas."
                }
                action={
                  !search && statusFilter === "all" ? (
                    <Button icon={Plus} onClick={handleOpenCreate}>
                      Tambah Siswa Pertama
                    </Button>
                  ) : null
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="w-12 px-4 py-3.5 text-center">No</th>
                      <th className="px-4 py-3.5">NIS</th>
                      <th className="px-4 py-3.5">Nama Siswa</th>
                      <th className="px-4 py-3.5">Kelas</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="w-28 px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.map((student, index) => {
                      const isActive = Number(student.status_aktif ?? 1) === 1;
                      const kelasDisplay = student.tingkat
                        ? `${student.tingkat} ${student.nama_kelas || ""}`.trim()
                        : student.nama_kelas || student.className || "-";

                      return (
                        <tr
                          key={student.id_siswa || index}
                          className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                        >
                          <td className="px-4 py-3.5 text-center font-medium text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                            {student.nis || "-"}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-semibold text-xs ring-1 ring-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900">
                                {student.nama_siswa
                                  ? student.nama_siswa.charAt(0).toUpperCase()
                                  : student.name
                                    ? student.name.charAt(0).toUpperCase()
                                    : "S"}
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {student.nama_siswa || student.name || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {kelasDisplay}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            {isActive ? (
                              <Badge tone="success" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Aktif
                              </Badge>
                            ) : (
                              <Badge tone="danger" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Nonaktif
                              </Badge>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Tombol Edit Icon */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(student)}
                                title="Edit Data Siswa"
                                className="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300"
                                aria-label={`Edit ${student.nama_siswa || student.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* Tombol Delete / Soft Delete Icon */}
                              <button
                                type="button"
                                onClick={() => handlePromptDelete(student)}
                                disabled={!isActive}
                                title={
                                  isActive
                                    ? "Nonaktifkan / Hapus Siswa"
                                    : "Siswa sudah dinonaktifkan"
                                }
                                className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all active:scale-95 ${
                                  isActive
                                    ? "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-600"
                                }`}
                                aria-label={`Hapus ${student.nama_siswa || student.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal Dialog Form Tambah / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-slide-up dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900">
                  {isEditMode ? (
                    <Pencil className="h-5 w-5" />
                  ) : (
                    <GraduationCap className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isEditMode ? "Edit Data Siswa" : "Tambah Data Siswa"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEditMode
                      ? "Perbarui NIS, nama lengkap siswa, dan kelas."
                      : "Lengkapi data siswa ke dalam sistem absensi."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Banner if any */}
            {formError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              <Input
                label="Nomor Induk Siswa (NIS)"
                name="nis"
                icon={Hash}
                value={formData.nis}
                onChange={handleInputChange}
                placeholder="Contoh: 24251001"
                required
              />

              <Input
                label="Nama Lengkap Siswa"
                name="nama_siswa"
                icon={User}
                value={formData.nama_siswa}
                onChange={handleInputChange}
                placeholder="Contoh: Ahmad Fadilah"
                required
              />

              <Input
                label="Kelas"
                name="nama_kelas"
                icon={School}
                value={
                  formData.tingkat
                    ? `${formData.tingkat} ${formData.nama_kelas}`.trim()
                    : formData.nama_kelas
                }
                onChange={handleInputChange}
                placeholder="Contoh: 7 A atau VIII-B"
              />

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={isEditMode ? Pencil : Plus}
                  isLoading={isSaving}
                >
                  {isEditMode ? "Simpan Perubahan" : "Tambahkan Siswa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Soft Delete / Delete */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus / Nonaktifkan Siswa?"
        description={`Apakah Anda yakin ingin menonaktifkan siswa "${deleteTarget?.nama_siswa || deleteTarget?.name}"?`}
        confirmLabel="Ya, Nonaktifkan"
        cancelLabel="Batal"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
