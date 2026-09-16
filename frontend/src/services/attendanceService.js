import api from './api';
import {
  isMockMode,
  mockDelay,
  getMockStudentDashboard,
  getMockStudentProfile,
  getMockAttendanceHistory,
  getMockTeacherDashboard,
  getMockActiveSession,
  getMockAttendanceMonitor,
  MOCK_USERS,
} from './mockData';
import { ATTENDANCE_STATUS, ROLES } from '../utils/constants';

// Endpoint placeholder — mudah diubah menyesuaikan kontrak backend.
const ENDPOINTS = {
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  SCAN_ATTENDANCE: '/attendance/scan',
  ATTENDANCE_HISTORY: '/student/attendance-history',

  TEACHER_DASHBOARD: '/teacher/dashboard',
  CREATE_SESSION: '/attendance/sessions',
  ACTIVE_SESSION: '/attendance/sessions/active',
  END_SESSION: (sessionId) => `/attendance/sessions/${sessionId}/end`,
  ATTENDANCE_MONITOR: (sessionId) => `/attendance/sessions/${sessionId}/monitor`,
};

// ---------- Student ----------

async function getStudentDashboard() {
  if (isMockMode()) {
    await mockDelay();
    return getMockStudentDashboard();
  }
  const { data } = await api.get(ENDPOINTS.STUDENT_DASHBOARD);
  return data;
}

/**
 * Kirim hasil scan QR ke backend.
 * QR hanya membawa session token; identitas siswa diambil dari sesi login
 * (backend yang menentukan dari token Authorization), BUKAN dari body request.
 */
async function scanAttendance({ sessionToken }) {
  if (isMockMode()) {
    await mockDelay(800);
    // Di mode pratinjau, QR apa pun dianggap valid supaya alur bisa dicoba
    // end-to-end tanpa backend sungguhan.
    return {
      status: ATTENDANCE_STATUS.PRESENT,
      studentName: MOCK_USERS[ROLES.STUDENT].name,
      className: 'VIII-A',
      subject: 'Matematika',
      scannedAt: new Date().toISOString(),
      sessionToken,
    };
  }
  const { data } = await api.post(ENDPOINTS.SCAN_ATTENDANCE, { sessionToken });
  return data;
}

// Bentuk data yang diharapkan dari GET /student/profile:
// {
//   student: { name, nisn, className },
//   subjectRecap: [{ id, subject, present, late, absent, total }]
// }
async function getStudentProfile() {
  if (isMockMode()) {
    await mockDelay();
    return getMockStudentProfile();
  }
  const { data } = await api.get(ENDPOINTS.STUDENT_PROFILE);
  return data;
}

async function getAttendanceHistory({ page = 1, pageSize = 10, date, subject, status } = {}) {
  if (isMockMode()) {
    await mockDelay();
    return getMockAttendanceHistory({ page, pageSize, date, subject, status });
  }
  const { data } = await api.get(ENDPOINTS.ATTENDANCE_HISTORY, {
    params: { page, pageSize, date, subject, status },
  });
  return data;
}

// ---------- Teacher ----------

async function getTeacherDashboard() {
  if (isMockMode()) {
    await mockDelay();
    return getMockTeacherDashboard();
  }
  const { data } = await api.get(ENDPOINTS.TEACHER_DASHBOARD);
  return data;
}

async function createAttendanceSession({ classId, subjectId, scheduleId, durationMinutes, lateThresholdMinutes }) {
  if (isMockMode()) {
    await mockDelay(600);
    return getMockActiveSession();
  }
  const { data } = await api.post(ENDPOINTS.CREATE_SESSION, {
    classId,
    subjectId,
    scheduleId,
    durationMinutes,
    lateThresholdMinutes,
  });
  return data;
}

async function getActiveSession() {
  if (isMockMode()) {
    await mockDelay();
    return getMockActiveSession();
  }
  const { data } = await api.get(ENDPOINTS.ACTIVE_SESSION);
  return data;
}

async function endAttendanceSession(sessionId) {
  if (isMockMode()) {
    await mockDelay(500);
    return { id: sessionId, endedAt: new Date().toISOString() };
  }
  const { data } = await api.post(ENDPOINTS.END_SESSION(sessionId));
  return data;
}

async function getAttendanceMonitor(sessionId) {
  if (isMockMode()) {
    await mockDelay();
    return getMockAttendanceMonitor(sessionId);
  }
  const { data } = await api.get(ENDPOINTS.ATTENDANCE_MONITOR(sessionId));
  return data;
}

const attendanceService = {
  getStudentDashboard,
  getStudentProfile,
  scanAttendance,
  getAttendanceHistory,
  getTeacherDashboard,
  createAttendanceSession,
  getActiveSession,
  endAttendanceSession,
  getAttendanceMonitor,
};

export default attendanceService;
