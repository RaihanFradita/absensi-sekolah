import React from "react";
import PageContainer from "../../components/layout/PageContainer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function AttendanceScan() {
  return (
    <PageContainer
      title="Kehadiran Berhasil"
      description="Absensi kamu sudah berhasil dicatat untuk hari ini."
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
      <h1>Ini Halaman siswa berhasil scan</h1>
    </PageContainer>
  );
}

export default AttendanceScan;
