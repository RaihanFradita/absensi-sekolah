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
  Key,
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
import { adminTeacherServices } from "../../services/adminServices/teacherServices";

const EMPTY_FORM = {
  id_guru: null,
  id_user: null,
  nip: "",
  nama_guru: "",
  username: "",
  password: "",
};

export default function Teachers() {
  const { showToast } = useToast();

  const [teachers, setTeachers] = useState([]);
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

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await adminTeacherServices.getTeachers();
      if (response && response.success) {
        setTeachers(response.data || []);
      } else if (Array.isArray(response)) {
        setTeachers(response);
      }
    } catch (error) {
      console.error("Gagal mengambil data guru:", error);
      showToast(error?.message || "Gagal memuat data guru", { tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filter & Search
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const keyword = search.toLowerCase().trim();
      const matchSearch =
        !keyword ||
        String(teacher.nama_guru || "")
          .toLowerCase()
          .includes(keyword) ||
        String(teacher.nip || "")
          .toLowerCase()
          .includes(keyword) ||
        String(teacher.username || "")
          .toLowerCase()
          .includes(keyword);

      const isActive = Number(teacher.status_aktif) === 1;
      let matchStatus = true;
      if (statusFilter === "active") matchStatus = isActive;
      if (statusFilter === "inactive") matchStatus = !isActive;

      return matchSearch && matchStatus;
    });
  }, [teachers, search, statusFilter]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (teacher) => {
    setIsEditMode(true);
    setFormData({
      id_guru: teacher.id_guru,
      id_user: teacher.id_user,
      nip: teacher.nip || "",
      nama_guru: teacher.nama_guru || "",
      username: teacher.username || "",
      password: "",
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
    if (
      !formData.nip.trim() ||
      !formData.nama_guru.trim() ||
      !formData.username.trim()
    ) {
      setFormError("NIP, Nama Guru, dan Username wajib diisi!");
      return;
    }

    if (!isEditMode && !formData.password.trim()) {
      setFormError("Password wajib diisi untuk data guru baru!");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        await adminTeacherServices.updateTeacher(formData.id_guru, {
          id_user: formData.id_user,
          username: formData.username,
          nip: formData.nip,
          nama_guru: formData.nama_guru,
        });
        showToast("Data guru berhasil diperbarui!", { tone: "success" });
      } else {
        await adminTeacherServices.createTeacher({
          nip: formData.nip,
          nama_guru: formData.nama_guru,
          username: formData.username,
          password: formData.password,
        });
        showToast("Guru baru berhasil ditambahkan!", { tone: "success" });
      }

      handleCloseModal();
      await fetchTeachers();
    } catch (error) {
      console.error("Gagal menyimpan data guru:", error);
      setFormError(
        error?.message || "Terjadi kesalahan saat menyimpan data guru.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Open soft delete confirmation
  const handlePromptDelete = (teacher) => {
    setDeleteTarget(teacher);
  };

  // Confirm soft delete (deactivate)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await adminTeacherServices.deactivateTeacher(
        deleteTarget.id_guru,
        deleteTarget.id_user,
      );
      showToast(`Guru ${deleteTarget.nama_guru} berhasil dinonaktifkan!`, {
        tone: "success",
      });
      setDeleteTarget(null);
      await fetchTeachers();
    } catch (error) {
      console.error("Gagal menonaktifkan guru:", error);
      showToast(error?.message || "Gagal menonaktifkan guru.", {
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer
      title="Data Guru"
      description="Kelola informasi data guru, akun pengajar, dan status keaktifan dalam sistem absensi."
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchTeachers}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Tambah Guru
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
                Daftar Tenaga Pendidik
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Menampilkan {filteredTeachers.length} dari total{" "}
                {teachers.length} guru
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
              placeholder="Cari berdasarkan NIP, Nama Guru, atau Username..."
            />
          </div>

          {/* Table Content */}
          <div className="mt-4">
            {loading ? (
              <Loading label="Memuat data guru..." />
            ) : filteredTeachers.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title={
                  search || statusFilter !== "all"
                    ? "Guru tidak ditemukan"
                    : "Belum ada data guru"
                }
                description={
                  search || statusFilter !== "all"
                    ? "Coba sesuaikan kata kunci pencarian atau ubah filter status."
                    : "Tambahkan data guru baru dengan menekan tombol 'Tambah Guru' di atas."
                }
                action={
                  !search && statusFilter === "all" ? (
                    <Button icon={Plus} onClick={handleOpenCreate}>
                      Tambah Guru Pertama
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
                      <th className="px-4 py-3.5">NIP</th>
                      <th className="px-4 py-3.5">Nama Guru</th>
                      <th className="px-4 py-3.5">Username</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="w-28 px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTeachers.map((teacher, index) => {
                      const isActive = Number(teacher.status_aktif) === 1;

                      return (
                        <tr
                          key={teacher.id_guru}
                          className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                        >
                          <td className="px-4 py-3.5 text-center font-medium text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                            {teacher.nip || "-"}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-semibold text-xs ring-1 ring-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900">
                                {teacher.nama_guru
                                  ? teacher.nama_guru.charAt(0).toUpperCase()
                                  : "G"}
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {teacher.nama_guru}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {teacher.username || "-"}
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
                                onClick={() => handleOpenEdit(teacher)}
                                title="Edit Data Guru"
                                className="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300"
                                aria-label={`Edit ${teacher.nama_guru}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* Tombol Soft Delete Icon */}
                              <button
                                type="button"
                                onClick={() => handlePromptDelete(teacher)}
                                disabled={!isActive}
                                title={
                                  isActive
                                    ? "Nonaktifkan Guru (Soft Delete)"
                                    : "Guru sudah dinonaktifkan"
                                }
                                className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all active:scale-95 ${
                                  isActive
                                    ? "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-600"
                                }`}
                                aria-label={`Nonaktifkan ${teacher.nama_guru}`}
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

      {/* Modal Dialog Form Tambah / Edit Guru */}
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
                    {isEditMode ? "Edit Data Guru" : "Tambah Data Guru"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEditMode
                      ? "Perbarui NIP, nama lengkap, dan username akun guru."
                      : "Lengkapi data guru dan akun login ke sistem absensi."}
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
                label="Nomor Induk Pegawai (NIP)"
                name="nip"
                icon={Hash}
                value={formData.nip}
                onChange={handleInputChange}
                placeholder="Contoh: 198501012010011001"
                required
              />

              <Input
                label="Nama Lengkap Guru"
                name="nama_guru"
                icon={User}
                value={formData.nama_guru}
                onChange={handleInputChange}
                placeholder="Contoh: Budi Santoso, S.Pd"
                required
              />

              <Input
                label="Username Login"
                name="username"
                icon={User}
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Contoh: budisantoso"
                required
              />

              {!isEditMode && (
                <Input
                  label="Password Akun"
                  name="password"
                  type="password"
                  icon={Key}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimal 6 karakter"
                  required
                />
              )}

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
                  {isEditMode ? "Simpan Perubahan" : "Tambahkan Guru"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Soft Delete */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Nonaktifkan Data Guru?"
        description={`Apakah Anda yakin ingin menonaktifkan guru "${deleteTarget?.nama_guru}"? Akun ini tidak akan dapat login ke sistem lagi.`}
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
