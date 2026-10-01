import { useEffect, useState } from "react";
import {
  School,
  Layers,
  X,
  Plus,
  Pencil,
} from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";

const EMPTY_FORM = {
  id_kelas: null,
  nama_kelas: "",
  tingkat: "7",
};

export default function ClassFormModal({
  open,
  editData = null,
  onClose,
  onSubmit,
  isSaving = false,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setFormData({
        id_kelas: editData.id_kelas ?? null,
        nama_kelas: editData.nama_kelas ?? "",
        tingkat: String(editData.tingkat ?? "7"),
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setFormError("");
  }, [open, editData]);

  if (!open) return null;

  const handleClose = () => {
    if (isSaving) return;
    setFormError("");
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const namaKelas = formData.nama_kelas.trim();

    if (!namaKelas) {
      setFormError("Nama kelas wajib diisi.");
      return;
    }

    if (!formData.tingkat) {
      setFormError("Tingkat kelas wajib dipilih.");
      return;
    }

    const payload = {
      nama_kelas: namaKelas.toUpperCase(),
      tingkat: Number(formData.tingkat),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setFormError(
        error?.message ||
          "Gagal menyimpan data kelas. Silakan coba lagi."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-modal-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
              {isEditMode ? (
                <Pencil className="h-5 w-5" />
              ) : (
                <School className="h-5 w-5" />
              )}
            </div>

            <div>
              <h2
                id="class-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {isEditMode
                  ? "Edit Data Kelas"
                  : "Tambah Data Kelas"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isEditMode
                  ? "Perbarui informasi kelas."
                  : "Tambahkan rombongan belajar baru."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {formError}
              </div>
            )}

            {/* Nama Kelas */}
            <div>
              <Input
                label="Nama Kelas"
                name="nama_kelas"
                icon={School}
                placeholder="Contoh: 7A"
                value={formData.nama_kelas}
                onChange={(e) =>
                  handleChange("nama_kelas", e.target.value)
                }
                disabled={isSaving}
                required
              />

              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Contoh penamaan: 7A, 7B, 8A, 9C.
              </p>
            </div>

            {/* Tingkat */}
            <div>
              <label
                htmlFor="class-level"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Tingkat
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  id="class-level"
                  value={formData.tingkat}
                  onChange={(e) =>
                    handleChange("tingkat", e.target.value)
                  }
                  disabled={isSaving}
                  className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
                  required
                >
                  <option value="7">7 - Kelas VII</option>
                  <option value="8">8 - Kelas VIII</option>
                  <option value="9">9 - Kelas IX</option>
                </select>

                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
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
              {isEditMode ? "Simpan Perubahan" : "Tambah Kelas"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}