import api from "./api";
import { ATTENDANCE_STATUS } from "../utils/constants";

/**
 * Normalizes attendance status from backend format to frontend canonical status.
 */
export function mapStatusToCanonical(status) {
  const s = String(status || "").toLowerCase().trim();
  switch (s) {
    case "hadir":
    case "present":
      return ATTENDANCE_STATUS.PRESENT;
    case "terlambat":
    case "late":
      return ATTENDANCE_STATUS.LATE;
    case "sakit":
    case "sick":
      return ATTENDANCE_STATUS.SICK;
    case "izin":
    case "excused":
      return ATTENDANCE_STATUS.EXCUSED;
    case "tanpa keterangan":
    case "tidak hadir":
    case "tidak_hadir":
    case "alpa":
    case "alpha":
    case "absent":
      return ATTENDANCE_STATUS.ABSENT;
    case "belum absen":
    case "belum_absen":
    case "not_yet":
    default:
      return ATTENDANCE_STATUS.NOT_YET;
  }
}

/**
 * Formats time string (either ISO timestamp, YYYY-MM-DD HH:mm:ss, or HH:mm:ss) to HH:mm
 */
export function formatScanTime(timeStr) {
  if (!timeStr) return "-";
  try {
    if (typeof timeStr === "string" && (timeStr.includes("T") || timeStr.includes("-"))) {
      const d = new Date(timeStr);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    // If format is "07:15:00" or similar
    if (typeof timeStr === "string" && timeStr.length >= 5) {
      return timeStr.slice(0, 5);
    }
  } catch {
    // fallback
  }
  return String(timeStr);
}

/**
 * Adapts backend attendance row to frontend shape expected by DailyAttendanceManager & table components.
 */
export function adaptPicketAttendanceRow(row) {
  const currentStatus = mapStatusToCanonical(row.status);
  const scanTimeLabel = formatScanTime(row.waktu_scan);

  return {
    ...row,
    id: row.id_absensi || `s-${row.id_siswa}`,
    student: {
      id: row.id_siswa,
      name: row.nama_siswa,
      className: row.nama_kelas,
    },
    currentStatus,
    scanTimeLabel,
    note: row.keterangan || "",
  };
}

export const picketTeacherService = {
  /**
   * Mengambil data ringkasan dashboard piket & daftar kelas aktif
   * @param {{ date?: string, className?: string }} params
   */
  async getDashboard(params = {}) {
    const response = await api.get("/picket-teacher/dashboard", { params });
    return response.data;
  },

  /**
   * Mengambil data rekap kehadiran harian seluruh siswa
   * @param {{ date?: string, className?: string }} params
   */
  async getDaily(params = {}) {
    const response = await api.get("/picket-teacher/daily", { params });
    const rawRows = response.data?.rows || [];
    return {
      date: response.data?.date,
      rows: rawRows.map(adaptPicketAttendanceRow),
      rawRows,
    };
  },

  /**
   * Ekspor rekap kehadiran siswa ke CSV format Excel (dengan BOM UTF-8)
   */
  exportToCsv({ date, className, rows = [] }) {
    const headers = [
      "No",
      "Nama Siswa",
      "Kelas",
      "Jam Scan",
      "Status Kehadiran",
      "Keterangan",
    ];

    const STATUS_TEXT = {
      present: "Hadir",
      late: "Terlambat",
      sick: "Sakit",
      excused: "Izin",
      absent: "Tanpa Keterangan",
      not_yet: "Belum Absen",
    };

    const lines = rows.map((r, i) => [
      i + 1,
      r.nama_siswa || r.student?.name || "-",
      r.nama_kelas || r.student?.className || "-",
      r.scanTimeLabel || r.waktu_scan || "-",
      STATUS_TEXT[r.currentStatus] || r.status || "Belum Absen",
      r.note || r.keterangan || "-",
    ]);

    const csvContent =
      "\ufeff" +
      [headers, ...lines]
        .map((row) =>
          row
            .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const classSuffix = className ? `_Kelas_${className}` : "_Semua_Kelas";
    link.href = url;
    link.download = `Rekap_Piket_${date || new Date().toISOString().slice(0, 10)}${classSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default picketTeacherService;
