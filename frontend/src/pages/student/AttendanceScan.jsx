import React, { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import attendanceService from "../../services/attendanceService";

function AttendanceScan() {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Mencegah API dipanggil dua kali
  // terutama saat React StrictMode aktif
  const hasScanned = useRef(false);

  const token = searchParams.get("token");

  const handleAttendance = async () => {
    try {
      setLoading(true);

      const response = await attendanceService.scanAttendance({
        kode_qr: token,
      });

      console.log("Response absensi:", response);

      setSuccess(true);
      setMessage(response.message || "Absensi berhasil dicatat.");
    } catch (error) {
      console.error("Gagal melakukan absensi:", error);

      setSuccess(false);

      setMessage(error?.response?.data?.message || "Absensi gagal dilakukan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Kalau token tidak ada
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage("Token QR tidak ditemukan.");
      return;
    }

    // Kalau sudah pernah melakukan request,
    // jangan kirim request lagi
    if (hasScanned.current) {
      return;
    }

    hasScanned.current = true;

    handleAttendance();
  }, [token]);

  return (
    <PageContainer
      title={
        loading
          ? "Memproses Absensi..."
          : success
            ? "Kehadiran Berhasil"
            : "Absensi Gagal"
      }
      description={loading ? "Sedang memproses data absensi kamu." : message}
      action={
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      }
    >
      {/* Loading */}
      {loading && (
        <div>
          <p>Memproses absensi...</p>
        </div>
      )}

      {/* Success */}
      {!loading && success && (
        <div>
          <h1>Absensi Berhasil</h1>

          <p>{message}</p>

          <p>Token: {token}</p>
        </div>
      )}

      {/* Error */}
      {!loading && !success && (
        <div>
          <h1>Absensi Gagal</h1>

          <p>{message}</p>
        </div>
      )}
    </PageContainer>
  );
}

export default AttendanceScan;
