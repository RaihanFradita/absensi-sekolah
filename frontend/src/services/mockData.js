// ============================================================================
// DATA SEMENTARA — HANYA UNTUK MODE PRATINJAU (MOCK LOGIN)
// ----------------------------------------------------------------------------
// File ini TIDAK dipakai sama sekali kecuali user login lewat tombol
// "Coba tanpa backend" di halaman Login (lihat src/pages/auth/Login.jsx).
// Begitu backend sungguhan tersedia, mode ini bisa diabaikan/dihapus tanpa
// menyentuh alur login & fetching data yang asli (authService, attendanceService).
// ============================================================================

import { ROLES, ATTENDANCE_STATUS } from '../utils/constants';

export const MOCK_MODE_KEY = 'schoolattend_mock_mode';

export function isMockMode() {
  return localStorage.getItem(MOCK_MODE_KEY) === '1';
}

export function setMockMode(value) {
  if (value) {
    localStorage.setItem(MOCK_MODE_KEY, '1');
  } else {
    localStorage.removeItem(MOCK_MODE_KEY);
  }
}

// Jeda buatan supaya loading state juga kelihatan realistis di mode pratinjau.
export function mockDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MOCK_USERS = {
  [ROLES.STUDENT]: {
    id: 'u-student-1',
    name: 'Raihan Pratama',
    role: ROLES.STUDENT,
    nis: '2425100123',
    nisn: '0091234567',
    className: 'VIII-A',
  },
  [ROLES.TEACHER]: { id: 'u-teacher-1', name: 'Ibu Siti Aminah, S.Pd', role: ROLES.TEACHER },
  [ROLES.ADMIN]: { id: 'u-admin-1', name: 'Admin Sekolah', role: ROLES.ADMIN },
};

function todayAt(hour, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ---------- Student ----------

export function getMockStudentDashboard() {
  return {
    student: { name: MOCK_USERS.student.name, nis: MOCK_USERS.student.nis, className: 'VIII-A' },
    today: { present: 3, late: 1, absent: 0 },
    activeSession: {
      subject: 'Matematika',
      className: 'VIII-A',
      endsAt: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
    },
    recentHistory: [
      { id: 1, date: todayAt(7, 5), subject: 'Matematika', time: '07:05', status: ATTENDANCE_STATUS.PRESENT },
      { id: 2, date: todayAt(9, 12), subject: 'Bahasa Indonesia', time: '09:12', status: ATTENDANCE_STATUS.LATE },
      { id: 3, date: todayAt(10, 30), subject: 'IPA', time: '10:30', status: ATTENDANCE_STATUS.PRESENT },
    ],
  };
}

const MOCK_HISTORY_ROWS = [
  { id: 1, date: todayAt(7, 5), subject: 'Matematika', time: '07:05', status: ATTENDANCE_STATUS.PRESENT },
  { id: 2, date: todayAt(9, 12), subject: 'Bahasa Indonesia', time: '09:12', status: ATTENDANCE_STATUS.LATE },
  { id: 3, date: todayAt(10, 30), subject: 'IPA', time: '10:30', status: ATTENDANCE_STATUS.PRESENT },
  { id: 4, date: todayAt(13, 0), subject: 'IPS', time: '13:00', status: ATTENDANCE_STATUS.PRESENT },
  { id: 5, date: todayAt(7, 2), subject: 'Bahasa Inggris', time: '07:02', status: ATTENDANCE_STATUS.PRESENT },
];

// Rekap kehadiran per mata pelajaran untuk halaman Profil Siswa.
const MOCK_SUBJECT_RECAP = [
  { subject: 'Matematika', present: 18, late: 2, absent: 1 },
  { subject: 'Bahasa Indonesia', present: 19, late: 0, absent: 2 },
  { subject: 'IPA', present: 20, late: 1, absent: 0 },
  { subject: 'IPS', present: 17, late: 3, absent: 1 },
  { subject: 'Bahasa Inggris', present: 21, late: 0, absent: 0 },
  { subject: 'Pendidikan Agama', present: 16, late: 1, absent: 4 },
];

export function getMockStudentProfile() {
  const student = MOCK_USERS[ROLES.STUDENT];
  return {
    student: {
      name: student.name,
      nisn: student.nisn,
      className: student.className,
    },
    subjectRecap: MOCK_SUBJECT_RECAP.map((row, i) => ({
      id: i + 1,
      ...row,
      total: row.present + row.late + row.absent,
    })),
  };
}

export function getMockAttendanceHistory({ page = 1, pageSize = 10 } = {}) {
  const start = (page - 1) * pageSize;
  return {
    rows: MOCK_HISTORY_ROWS.slice(start, start + pageSize),
    total: MOCK_HISTORY_ROWS.length,
    page,
    pageSize,
  };
}

// ---------- Teacher ----------

export function getMockTeacherDashboard() {
  return {
    teacher: { name: MOCK_USERS.teacher.name },
    todaySchedule: [
      { id: 1, subject: 'Matematika', className: 'VIII-A', startTime: todayAt(7, 0), endTime: todayAt(8, 30) },
      { id: 2, subject: 'Matematika', className: 'VIII-B', startTime: todayAt(8, 30), endTime: todayAt(10, 0) },
      { id: 3, subject: 'Matematika', className: 'IX-A', startTime: todayAt(10, 15), endTime: todayAt(11, 45) },
    ],
    activeSession: {
      id: 'sess-mock-1',
      subject: 'Matematika',
      className: 'VIII-A',
      presentCount: 24,
      lateCount: 2,
      notYetCount: 6,
    },
  };
}

export function getMockActiveSession() {
  return {
    id: 'sess-mock-1',
    subject: 'Matematika',
    className: 'VIII-A',
    teacherName: MOCK_USERS.teacher.name,
    startsAt: todayAt(7, 0),
    endsAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    qrToken: 'MOCK-SESSION-TOKEN-sess-mock-1',
    presentCount: 24,
    lateCount: 2,
    notYetCount: 6,
  };
}

const MOCK_STUDENT_NAMES = ['Raihan', 'Keysa', 'Fajar', 'Nadia', 'Bintang', 'Aulia', 'Dimas', 'Salsa'];

function randomMockEvent(i) {
  const name = MOCK_STUDENT_NAMES[i % MOCK_STUDENT_NAMES.length];
  return {
    id: `evt-${Date.now()}-${i}`,
    student: { name, nis: `24251001${10 + i}`, className: 'VIII-A' },
    subject: 'Matematika',
    time: new Date().toISOString(),
    status: i % 5 === 0 ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT,
  };
}

export function getMockAttendanceMonitor() {
  const events = Array.from({ length: 5 }, (_, i) => randomMockEvent(i)).reverse();
  return {
    events,
    presentCount: events.filter((e) => e.status === ATTENDANCE_STATUS.PRESENT).length,
    lateCount: events.filter((e) => e.status === ATTENDANCE_STATUS.LATE).length,
  };
}

// Dipakai useWebSocket versi mock untuk mensimulasikan siswa scan QR
// secara berkala, supaya AttendanceMonitor & AttendanceSession tetap
// terasa "live" walau tidak ada server WebSocket sungguhan.
export function generateMockAttendanceEvent(counter) {
  const event = randomMockEvent(counter);
  return {
    event: 'attendance_created',
    student: event.student,
    subject: event.subject,
    time: event.time,
    status: event.status,
  };
}
