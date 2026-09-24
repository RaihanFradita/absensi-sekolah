import api from "./api";
import {
  isMockMode,
  mockDelay,
  getMockStudentDashboard,
  getMockStudentProfile,
  getMockAttendanceHistory,
  getMockTeacherDashboard,
  getMockDutyDashboard,
  getMockActiveSession,
  getMockAttendanceMonitor,
  getMockAttendanceRows,
  updateMockAttendanceStatus,
  MOCK_USERS,
  MOCK_DUTY_SCHEDULES,
} from "./mockData";
import { ATTENDANCE_STATUS, ROLES } from "../utils/constants";

const ENDPOINTS = {
  STUDENT_DASHBOARD: "/students/dashboard",
  STUDENT_PROFILE: "/students/profile",
  SCAN_ATTENDANCE: "/attendance/scan",
  ATTENDANCE_HISTORY: "/students/attendance-history",
  TEACHER_DASHBOARD: "/teacher/dashboard",
  DUTY_DASHBOARD: "/duty/dashboard",
  ATTENDANCE_DAILY: "/attendance/daily",
  UPDATE_STATUS: (id) => `/attendance/${id}/status`,
  EXPORT_EXCEL: "/attendance/export.xlsx",
  CREATE_SESSION: "/attendance/sessions/add",
  ACTIVE_SESSION: "/attendance/sessions/active",
  END_SESSION: (id) => `/attendance/sessions/${id}/end`,
  MONITOR: (id) => `/attendance/sessions/${id}/monitor`,
  DUTY_SCHEDULES: "/duty-schedules",
};

async function getStudentDashboard() {
  if (isMockMode()) {
    await mockDelay();
    return getMockStudentDashboard();
  }
  return (await api.get(ENDPOINTS.STUDENT_DASHBOARD)).data;
}
async function getStudentProfile() {
  if (isMockMode()) {
    await mockDelay();
    return getMockStudentProfile();
  }
  return (await api.get(ENDPOINTS.STUDENT_PROFILE)).data;
}
async function getAttendanceHistory(params = {}) {
  if (isMockMode()) {
    await mockDelay();
    return getMockAttendanceHistory(params);
  }
  return (await api.get(ENDPOINTS.ATTENDANCE_HISTORY, { params })).data;
}

async function scanAttendance({ sessionToken }) {
  if (isMockMode()) {
    await mockDelay(650);
    const session = getMockActiveSession();
    if (new Date() > new Date(session.endsAt))
      throw new Error("Sesi absensi sudah berakhir.");
    if (sessionToken && sessionToken !== session.qrToken)
      throw new Error("QR Code tidak valid atau sudah kedaluwarsa.");
    const today = new Date().toISOString().slice(0, 10);
    const key = `schoolattend_daily_scan_${MOCK_USERS[ROLES.STUDENT].id}_${today}`;
    if (localStorage.getItem(key)) {
      const e = new Error("Anda sudah melakukan absensi hari ini.");
      e.raw = { response: { data: { reason: "already_scanned" } } };
      throw e;
    }
    const scannedAt = new Date().toISOString();
    localStorage.setItem(key, scannedAt);
    return {
      status: ATTENDANCE_STATUS.PRESENT,
      initialStatus: ATTENDANCE_STATUS.PRESENT,
      currentStatus: ATTENDANCE_STATUS.PRESENT,
      studentName: MOCK_USERS.student.name,
      className: MOCK_USERS.student.className,
      scannedAt,
    };
  }
  return (await api.post(ENDPOINTS.SCAN_ATTENDANCE, { sessionToken })).data;
}

async function getTeacherDashboard(params = {}) {
  if (isMockMode()) {
    await mockDelay();
    return getMockTeacherDashboard();
  }
  return (await api.get(ENDPOINTS.TEACHER_DASHBOARD, { params })).data;
}
async function getDutyDashboard(params = {}) {
  if (isMockMode()) {
    await mockDelay();
    return getMockDutyDashboard();
  }
  return (await api.get(ENDPOINTS.DUTY_DASHBOARD, { params })).data;
}
async function getDailyAttendance(params = {}) {
  if (isMockMode()) {
    await mockDelay();
    return { rows: getMockAttendanceRows(params) };
  }
  return (await api.get(ENDPOINTS.ATTENDANCE_DAILY, { params })).data;
}
async function updateAttendanceStatus(id, payload) {
  if (isMockMode()) {
    await mockDelay(300);
    return updateMockAttendanceStatus(id, payload);
  }
  return (await api.patch(ENDPOINTS.UPDATE_STATUS(id), payload)).data;
}

