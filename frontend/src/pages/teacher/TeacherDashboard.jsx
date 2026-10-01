import { useCallback, useEffect, useState } from "react";
import PageContainer from "../../components/layout/PageContainer";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import DailyAttendanceManager from "../../components/attendance/DailyAttendanceManager";
import useAuth from "../../hooks/useAuth";
import attendanceService from "../../services/attendanceService";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const dashboard =
        await attendanceService.getTeacherDashboard({
          date,
        });

      setData(dashboard);
    } catch (e) {
      console.error("TeacherDashboard:", e);

      setError(
        e?.message ||
          "Gagal memuat data dashboard guru."
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(id, payload) {
    try {
      await attendanceService.updateAttendanceStatus(
        id,
        payload
      );

      await load();
    } catch (error) {
      console.error(
        "Gagal mengubah status kehadiran:",
        error
      );

      throw error;
    }
  }

  async function exportExcel() {
    setExporting(true);

    try {
      const file =
        await attendanceService.exportAttendanceExcel({
          date,
          className:
            data?.class?.nama_kelas || "",
        });

      attendanceService.downloadBlob(file);
    } catch (error) {
      console.error(
        "Gagal export Excel:",
        error
      );
    } finally {
      setExporting(false);
    }
  }

  const rows =
    data?.students?.map((student) => ({
      id: student.id_siswa,

      date,

      studentId: student.id_siswa,

      scanTime: student.waktu_absen,

      initialStatus: student.status,

      currentStatus: student.status,

      note: "",

      changedAt: null,

      changedBy: null,

      student: {
        id: student.id_siswa,
        nis: null,
        nisn: null,
        name: student.nama_siswa,
        className:
          data?.class?.nama_kelas || "",
      },

      scanTimeLabel: student.waktu_absen
        ? new Date(
            student.waktu_absen
          ).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
    })) || [];

  return (
    <PageContainer
      title={`Halo, ${
        user?.name || data?.teacher?.nama_guru || "Guru Kelas"
      }`}
      description={
        data?.class
          ? `Rekap kehadiran kelas ${data.class.nama_kelas}.`
          : "Rekap kehadiran harian kelas yang menjadi tanggung jawab Anda."
      }
    >
      {loading && (
        <Loading label="Memuat rekap kelas..." />
      )}

      {!loading && error && (
        <EmptyState
          title="Gagal memuat data"
          description={error}
          action={
            <Button onClick={load}>
              Coba Lagi
            </Button>
          }
        />
      )}

      {!loading && !error && data && (
        <>
          {!data.class ? (
            <EmptyState
              title="Belum ada kelas"
              description="Guru ini belum memiliki kelas yang ditugaskan."
            />
          ) : (
            <DailyAttendanceManager
              title={`Rekap Kehadiran ${data.class.nama_kelas}`}
              subtitle="Klik kartu status untuk melihat nama siswa dalam kategori tersebut."
              rows={rows}
              date={date}
              setDate={setDate}
              classes={[
                data.class.nama_kelas,
              ]}
              className={data.class.nama_kelas}
              setClassName={() => {}}
              canEdit
              onUpdate={update}
              onExport={exportExcel}
              exporting={exporting}
              currentUserName={
                user?.name ||
                data?.teacher?.nama_guru
              }
            />
          )}
        </>
      )}
    </PageContainer>
  );
}