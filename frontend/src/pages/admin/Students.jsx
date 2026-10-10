import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
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
  School,
  Lock,
  AtSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  KeyRound,
  Copy,
  Check,
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
  id_user: null,
  username: "",
  nama_siswa: "",
  jenis_kelamin: "",
  id_kelas: "",
  password: "",
};

const formatClassOption = ({ tingkat, nama_kelas }) => {
  const name = String(nama_kelas || "");
  const description = name.startsWith("MM") ? " (Multi Media)" : "";
  return `Kelas ${tingkat}: ${name}${description}`;
};

export default function Students() {
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("");

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

  // Modal form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Delete / deactivate
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset password states
  const [resetTarget, setResetTarget] = useState(null);
  const [customResetPassword, setCustomResetPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkTargetClass, setBulkTargetClass] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkConfirmState, setBulkConfirmState] = useState({
    open: false,
    action: null,
  });

  const fetchStudents = async (
    targetPage = page,
    targetLimit = limit,
    targetClassId = classFilter,
    targetSearch = debouncedSearch,
  ) => {
    setLoading(true);

    try {
      const response = await studentService.getStudents({
        page: targetPage,
        limit: targetLimit,
        classId: targetClassId || undefined,
        search: targetSearch || undefined,
      });

      if (response?.success && response?.data) {
        setStudents(response.data);
        if (response.pagination) {
          const totalPage =
            response.pagination.totalPage ||
            response.pagination.totalPages ||
            1;
          setPagination({
            ...response.pagination,
            totalPage,
            totalPages: totalPage,
          });
        } else {
          setPagination({
            page: targetPage,
            limit: targetLimit,
            totalItems: response.data.length,
            totalPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          });
        }
      } else if (response?.students) {
        setStudents(response.students);
        if (response.pagination) {
          const totalPage =
            response.pagination.totalPage ||
            response.pagination.totalPages ||
            1;
          setPagination({
            ...response.pagination,
            totalPage,
            totalPages: totalPage,
          });
        }
      } else if (Array.isArray(response)) {
        setStudents(response);
        setPagination({
          page: 1,
          limit: response.length,
          totalItems: response.length,
          totalPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else if (response?.data && Array.isArray(response.data)) {
        setStudents(response.data);
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

  const fetchClasses = async () => {
    setLoadingClasses(true);

    try {
      const response = await studentService.getClasses();

      if (response?.success && response?.classes) {
        setClasses(response.classes);
      } else if (response?.data) {
        setClasses(response.data);
      } else if (Array.isArray(response)) {
        setClasses(response);
      } else if (response?.classes) {
        setClasses(response.classes);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);

      showToast(error?.message || "Gagal memuat data kelas", { tone: "error" });
    } finally {
      setLoadingClasses(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchStudents(page, limit, classFilter, debouncedSearch);
  }, [page, limit, classFilter, debouncedSearch]);

  useEffect(() => {
    fetchClasses();
  }, []);

  // Reset ke halaman 1 saat search (setelah debounce) atau filter berubah
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, statusFilter, classFilter]);

  // =========================================================
  // HANDLERS PAGINATION
  // =========================================================
  const handlePageChange = (newPage) => {
    const totalPages = pagination.totalPage || pagination.totalPages || 1;
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1);
  };

  const renderPageNumbers = () => {
    const totalPages = pagination.totalPage || pagination.totalPages || 1;
    const pages = [];

    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(totalPages, page + 1);

    if (page === 1) {
      endPage = Math.min(totalPages, 3);
    } else if (page === totalPages) {
      startPage = Math.max(1, totalPages - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center gap-1">
        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              className="inline-flex h-8 px-2.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 text-xs text-slate-400">...</span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePageChange(p)}
            className={`inline-flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold shadow-sm transition-all ${
              p === page
                ? "bg-brand-600 text-white dark:bg-brand-500"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-1 text-xs text-slate-400">...</span>
            )}
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              className="inline-flex h-8 px-2.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
    );
  };

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  // Filter status dilakukan di sisi frontend karena backend belum support filter status
  const filteredStudents = students.filter((student) => {
    const isActive = Number(student.status_aktif ?? 1) === 1;

    if (statusFilter === "active") return isActive;
    if (statusFilter === "inactive") return !isActive;

    return true;
  });

  // OPEN CREATE MODAL

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);

    if (classes.length === 0) {
      fetchClasses();
    }
  };

  // OPEN EDIT MODAL

  const handleOpenEdit = async (student) => {
    const studentId = student.id_siswa || student.id;

    setIsEditMode(true);
    setFormError("");
    setIsModalOpen(true);

    // Data sementara dari tabel
    setFormData({
      id_siswa: studentId,
      id_user: student.id_user || null,
      username: student.username || "",
      nama_siswa: student.nama_siswa || student.name || "",
      jenis_kelamin: student.jenis_kelamin || "",
      id_kelas: student.id_kelas || "",
      password: "",
    });

    if (classes.length === 0) {
      fetchClasses();
    }

    // Ambil detail siswa
    setIsLoadingDetail(true);

    try {
      const response = await studentService.getStudent(studentId);

      const studentDetail = response?.student || response?.data || response;

      if (studentDetail) {
        setFormData({
          id_siswa: studentDetail.id_siswa || studentId,

          id_user: studentDetail.id_user || student.id_user || null,

          username: studentDetail.username || "",

          nama_siswa: studentDetail.nama_siswa || studentDetail.name || "",
          jenis_kelamin: studentDetail.jenis_kelamin || "",

          id_kelas: studentDetail.id_kelas || "",

          password: "",
        });
      }
    } catch (error) {
      console.error("Gagal mengambil detail siswa:", error);

      showToast(error?.message || "Gagal memuat detail data siswa", {
        tone: "error",
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // CLOSE MODAL

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsLoadingDetail(false);
  };

  // FORM CHANGE

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Jika yang diubah adalah nama_siswa dan BUKAN sedang dalam mode Edit
    if (name === "nama_siswa" && !isEditMode) {
      // generate username (kecil semua) dan tanpa spasi
      const generatedUsername = value.toLowerCase().replace(/\s+/g, "");

      // generate password
      const firstName = value.trim().split(" ")[0].toLowerCase();
      const generatedPassword = firstName ? `smp4#${firstName}` : "";

      setFormData((prev) => ({
        ...prev,
        nama_siswa: value,
        username: generatedUsername,
        password: generatedPassword,
      }));
    } else {
      // Untuk input lain atau saat mode edit, jalankan fungsi normal
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // =========================================================
  // SUBMIT CREATE / EDIT
  // =========================================================

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    setFormError("");

    // Validasi nama
    if (!formData.nama_siswa.trim()) {
      setFormError("Nama siswa wajib diisi!");
      return;
    }
    if (!formData.jenis_kelamin) {
      setFormError("Gender wajib dipilih!");
      return;
    }

    // Validasi username
    if (!formData.username.trim()) {
      setFormError("Username wajib diisi!");
      return;
    }

    // Validasi kelas
    if (!formData.id_kelas) {
      setFormError("Kelas wajib dipilih!");
      return;
    }

    // Password wajib ketika tambah
    if (!isEditMode && !formData.password) {
      setFormError("Password wajib diisi!");
      return;
    }

    setIsSaving(true);

    try {
      // =====================================================
      // EDIT SISWA
      // =====================================================

      if (isEditMode) {
        if (studentService.updateStudent) {
          const payload = {
            id_user: formData.id_user,
            username: formData.username,
            nama_siswa: formData.nama_siswa,
            jenis_kelamin: formData.jenis_kelamin,
            id_kelas: Number(formData.id_kelas),
          };

          // Password hanya dikirim
          // jika memang diubah
          if (formData.password) {
            payload.password = formData.password;
          }

          await studentService.updateStudent(formData.id_siswa, payload);
        }

        showToast("Data siswa berhasil diperbarui!", { tone: "success" });
      }

      // =====================================================
      // TAMBAH SISWA
      // =====================================================
      else {
        if (studentService.createStudent) {
          await studentService.createStudent({
            username: formData.username,

            nama_siswa: formData.nama_siswa,
            jenis_kelamin: formData.jenis_kelamin,

            id_kelas: Number(formData.id_kelas),

            password: formData.password,
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

  // =========================================================
  // DELETE / DEACTIVATE
  // =========================================================

  const handlePromptDelete = (student) => {
    setDeleteTarget(student);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const studentId = deleteTarget.id_siswa || deleteTarget.id;

      const userId = deleteTarget.id_user;

      if (!userId) {
        showToast("ID user siswa tidak ditemukan.", { tone: "error" });

        setIsDeleting(false);
        return;
      }

      const response = await studentService.deleteStudent(studentId, userId);

      if (response && response.success === false) {
        showToast(response.message || "Gagal menonaktifkan siswa.", {
          tone: "error",
        });

        return;
      }

      showToast(
        `Siswa "${
          deleteTarget.nama_siswa || deleteTarget.name
        }" berhasil dinonaktifkan!`,
        { tone: "success" },
      );

      setDeleteTarget(null);

      await fetchStudents();
    } catch (error) {
      console.error("Gagal menonaktifkan siswa:", error);

      showToast(error?.message || "Gagal menonaktifkan data siswa.", {
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================
  // RESET PASSWORD HANDLERS
  // =========================================================
  const handleOpenResetModal = (student) => {
    setResetTarget(student);
    setCustomResetPassword("");
  };

  const handleConfirmReset = async () => {
    if (!resetTarget) return;
    const studentId = resetTarget.id_siswa || resetTarget.id;
    const studentName = resetTarget.nama_siswa || resetTarget.name || "Siswa";
    const username = resetTarget.username || "-";

    try {
      setIsResetting(true);
      const res = await studentService.resetPassword(
        studentId,
        customResetPassword.trim() || undefined,
      );

      const tempPassword = res.data?.tempPassword || res.tempPassword;
      setResetTarget(null);
      setCustomResetPassword("");
      setResetResult({
        name: studentName,
        username: username,
        tempPassword: tempPassword,
      });
      showToast(`Password untuk "${studentName}" berhasil direset!`, {
        tone: "success",
      });
    } catch (err) {
      console.error("Gagal mereset password siswa:", err);
      showToast(
        err.response?.data?.message || "Gagal mereset password siswa.",
        { tone: "error" },
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!resetResult?.tempPassword) return;
    navigator.clipboard.writeText(resetResult.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // =========================================================
  // BULK ACTION HELPERS & HANDLERS
  // =========================================================
  const allCurrentStudentIds = filteredStudents
    .map((s) => s.id_siswa || s.id)
    .filter(Boolean);

  const isAllSelected =
    allCurrentStudentIds.length > 0 &&
    allCurrentStudentIds.every((id) => selectedIds.has(id));

  const isIndeterminate =
    allCurrentStudentIds.some((id) => selectedIds.has(id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allCurrentStudentIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allCurrentStudentIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkActionClick = () => {
    if (selectedIds.size === 0) {
      showToast("Pilih minimal satu siswa terlebih dahulu.", {
        tone: "error",
      });
      return;
    }

    if (!bulkAction) {
      showToast("Pilih jenis aksi massal terlebih dahulu.", {
        tone: "error",
      });
      return;
    }

    if (bulkAction === "change_class") {
      if (!bulkTargetClass) {
        showToast("Pilih kelas tujuan terlebih dahulu.", {
          tone: "error",
        });
        return;
      }
      setBulkConfirmState({ open: true, action: "change_class" });
    } else if (bulkAction === "deactivate") {
      setBulkConfirmState({ open: true, action: "deactivate" });
    } else if (bulkAction === "activate") {
      setBulkConfirmState({ open: true, action: "activate" });
    }
  };

  const submitBulkChangeClass = async () => {
    setIsBulkProcessing(true);
    try {
      const studentIds = Array.from(selectedIds);
      const response = await studentService.bulkChangeClass(
        studentIds,
        Number(bulkTargetClass),
      );

      if (response && response.success === false) {
        showToast(response.message || "Gagal memindahkan kelas siswa.", {
          tone: "error",
        });
        return;
      }

      showToast(
        response?.message ||
          `${studentIds.length} siswa berhasil dipindahkan ke kelas baru!`,
        { tone: "success" },
      );

      setSelectedIds(new Set());
      setBulkAction("");
      setBulkTargetClass("");
      setBulkConfirmState({ open: false, action: null });

      await fetchStudents();
    } catch (error) {
      console.error("Gagal memindahkan kelas siswa:", error);
      showToast(
        error?.message || "Terjadi kesalahan saat memindahkan kelas siswa.",
        { tone: "error" },
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const submitBulkChangeStatus = async (statusValue) => {
    setIsBulkProcessing(true);
    try {
      const studentIds = Array.from(selectedIds);
      const response = await studentService.bulkChangeStatus(
        studentIds,
        statusValue,
      );

      if (response && response.success === false) {
        showToast(
          response.message ||
            `Gagal ${
              statusValue === 1 ? "mengaktifkan" : "menonaktifkan"
            } siswa.`,
          { tone: "error" },
        );
        return;
      }

      showToast(
        response?.message ||
          `${studentIds.length} siswa berhasil ${
            statusValue === 1 ? "diaktifkan" : "dinonaktifkan"
          }!`,
        { tone: "success" },
      );

      setSelectedIds(new Set());
      setBulkAction("");
      setBulkTargetClass("");
      setBulkConfirmState({ open: false, action: null });

      await fetchStudents();
    } catch (error) {
      console.error("Gagal mengubah status siswa:", error);
      showToast(
        error?.message || "Terjadi kesalahan saat mengubah status siswa.",
        { tone: "error" },
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleConfirmBulkAction = async () => {
    if (bulkConfirmState.action === "change_class") {
      await submitBulkChangeClass();
    } else if (bulkConfirmState.action === "deactivate") {
      await submitBulkChangeStatus(0);
    } else if (bulkConfirmState.action === "activate") {
      await submitBulkChangeStatus(1);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <PageContainer
      title="Data Siswa"
      description="Kelola informasi siswa, pembagian kelas, dan status keaktifan dalam sistem absensi."
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={() => {
              fetchStudents(page, limit);
              fetchClasses();
            }}
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
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Daftar Peserta Didik
              </h2>

              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Menampilkan {filteredStudents.length} dari total{" "}
                {pagination.totalItems || students.length} siswa
                {debouncedSearch && (
                  <span className="ml-1 text-brand-500">
                    untuk &ldquo;{debouncedSearch}&rdquo;
                  </span>
                )}
              </p>
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

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama siswa atau kelas..."
            />
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              disabled={loadingClasses}
              aria-label="Filter berdasarkan kelas"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="">Semua kelas</option>
              {classes.map((classItem) => (
                <option
                  key={classItem.id_kelas}
                  value={String(classItem.id_kelas)}
                >
                  Kelas {classItem.tingkat} - {classItem.nama_kelas}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              BULK ACTION TOOLBAR (DI ATAS TABEL SISWA)
          ================================================= */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-colors dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aksi Massal:
              </span>

              {/* SELECT OPTION AKSI */}
              <select
                id="bulk-action-select"
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value);
                  if (e.target.value !== "change_class") {
                    setBulkTargetClass("");
                  }
                }}
                disabled={isBulkProcessing}
                aria-label="Pilih aksi massal"
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">-- Pilih Aksi Massal --</option>
                <option value="change_class">Ganti / Pindah Kelas</option>
                <option value="deactivate">Nonaktifkan Siswa</option>
                <option value="activate">Aktifkan Siswa</option>
              </select>

              {/* SELECT OPTION KELAS TUJUAN (JIKA GANTI KELAS) */}
              {bulkAction === "change_class" && (
                <select
                  id="bulk-target-class-select"
                  value={bulkTargetClass}
                  onChange={(e) => setBulkTargetClass(e.target.value)}
                  disabled={isBulkProcessing || loadingClasses}
                  aria-label="Pilih kelas tujuan"
                  className="h-9 rounded-lg border border-brand-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-brand-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">-- Pilih Kelas Tujuan --</option>
                  {classes.map((c) => (
                    <option key={c.id_kelas} value={c.id_kelas}>
                      {formatClassOption(c)}
                    </option>
                  ))}
                </select>
              )}

              {/* TOMBOL TERAPKAN */}
              <Button
                variant="primary"
                size="sm"
                disabled={
                  selectedIds.size === 0 ||
                  !bulkAction ||
                  (bulkAction === "change_class" && !bulkTargetClass) ||
                  isBulkProcessing
                }
                isLoading={isBulkProcessing}
                onClick={handleBulkActionClick}
              >
                Terapkan {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
              </Button>

              {/* TOMBOL BATAL PILIH */}
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds(new Set());
                    setBulkAction("");
                    setBulkTargetClass("");
                  }}
                  disabled={isBulkProcessing}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
                >
                  Batal Pilih
                </button>
              )}
            </div>

            {/* STATUS PILIHAN */}
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600 dark:bg-brand-400"></span>
                  {selectedIds.size} siswa dipilih
                </span>
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Centang checkbox di sebelah kiri kolom nomor untuk memilih siswa
                </span>
              )}
            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

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
                <table className="w-full min-w-[650px] text-left text-sm">
                  {/* TABLE HEADER */}
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                      {/* CHECKBOX (SEBELAH KIRI KOLOM NOMOR) */}
                      <th className="w-10 px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          aria-label="Pilih semua siswa di halaman ini"
                          title="Pilih semua siswa di halaman ini"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-brand-600 transition-all dark:border-slate-600"
                        />
                      </th>

                      <th className="w-12 px-4 py-3.5 text-center">No</th>

                      <th className="px-4 py-3.5">Nama Siswa</th>

                      <th className="px-4 py-3.5">Gender</th>

                      <th className="px-4 py-3.5">Username</th>

                      <th className="px-4 py-3.5">Kelas</th>

                      <th className="px-4 py-3.5 text-center">Status</th>

                      <th className="w-28 px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.map((student, index) => {
                      const studentId = student.id_siswa || student.id;
                      const isSelected = selectedIds.has(studentId);
                      const isActive = Number(student.status_aktif ?? 1) === 1;

                      const kelasDisplay = student.tingkat
                        ? `Kelas ${student.tingkat} - ${
                            student.nama_kelas || ""
                          }`.trim()
                        : student.nama_kelas || student.className || "-";

                      const studentName =
                        student.nama_siswa || student.name || "-";

                      return (
                        <tr
                          key={studentId || index}
                          className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 ${
                            isSelected
                              ? "bg-brand-50/50 dark:bg-brand-950/25"
                              : ""
                          }`}
                        >
                          {/* CHECKBOX (SEBELAH KIRI KOLOM NOMOR) */}
                          <td className="w-10 px-3 py-3.5 text-center">
                            <input
                              type="checkbox"
                              aria-label={`Pilih ${studentName}`}
                              checked={isSelected}
                              onChange={() => toggleSelectRow(studentId)}
                              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-brand-600 transition-all dark:border-slate-600"
                            />
                          </td>

                          {/* NO */}
                          <td className="px-4 py-3.5 text-center font-medium text-slate-400">
                            {(page - 1) * limit + index + 1}
                          </td>

                          {/* NAMA */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900">
                                {studentName.charAt(0).toUpperCase()}
                              </div>

                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {studentName}
                              </span>
                            </div>
                          </td>

                          {/* JENIS KELAMIN */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full ${student.jenis_kelamin === "Laki-laki" ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300" : "bg-pink-100 text-pink-700 dark:bg-pink-800 dark:text-pink-300"} px-2.5 py-1 text-xs font-medium`}
                            >
                              {student.jenis_kelamin
                                ? student.jenis_kelamin
                                : "-"}
                            </span>
                          </td>

                          {/* USERNAME */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              @{student.username}
                            </span>
                          </td>

                          {/* KELAS */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {kelasDisplay}
                            </span>
                          </td>

                          {/* STATUS */}
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

                          {/* AKSI */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* EDIT */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(student)}
                                title="Edit Data Siswa"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300"
                                aria-label={`Edit ${studentName}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* RESET PASSWORD */}
                              <button
                                type="button"
                                onClick={() => handleOpenResetModal(student)}
                                disabled={!isActive}
                                title={
                                  isActive
                                    ? "Reset Password Siswa"
                                    : "Siswa sudah dinonaktifkan"
                                }
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all active:scale-95 ${
                                  isActive
                                    ? "border-slate-200 bg-white text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:border-amber-700 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
                                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-600"
                                }`}
                                aria-label={`Reset password ${studentName}`}
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>

                              {/* NONAKTIFKAN */}
                              <button
                                type="button"
                                onClick={() => handlePromptDelete(student)}
                                disabled={!isActive}
                                title={
                                  isActive
                                    ? "Nonaktifkan Siswa"
                                    : "Siswa sudah dinonaktifkan"
                                }
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all active:scale-95 ${
                                  isActive
                                    ? "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-800 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-600"
                                }`}
                                aria-label={`Nonaktifkan ${studentName}`}
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

          {/* Pagination Bar */}
          {!loading && students.length > 0 && (
            <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Tampilkan</span>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value={5}>5 per halaman</option>
                  <option value={10}>10 per halaman</option>
                  <option value={20}>20 per halaman</option>
                  <option value={50}>50 per halaman</option>
                </select>
                <span>
                  Menampilkan{" "}
                  {pagination.totalItems === 0 ? 0 : (page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, pagination.totalItems || 0)} dari{" "}
                  {pagination.totalItems || 0} data
                </span>
              </div>

              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage || page === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrevPage || page === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {renderPageNumbers()}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={
                    !pagination.hasNextPage ||
                    page >= (pagination.totalPage || pagination.totalPages || 1)
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      pagination.totalPage || pagination.totalPages || 1,
                    )
                  }
                  disabled={
                    !pagination.hasNextPage ||
                    page >= (pagination.totalPage || pagination.totalPages || 1)
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* =====================================================
          MODAL TAMBAH / EDIT SISWA
      ===================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-slide-up dark:border-slate-800 dark:bg-slate-900"
          >
            {/* MODAL HEADER */}
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
                      ? "Perbarui username, nama lengkap siswa, dan kelas."
                      : "Lengkapi data akun dan kelas siswa."}
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

            {/* ERROR */}
            {formError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                {formError}
              </div>
            )}

            {/* FORM */}
            {isLoadingDetail ? (
              <div className="py-12">
                <Loading label="Memuat data detail siswa..." />
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
                {/* NAMA */}
                <Input
                  label="Nama Lengkap Siswa"
                  name="nama_siswa"
                  icon={User}
                  value={formData.nama_siswa}
                  onChange={handleInputChange}
                  placeholder="Contoh: Ahmad Fadilah"
                  required
                />

                <div>
                  <label
                    htmlFor="student-gender"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="student-gender"
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin}
                    onChange={handleInputChange}
                    required
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- Pilih Gender --</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* USERNAME */}
                <Input
                  label="Username Akun"
                  name="username"
                  icon={AtSign}
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username digenerate otomatis"
                  required
                />

                {/* KELAS */}
                <div>
                  <label
                    htmlFor="id_kelas"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Kelas <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <School
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />

                    <select
                      id="id_kelas"
                      name="id_kelas"
                      value={formData.id_kelas}
                      onChange={handleInputChange}
                      required
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="">
                        {loadingClasses
                          ? "Memuat daftar kelas..."
                          : "-- Pilih Kelas --"}
                      </option>

                      {classes.map((kelasItem) => {
                        return (
                          <option
                            key={kelasItem.id_kelas}
                            value={kelasItem.id_kelas}
                          >
                            {formatClassOption(kelasItem)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* PASSWORD */}
                <Input
                  label={`Password ${isEditMode ? "(Opsional)" : ""}`}
                  name="password"
                  type="password"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    isEditMode
                      ? "Kosongkan jika tidak ingin mengubah password"
                      : "Password digenerate otomatis"
                  }
                  required={!isEditMode}
                />

                {/* ACTION */}
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
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRM NONAKTIFKAN
      ===================================================== */}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Nonaktifkan Siswa?"
        description={`Apakah Anda yakin ingin menonaktifkan siswa "${
          deleteTarget?.nama_siswa || deleteTarget?.name || ""
        }"?`}
        confirmLabel="Ya, Nonaktifkan"
        cancelLabel="Batal"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* =====================================================
          CONFIRM BULK ACTION
      ===================================================== */}
      <ConfirmDialog
        open={Boolean(bulkConfirmState.open)}
        title={
          bulkConfirmState.action === "deactivate"
            ? `Nonaktifkan ${selectedIds.size} Siswa?`
            : bulkConfirmState.action === "activate"
            ? `Aktifkan ${selectedIds.size} Siswa?`
            : "Pindahkan Kelas Siswa?"
        }
        description={
          bulkConfirmState.action === "deactivate"
            ? `Apakah Anda yakin ingin menonaktifkan ${selectedIds.size} siswa yang dipilih? Siswa yang dinonaktifkan tidak akan bisa login ke sistem.`
            : bulkConfirmState.action === "activate"
            ? `Apakah Anda yakin ingin mengaktifkan kembali ${selectedIds.size} siswa yang dipilih?`
            : `Apakah Anda yakin ingin memindahkan ${selectedIds.size} siswa yang dipilih ke ${
                (() => {
                  const targetCls = classes.find(
                    (c) => String(c.id_kelas) === String(bulkTargetClass)
                  );
                  return targetCls
                    ? formatClassOption(targetCls)
                    : "kelas tujuan";
                })()
              }?`
        }
        confirmLabel={
          bulkConfirmState.action === "deactivate"
            ? "Ya, Nonaktifkan Semua"
            : bulkConfirmState.action === "activate"
            ? "Ya, Aktifkan Semua"
            : "Ya, Pindahkan Kelas"
        }
        cancelLabel="Batal"
        tone={bulkConfirmState.action === "deactivate" ? "danger" : "primary"}
        isLoading={isBulkProcessing}
        onConfirm={handleConfirmBulkAction}
        onCancel={() => setBulkConfirmState({ open: false, action: null })}
      />

      {/* =====================================================
          MODAL RESET PASSWORD SISWA (KONFIRMASI)
      ===================================================== */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-slide-up dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-900">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Reset Password Siswa
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Reset password akun siswa{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {resetTarget.nama_siswa || resetTarget.name}
                  </span>{" "}
                  (@{resetTarget.username}).
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-amber-50/70 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Siswa akan menerima password sementara dan wajib menggantinya saat pertama kali login.
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password Sementara (Opsional)
              </label>
              <Input
                type="text"
                value={customResetPassword}
                onChange={(e) => setCustomResetPassword(e.target.value)}
                placeholder="Kosongkan untuk otomatis (cth: smp4#budi)"
                icon={Lock}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Jika diisi, minimal 6 karakter. Jika dikosongkan, default: smp4#(nama depan).
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                variant="secondary"
                onClick={() => {
                  setResetTarget(null);
                  setCustomResetPassword("");
                }}
                disabled={isResetting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReset}
                isLoading={isResetting}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL HASIL RESET PASSWORD SISWA
      ===================================================== */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-slide-up dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-900">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Password Berhasil Direset!
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Password untuk{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {resetResult.name}
                  </span>{" "}
                  telah direset. Berikan informasi login ini kepada siswa:
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Username:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  @{resetResult.username}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-3 dark:border-slate-700/60">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Password Sementara:</div>
                  <div className="mt-0.5 font-mono text-base font-bold tracking-wider text-brand-600 dark:text-brand-400 select-all">
                    {resetResult.tempPassword}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={copied ? "primary" : "secondary"}
                  icon={copied ? Check : Copy}
                  onClick={handleCopyPassword}
                >
                  {copied ? "Tersalin!" : "Salin"}
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50/70 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              💡 Siswa akan diminta langsung mengganti password ini setelah berhasil login.
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setResetResult(null);
                  setCopied(false);
                }}
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