async function exportAttendanceExcel(params = {}) {
  if (isMockMode()) {
    await mockDelay(250);
    const rows = getMockAttendanceRows(params);
    const header = [
      "No",
      "NIS/NISN",
      "Nama siswa",
      "Kelas",
      "Tanggal absensi",
      "Jam scan",
      "Status akhir",
      "Keterangan",
      "Diubah oleh",
      "Waktu perubahan",
    ];
    const body = rows.map((r, i) => [
      i + 1,
      `${r.student.nis}/${r.student.nisn}`,
      r.student.name,
      r.student.className,
      r.date,
      r.scanTimeLabel,
      r.currentStatus,
      r.note || "",
      r.changedBy || "",
      r.changedAt || "",
    ]);
    const text =
      "\ufeff" +
      [header, ...body]
        .map((x) =>
          x.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","),
        )
        .join("\r\n");
    return {
      blob: new Blob([text], { type: "text/csv;charset=utf-8" }),
      fileName: `Rekap_Absensi_${new Date().toLocaleDateString("id-ID").replaceAll("/", "-")}.csv`,
      previewFallback: true,
    };
  }
  const response = await api.get(ENDPOINTS.EXPORT_EXCEL, {
    params,
    responseType: "blob",
  });
  const disposition = response.headers?.["content-disposition"] || "";
  const m = disposition.match(/filename="?([^";]+)"?/i);
  return {
    blob: response.data,
    fileName:
      m?.[1] ||
      `Rekap_Absensi_${new Date().toLocaleDateString("id-ID").replaceAll("/", "-")}.xlsx`,
    previewFallback: false,
  };
}
function downloadBlob({ blob, fileName }) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function createAttendanceSession(payload) {
  if (isMockMode()) {
    await mockDelay();
    return getMockActiveSession();
  }
  return (await api.post(ENDPOINTS.CREATE_SESSION, payload)).data;
}

function extractSessionPayload(payload) {
  return payload?.data ?? payload;
}

function hasSessionShape(payload) {
  if (!payload || typeof payload !== "object") return false;
  return Boolean(
    payload.id ||
    payload.id_sesi ||
    payload.attendanceDate ||
    payload.tanggal ||
    payload.startsAt ||
    payload.waktu_buka ||
    payload.endsAt ||
    payload.waktu_tutup,
  );
}

function hasMonitorShape(payload) {
  if (!payload || typeof payload !== "object") return false;
  return Boolean(
    Array.isArray(payload.events) ||
    typeof payload.presentCount === "number" ||
    typeof payload.lateCount === "number" ||
    typeof payload.notYetCount === "number",
  );
}

async function getActiveSession(kode_qr) {
  if (isMockMode()) {
    await mockDelay();
    return getMockActiveSession();
  }

  try {
    const response = await api.get(`${ENDPOINTS.ACTIVE_SESSION}/${kode_qr}`);
    const session = extractSessionPayload(response?.data);
    if (!hasSessionShape(session)) return getMockActiveSession();

    return {
      ...session,
      id: session.id ?? session.id_sesi,
      qrToken: session.qrToken ?? session.kode_qr,
      startsAt: session.startsAt ?? session.waktu_buka,
      endsAt: session.endsAt ?? session.waktu_tutup,
      attendanceDate: session.attendanceDate ?? session.tanggal,
      teacherName: session.teacherName ?? session.nama_guru ?? "Guru",
      presentCount: session.presentCount ?? 0,
      lateCount: session.lateCount ?? 0,
      notYetCount: session.notYetCount ?? 0,
    };
  } catch (error) {
    const statusCode = error?.response?.status || error?.status;
    if (statusCode === 404 || statusCode === 400) {
      return getMockActiveSession();
    }
    throw error;
  }
}
async function endAttendanceSession(id) {
  if (isMockMode()) {
    await mockDelay();
    return { id, endedAt: new Date().toISOString() };
  }
  return (await api.post(ENDPOINTS.END_SESSION(id))).data;
}
async function getAttendanceMonitor(id) {
  if (isMockMode()) {
    await mockDelay();
    return getMockAttendanceMonitor(id);
  }

  try {
    const response = await api.get(ENDPOINTS.MONITOR(id));
    const monitor = extractSessionPayload(response?.data);
    return hasMonitorShape(monitor) ? monitor : getMockAttendanceMonitor(id);
  } catch (error) {
    if (error?.status === 404 || error?.status === 400) {
      return getMockAttendanceMonitor(id);
    }
    throw error;
  }
}
async function getDutySchedules(params = {}) {
  if (isMockMode()) {
    await mockDelay();
    return { rows: MOCK_DUTY_SCHEDULES };
  }
  return (await api.get(ENDPOINTS.DUTY_SCHEDULES, { params })).data;
}
async function saveDutySchedule(payload) {
  if (isMockMode()) {
    await mockDelay();
    return { id: `d-${Date.now()}`, ...payload };
  }
  return (await api.post(ENDPOINTS.DUTY_SCHEDULES, payload)).data;
}

export default {
  getStudentDashboard,
  getStudentProfile,
  scanAttendance,
  getAttendanceHistory,
  getTeacherDashboard,
  getDutyDashboard,
  getDailyAttendance,
  updateAttendanceStatus,
  exportAttendanceExcel,
  downloadBlob,
  createAttendanceSession,
  getActiveSession,
  endAttendanceSession,
  getAttendanceMonitor,
  getDutySchedules,
  saveDutySchedule,
};
