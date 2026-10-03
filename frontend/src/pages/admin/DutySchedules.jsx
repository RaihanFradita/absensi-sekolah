import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  UserCheck,
  X,
  Lock,
  CheckCircle2,
  XCircle,
  AtSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Calendar,
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
import { adminPicketTeacherServices } from "../../services/adminServices/picketTeacherServices";
import { formatDate } from "../../utils/formatDate";

const EMPTY_FORM = {
  id_user: null,
  username: "",
  password: "",
};

export default function DutySchedules() {
  const { showToast } = useToast();

  const [picketTeachers, setPicketTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==============================
  // FETCH DATA GURU PIKET DARI API
  // ==============================
  const fetchPicketTeachers = useCallback(
    async (targetPage = page, targetLimit = limit) => {
      setLoading(true);
      try {
        const response = await adminPicketTeacherServices.getPicketTeachers({
          page: targetPage,
          limit: targetLimit,
        });

        if (response && response.success && response.data) {
          setPicketTeachers(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          } else {
            setPagination({
              page: targetPage,
              limit: targetLimit,
              totalItems: response.data.length,
              totalPage: Math.max(1, Math.ceil(response.data.length / targetLimit)),
              hasNextPage: false,
              hasPrevPage: false,
            });
          }
        } else if (Array.isArray(response)) {
          setPicketTeachers(response);
          setPagination({
            page: 1,
            limit: targetLimit,
            totalItems: response.length,
            totalPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
          });
        } else if (response && Array.isArray(response.data)) {
          setPicketTeachers(response.data);
        }
      } catch (err) {
        console.error("Gagal memuat data guru piket:", err);
        showToast(err?.message || "Gagal memuat data guru piket", "error");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, showToast]
  );

  useEffect(() => {
    fetchPicketTeachers(page, limit);
  }, [page, limit, fetchPicketTeachers]);

  // Client-side search & status filtering
  const filteredTeachers = useMemo(() => {
    return picketTeachers.filter((item) => {
      const matchSearch =
        !search ||
        item.username?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id_user)?.includes(search);

      const isActive = item.status_aktif === 1 || item.status_aktif === true || item.status_aktif === "1";
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchSearch && matchStatus;
    });
  }, [picketTeachers, search, statusFilter]);

  // ==============================
  // MODAL HANDLERS
  // ==============================
  const handleOpenAddModal = () => {
    setFormData(EMPTY_FORM);
    setIsEditMode(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setFormData({
      id_user: item.id_user,
      username: item.username || "",
      password: "",
    });
    setIsEditMode(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  // ==============================
  // FORM SUBMIT (CREATE / EDIT)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.username.trim()) {
      setFormError("Username akun guru piket wajib diisi.");
      return;
    }

    if (!isEditMode && !formData.password.trim()) {
      setFormError("Password akun guru piket wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        const payload = {
          username: formData.username.trim(),
          password: formData.password ? formData.password.trim() : undefined,
        };

        const response = await adminPicketTeacherServices.updatePicketTeacher(
          formData.id_user,
          payload
        );

        if (response && response.success === false) {
          throw new Error(response.message || "Gagal memperbarui data");
        }

        showToast("Akun guru piket berhasil diperbarui.", "success");
      } else {
        const payload = {
          username: formData.username.trim(),
          password: formData.password.trim(),
        };

        const response = await adminPicketTeacherServices.createPicketTeacher(payload);

        if (response && response.success === false) {
          throw new Error(response.message || "Gagal membuat akun");
        }

        showToast("Akun guru piket baru berhasil dibuat.", "success");
      }

      handleCloseModal();
      fetchPicketTeachers(page, limit);
    } catch (err) {
      console.error("Gagal menyimpan akun guru piket:", err);
      setFormError(err?.message || "Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==============================
  // DEACTIVATE / DELETE HANDLER
  // ==============================
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await adminPicketTeacherServices.deactivatePicketTeacher(
        deleteTarget.id_user
      );

      if (response && response.success === false) {
        throw new Error(response.message || "Gagal menonaktifkan guru piket");
      }

      showToast(
        `Akun guru piket "@${deleteTarget.username}" berhasil dinonaktifkan.`,
        "success"
      );
      setDeleteTarget(null);
      fetchPicketTeachers(page, limit);
    } catch (err) {
      console.error("Gagal menonaktifkan guru piket:", err);
      showToast(err?.message || "Gagal menonaktifkan akun guru piket", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ==============================
  // PAGINATION HANDLERS
  // ==============================
  const totalPages = pagination.totalPage || Math.max(1, Math.ceil((pagination.totalItems || picketTeachers.length) / limit));

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <PageContainer
      title="Kelola Data Guru Piket"
      description="Manajemen akun dan data login guru piket untuk pencatatan serta monitoring absensi sekolah."
    >
      <div className="space-y-6">
        {/* =====================================
            HEADER ACTION & FILTER BAR
        ====================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* SEARCH */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari username guru piket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            {/* REFRESH */}
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => fetchPicketTeachers(page, limit)}
              title="Muat ulang data"
            >
              Segarkan
            </Button>
          </div>

          <Button icon={Plus} onClick={handleOpenAddModal}>
            Tambah Guru Piket
          </Button>
        </div>

        {/* =====================================
            DATA TABLE
        ====================================== */}
        <Card padding="p-0" className="overflow-hidden">
          {loading ? (
            <div className="p-12">
              <Loading label="Memuat data akun guru piket..." />
            </div>
          ) : filteredTeachers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">Akun Guru Piket</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Dibuat Pada</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredTeachers.map((item) => {
                      const isActive =
                        item.status_aktif === 1 ||
                        item.status_aktif === true ||
                        item.status_aktif === "1";

                      return (
                        <tr
                          key={item.id_user}
                          className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                        >
                          {/* USERNAME & AVATAR */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950 dark:text-brand-400 dark:ring-brand-900">
                                <UserCheck className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {item.username}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  ID User: #{item.id_user}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ROLE */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Guru Piket
                            </span>
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">
                            <Badge
                              tone={isActive ? "success" : "neutral"}
                              className="gap-1"
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" /> Aktif
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" /> Nonaktif
                                </>
                              )}
                            </Badge>
                          </td>

                          {/* CREATED AT */}
                          <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {item.created_at ? (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(item.created_at)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Pencil}
                                onClick={() => handleOpenEditModal(item)}
                                title="Edit akun guru piket"
                              >
                                Edit
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Trash2}
                                onClick={() => setDeleteTarget(item)}
                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                                title="Nonaktifkan guru piket"
                              >
                                Nonaktifkan
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Tampilkan</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>
                    dari total {pagination.totalItems || picketTeachers.length} data
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Halaman {page} dari {totalPages}
                  </p>

                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ChevronsLeft}
                      disabled={page <= 1}
                      onClick={() => setPage(1)}
                      title="Halaman pertama"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ChevronLeft}
                      disabled={page <= 1}
                      onClick={handlePrevPage}
                      title="Halaman sebelumnya"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ChevronRight}
                      disabled={page >= totalPages}
                      onClick={handleNextPage}
                      title="Halaman selanjutnya"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ChevronsRight}
                      disabled={page >= totalPages}
                      onClick={() => setPage(totalPages)}
                      title="Halaman terakhir"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Tidak ada data guru piket"
              description={
                search || statusFilter !== "all"
                  ? "Tidak ada akun guru piket yang cocok dengan filter pencarian."
                  : "Belum ada akun guru piket yang terdaftar di sistem. Silakan tambah akun baru."
              }
              action={
                search || statusFilter !== "all" ? (
                  <Button
                    variant="secondary"
                    icon={RefreshCw}
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                  >
                    Reset Filter
                  </Button>
                ) : (
                  <Button icon={Plus} onClick={handleOpenAddModal}>
                    Tambah Guru Piket
                  </Button>
                )
              }
            />
          )}
        </Card>
      </div>

      {/* =====================================
          MODAL FORM (CREATE / EDIT)
      ====================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900">
                  {isEditMode ? (
                    <Pencil className="h-5 w-5" />
                  ) : (
                    <UserCheck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isEditMode ? "Edit Akun Guru Piket" : "Tambah Guru Piket Baru"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEditMode
                      ? "Perbarui username atau ubah password akun guru piket."
                      : "Buat akun login guru piket baru ke sistem."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ERROR BANNER */}
            {formError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {formError}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Input
                label="Username Akun"
                name="username"
                icon={AtSign}
                placeholder="Contoh: guru_piket_senin"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />

              <Input
                label={`Password ${isEditMode ? "(Opsional)" : ""}`}
                name="password"
                type="password"
                icon={Lock}
                placeholder={
                  isEditMode
                    ? "Kosongkan jika tidak ingin mengubah password"
                    : "Masukkan password akun"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!isEditMode}
              />

              {isEditMode && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  💡 Password tidak wajib diisi saat edit. Isi hanya jika ingin mereset password akun guru piket.
                </p>
              )}

              {/* MODAL ACTIONS */}
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
                  icon={isEditMode ? Pencil : Plus}
                  isLoading={isSaving}
                >
                  {isEditMode ? "Simpan Perubahan" : "Tambah Guru Piket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          CONFIRM DEACTIVATE DIALOG
      ====================================== */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Nonaktifkan Akun Guru Piket"
        description={`Apakah Anda yakin ingin menonaktifkan akun guru piket "@${deleteTarget?.username}"? Akun yang dinonaktifkan tidak akan dapat login ke sistem.`}
        confirmLabel="Nonaktifkan"
        cancelLabel="Batal"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageContainer>
  );
}
