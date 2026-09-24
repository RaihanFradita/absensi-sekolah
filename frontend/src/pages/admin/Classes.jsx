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

  // Soft delete / Deactivation confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await adminClassServices.getClasses();
      if (response && response.success) {
        setClasses(response.data || []);
      } else if (Array.isArray(response)) {
        setClasses(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setClasses(response.data);
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

  // Filter & Search
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const keyword = search.toLowerCase().trim();
      const matchSearch =
        !keyword ||
        String(cls.nama_kelas || "")
          .toLowerCase()
          .includes(keyword) ||
        String(cls.tingkat || "").includes(keyword);

      const isActive = Number(cls.status_aktif) === 1;
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
      new Set(classes.map((cls) => cls.tingkat).filter(Boolean)),
    );
    return list.sort((a, b) => Number(a) - Number(b));
  }, [classes]);

  // Statistics
  const stats = useMemo(() => {
    const total = classes.length;
    const active = classes.filter((c) => Number(c.status_aktif) === 1).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [classes]);

  // Handlers for Add & Edit
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
    setIsModalOpen(false);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

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
          payload,
        );
      } else {
        response = await adminClassServices.createClass(payload);
      }

      if (response && response.success !== false) {
        showToast(
          response.message ||
            (isEditMode
              ? "Berhasil memperbarui kelas"
              : "Berhasil menambahkan kelas"),
          { tone: "success" },
        );
        handleCloseModal();
        fetchClasses();
      } else {
        setFormError(response?.message || "Terjadi kesalahan!");
      }
    } catch (error) {
      console.error("Error submitting class:", error);
      setFormError(
        error?.message || "Gagal menyimpan data kelas. Silakan coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for Soft Delete / Deactivate
  const handleDeactivateClick = (cls) => {
    setDeleteTarget(cls);
  };

  const handleConfirmDeactivate = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await adminClassServices.deactivateClass(
        deleteTarget.id_kelas,
      );

      if (response && response.success !== false) {
        showToast(response.message || "Kelas berhasil dinonaktifkan", {
          tone: "success",
        });
        setDeleteTarget(null);
        fetchClasses();
      } else {
        showToast(response?.message || "Gagal menonaktifkan kelas", {
          tone: "error",
        });
      }
    } catch (error) {
      console.error("Gagal menonaktifkan kelas:", error);
      showToast(error?.message || "Terjadi kesalahan pada server", {
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer
      title="Data Kelas"
      description="Kelola daftar kelas dan tingkat pendidikan sekolah."
      action={
        <Button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kelas</span>
        </Button>
      }
    >
      {/* Statistik Ringkas */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <School className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Kelas
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.total}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Kelas Aktif
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.active}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Kelas Nonaktif
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.inactive}
            </p>
          </div>
        </Card>
      </div>

      {/* Control Bar: Search & Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Bar */}
            <div className="w-full sm:max-w-xs">
              <Input
                type="text"
                placeholder="Cari nama kelas atau tingkat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            {/* Filter Tingkat */}
            <select
              value={tingkatFilter}
              onChange={(e) => setTingkatFilter(e.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="all">Semua Tingkat</option>
              {uniqueTingkatList.map((t) => (
                <option key={t} value={t}>
                  Tingkat {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={fetchClasses}
              disabled={loading}
              title="Refresh Data"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table / List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12">
            <Loading label="Memuat data kelas..." />
          </div>
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            icon={School}
            title="Tidak Ada Data Kelas"
            description={
              search || statusFilter !== "all" || tingkatFilter !== "all"
                ? "Tidak ada kelas yang cocok dengan kriteria pencarian atau filter."
                : "Belum ada data kelas tersimpan di sistem."
            }
            action={
              (search || statusFilter !== "all" || tingkatFilter !== "all") && (
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">No</th>
                  <th className="px-6 py-4 font-semibold">Nama Kelas</th>
                  <th className="px-6 py-4 font-semibold">Tingkat</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredClasses.map((cls, index) => {
                  const isActive = Number(cls.status_aktif) === 1;
                  return (
                    <tr
                      key={cls.id_kelas || index}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {cls.nama_kelas}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Layers className="h-3.5 w-3.5" />
                          Tingkat {cls.tingkat}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={isActive ? "success" : "danger"}>
                          {isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditModal(cls)}
                            title="Edit Kelas"
                            className="p-2"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isActive && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeactivateClick(cls)}
                              title="Nonaktifkan Kelas"
                              className="p-2"
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isEditMode ? "Edit Data Kelas" : "Tambah Kelas Baru"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Nama Kelas *"
                  type="text"
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
                  Nama kelas akan otomatis disimpan dalam huruf kapital.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tingkat Kelas *
                </label>
                <select
                  value={formData.tingkat}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tingkat: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="7">7 (Kelas VII)</option>
                  <option value="8">8 (Kelas VIII)</option>
                  <option value="9">9 (Kelas IX)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {isEditMode ? "Simpan Perubahan" : "Tambah Kelas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog Nonaktifkan Kelas */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Nonaktifkan Kelas"
        description={
          deleteTarget
            ? `Apakah Anda yakin ingin menonaktifkan kelas "${deleteTarget.nama_kelas}"?`
            : ""
        }
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
