import { useCallback, useRef, useState } from "react";
import {
  IdCard,
  School,
  RefreshCw,
  Camera,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";

import useAttendance from "../../hooks/useAttendance";
import useAuth from "../../hooks/useAuth";
import attendanceService from "../../services/attendanceService";

import { PROFILE_PHOTO_KEY_PREFIX } from "../../utils/constants";

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;

export default function StudentProfile() {
  const { user } = useAuth();

  const fetchProfile = useCallback(
    () => attendanceService.getStudentProfile(),
    []
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useAttendance(fetchProfile);

  const photoKey = `${PROFILE_PHOTO_KEY_PREFIX}${user?.id || "guest"}`;

  const [photo, setPhoto] = useState(() =>
    localStorage.getItem(photoKey)
  );

  const [photoError, setPhotoError] = useState("");

  const fileInputRef = useRef(null);

  /*
   * Data dari backend:
   *
   * {
   *   success: true,
   *   student: {
   *     id_siswa: 4,
   *     id_user: 7,
   *     nis: "2607004",
   *     nama_siswa: "Raihan Fradita",
   *     id_kelas: 1,
   *     nama_kelas: "7A",
   *     tingkat: 7,
   *     tahun_ajaran: "2026/2027",
   *     status_aktif: 1,
   *     username: "raihan"
   *   }
   * }
   */

  const student = data?.student;

  /*
   * Summary akan kita gunakan ketika backend
   * sudah mengirim data ringkasan absensi.
   *
   * Contoh:
   *
   * summary: {
   *   present: 10,
   *   late: 2,
   *   absent: 1
   * }
   */
  const summary = data?.summary || {};

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("File harus berupa gambar.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError("Ukuran foto maksimal 2MB.");
      return;
    }

    setPhotoError("");

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      setPhoto(result);

      try {
        localStorage.setItem(photoKey, result);
      } catch {
        setPhotoError("Gagal menyimpan foto di perangkat.");
      }
    };

    reader.onerror = () => {
      setPhotoError("Gagal membaca foto.");
    };

    reader.readAsDataURL(file);
  }

  return (
    <PageContainer
      title="Profil Siswa"
      description="Informasi akun dan ringkasan kehadiran harian"
    >
      {/* Loading */}
      {isLoading && <Loading label="Memuat profil..." />}

      {/* Error */}
      {!isLoading && error && (
        <EmptyState
          title="Gagal memuat profil"
          description={error}
          action={
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={refetch}
            >
              Coba Lagi
            </Button>
          }
        />
      )}

      {/* Profile */}
      {!isLoading && !error && student && (
        <div className="space-y-6">
          {/* =========================
              INFORMASI PROFIL
          ========================== */}
          <Card>
            <div className="flex flex-wrap items-center gap-5">
              {/* Foto */}
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-2xl font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Foto profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    student.nama_siswa
                      ?.charAt(0)
                      ?.toUpperCase() || "S"
                  )}
                </div>

                {/* Tombol ganti foto */}
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="absolute bottom-0 right-0 rounded-full border border-white bg-slate-900 p-2 text-white shadow-sm dark:border-slate-950"
                  aria-label="Ganti foto profil"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>

                {/* Input file */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Informasi siswa */}
              <div>
                {/* Nama */}
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {student.nama_siswa || "-"}
                </h2>

                {/* NIS dan Kelas */}
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <IdCard className="h-4 w-4" />
                    NIS {student.nis || "-"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <School className="h-4 w-4" />
                    Kelas {student.nama_kelas || "-"}
                  </span>
                </div>

                {/* Tahun ajaran */}
                {student.tahun_ajaran && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Tahun Ajaran {student.tahun_ajaran}
                  </p>
                )}

                {/* Error foto */}
                {photoError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {photoError}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* =========================
              RINGKASAN KEHADIRAN
          ========================== */}
          <Card>
            <CardHeader
              title="Ringkasan Kehadiran"
              subtitle="Dihitung berdasarkan satu absensi per hari"
            />

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Hadir */}
              <SummaryItem
                icon={CheckCircle2}
                label="Hadir"
                value={summary.present ?? 0}
              />

              {/* Terlambat */}
              <SummaryItem
                icon={Clock}
                label="Terlambat"
                value={summary.late ?? 0}
              />

              {/* Tidak Hadir */}
              <SummaryItem
                icon={XCircle}
                label="Tidak Hadir"
                value={summary.absent ?? 0}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Data siswa tidak ditemukan */}
      {!isLoading && !error && !student && (
        <EmptyState
          title="Profil siswa tidak ditemukan"
          description="Data profil siswa tidak tersedia."
          action={
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={refetch}
            >
              Coba Lagi
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}

/* =================================
   COMPONENT RINGKASAN
================================= */

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />

        <span>{label}</span>
      </div>

      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}