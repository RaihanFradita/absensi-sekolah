import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  School,
  X,
  CheckCircle2,
  XCircle,
  Layers,
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
import { adminClassServices } from "../../services/adminServices/classServices";

const EMPTY_FORM = {
  id_kelas: null,
  nama_kelas: "",
  tingkat: "7",
};

export default function Classes() {
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [tingkatFilter, setTingkatFilter] = useState("all");

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Soft delete / deactivation confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==============================
  // FETCH DATA KELAS
  // ==============================
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await adminClassServices.getClasses();
      if (response && response.success && response.data) {
        setClasses(response.data);
      } else if (Array.isArray(response)) {
        setClasses(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
      showToast(error?.message || "Gagal memuat data kelas", { tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ==============================
  // FILTER & SEARCH
  // ==============================
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const keyword = search.toLowerCase().trim();
      const matchSearch =
        !keyword ||
        String(cls.nama_kelas || "")
          .toLowerCase()
          .includes(keyword) ||
        String(cls.tingkat || "").includes(keyword);

      const isActive = Number(cls.status_aktif ?? 1) === 1;
      let matchStatus = true;
      if (statusFilter === "active") matchStatus = isActive;
      if (statusFilter === "inactive") matchStatus = !isActive;

      let matchTingkat = true;
      if (tingkatFilter !== "all") {
        matchTingkat = String(cls.tingkat) === String(tingkatFilter);
      }

      return matchSearch && matchStatus && matchTingkat;
    });
  }, [classes, search, statusFilter, tingkatFilter]);

  // Unique list of tingkat for filter select
  const uniqueTingkatList = useMemo(() => {
    const list = Array.from(
      new Set(classes.map((cls) => cls.tingkat).filter(Boolean))
    );
    return list.sort((a, b) => Number(a) - Number(b));
  }, [classes]);

  // ==============================
  // MODAL HANDLERS
  // ==============================
  const handleOpenAddModal = () => {
    setFormData(EMPTY_FORM);
    setIsEditMode(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls) => {
    setFormData({
      id_kelas: cls.id_kelas,
      nama_kelas: cls.nama_kelas || "",
      tingkat: String(cls.tingkat || "7"),
    });
    setIsEditMode(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  // ==============================
  // SUBMIT (TAMBAH / EDIT)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.nama_kelas.trim()) {
      setFormError("Nama kelas wajib diisi!");
      return;
    }
    if (!formData.tingkat) {
      setFormError("Tingkat kelas wajib dipilih!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nama_kelas: formData.nama_kelas.trim().toUpperCase(),
        tingkat: Number(formData.tingkat),
      };

      let response;
      if (isEditMode) {
        response = await adminClassServices.updateClass(
          formData.id_kelas,
          payload
        );
      } else {
        response = await adminClassServices.createClass(payload);
      }

      if (response && response.success !== false) {
        showToast(
          response.message ||
            (isEditMode
              ? "Data kelas berhasil diperbarui!"
              : "Kelas baru berhasil ditambahkan!"),
          { tone: "success" }
        );
        handleCloseModal();
        await fetchClasses();
      } else {
        setFormError(response?.message || "Terjadi kesalahan!");
      }
    } catch (error) {
      console.error("Error submitting class:", error);
      setFormError(
        error?.message || "Gagal menyimpan data kelas. Silakan coba lagi."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==============================
  // SOFT DELETE / DEACTIVATE
  // ==============================
  const handleDeactivateClick = (cls) => {
    setDeleteTarget(cls);
  };

  const handleConfirmDeactivate = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await adminClassServices.deactivateClass(
        deleteTarget.id_kelas
      );

      if (response && response.success !== false) {
        showToast(
          response.message ||
            `Kelas "${deleteTarget.nama_kelas}" berhasil dinonaktifkan!`,
          { tone: "success" }
        );
        setDeleteTarget(null);
        await fetchClasses();
      } else {
        showToast(response?.message || "Gagal menonaktifkan kelas.", {
          tone: "error",
        });
      }
    } catch (error) {
      console.error("Gagal menonaktifkan kelas:", error);
      showToast(error?.message || "Terjadi kesalahan pada server.", {
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer
      title="Data Kelas"
      description="Kelola daftar kelas, tingkat pendidikan, dan pembagian rombel sekolah."
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchClasses}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Tambah Kelas
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
                Daftar Rombongan Belajar
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Menampilkan {filteredClasses.length} dari total{" "}
                {classes.length} kelas
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Tingkat */}
              <div className="relative">
                <select
                  value={tingkatFilter}
                  onChange={(e) => setTingkatFilter(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <option value="all">Semua Tingkat</option>
                  {uniqueTingkatList.map((t) => (
                    <option key={t} value={t}>
                      Tingkat {t}
                    </option>
                  ))}
                </select>
              </div>

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
              placeholder="Cari berdasarkan Nama Kelas atau Tingkat..."
            />
          </div>

          {/* Table Content */}
          <div className="mt-4">
            {loading ? (
              <Loading label="Memuat data kelas..." />
            ) : filteredClasses.length === 0 ? (
              <EmptyState
                icon={School}
                title={
                  search || statusFilter !== "all" || tingkatFilter !== "all"
                    ? "Kelas tidak ditemukan"
                    : "Belum ada data kelas"
                }
                description={
                  search || statusFilter !== "all" || tingkatFilter !== "all"
                    ? "Coba sesuaikan kata kunci pencarian atau ubah filter yang diterapkan."
                    : "Tambahkan data kelas baru dengan menekan tombol 'Tambah Kelas' di atas."
                }
                action={
                  !search && statusFilter === "all" && tingkatFilter === "all" ? (
                    <Button icon={Plus} onClick={handleOpenAddModal}>
                      Tambah Kelas Pertama
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setTingkatFilter("all");
                      }}
                    >
                      Reset Filter
                    </Button>
                  )
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                      <th className="w-12 px-4 py-3.5 text-center">No</th>
                      <th className="px-4 py-3.5">Nama Kelas</th>
                      <th className="px-4 py-3.5">Tingkat</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="w-28 px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredClasses.map((cls, index) => {
                      const isActive = Number(cls.status_aktif ?? 1) === 1;

                      return (
                        <tr
                          key={cls.id_kelas || index}
                          className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                        >
                          <td className="px-4 py-3.5 text-center font-medium text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-semibold text-xs ring-1 ring-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900">
                                <School className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {cls.nama_kelas || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <Layers className="h-3 w-3 text-slate-400" />
                              Tingkat {cls.tingkat}
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
                                onClick={() => handleOpenEditModal(cls)}
                                title="Edit Data Kelas"
                                className="group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300"
                                aria-label={`Edit ${cls.nama_kelas}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* Tombol Delete / Soft Delete Icon */}
                              <button
                                type="button"
                                onClick={() => handleDeactivateClick(cls)}
                                disabled={!isActive}
                                title={
                                  isActive
                                    ? "Nonaktifkan Kelas"
                                    : "Kelas sudah dinonaktifkan"
                                }
                                className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all active:scale-95 ${
                                  isActive
                                    ? "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-600"
                                }`}
                                aria-label={`Nonaktifkan ${cls.nama_kelas}`}
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

      {/* Modal Dialog Form Tambah / Edit Kelas */}
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
                    <School className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isEditMode ? "Edit Data Kelas" : "Tambah Data Kelas"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEditMode
                      ? "Perbarui nama rombel dan jenjang tingkat kelas."
                      : "Lengkapi data rombel kelas baru ke dalam sistem absensi."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 disabled:opacity-50"
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
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Input
                  label="Nama Kelas"
                  name="nama_kelas"
                  icon={School}
                  placeholder="Contoh: VII A, VIII B, IX C"
                  value={formData.nama_kelas}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nama_kelas: e.target.value,
                    }))
                  }
                  required
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  💡 Nama kelas akan otomatis disimpan dalam format huruf kapital.
                </p>
              </div>

              <div>
                <label
                  htmlFor="tingkat_select"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Tingkat Kelas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <select
                    id="tingkat_select"
                    value={formData.tingkat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tingkat: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    required
                  >
                    <option value="7">7 (Kelas VII)</option>
                    <option value="8">8 (Kelas VIII)</option>
                    <option value="9">9 (Kelas IX)</option>
                  </select>
                </div>
              </div>

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
                  {isEditMode ? "Simpan Perubahan" : "Tambahkan Kelas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Soft Delete / Deactivate */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Nonaktifkan Kelas?"
        description={`Apakah Anda yakin ingin menonaktifkan kelas "${deleteTarget?.nama_kelas}"?`}
        confirmLabel="Ya, Nonaktifkan"
        cancelLabel="Batal"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
