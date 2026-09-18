import { ROLES, ATTENDANCE_STATUS } from "../utils/constants";

export const MOCK_MODE_KEY = "schoolattend_mock_mode";
export function isMockMode() {
  return localStorage.getItem(MOCK_MODE_KEY) === "1";
}
export function setMockMode(value) {
  value
    ? localStorage.setItem(MOCK_MODE_KEY, "1")
    : localStorage.removeItem(MOCK_MODE_KEY);
}
export function mockDelay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MOCK_USERS = {
  [ROLES.STUDENT]: {
    id: "u-student-1",
    name: "Raihan Pratama",
    role: ROLES.STUDENT,
    nis: "2425100123",
    nisn: "0091234567",
    className: "VIII-A",
  },
  [ROLES.TEACHER]: {
    id: "u-teacher-1",
    name: "Ibu Siti Aminah, S.Pd",
    role: ROLES.TEACHER,
    homeroomClass: "VIII-A",
  },
  [ROLES.DUTY_TEACHER]: {
    id: "u-duty-1",
    name: "Bapak Ahmad Fauzi, S.Pd",
    role: ROLES.DUTY_TEACHER,
    dutyDate: new Date().toISOString().slice(0, 10),
  },
  [ROLES.ADMIN]: { id: "u-admin-1", name: "Admin Sekolah", role: ROLES.ADMIN },
};

function todayAt(hour, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function dateKey(offset = 0) {
  const d = new Date(Date.now() - offset * 86400000);
  return d.toISOString().slice(0, 10);
}
function timeOf(iso) {
  return new Date(iso)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    .replace(".", ":");
}

export const MOCK_STUDENTS = [
  {
    id: "s1",
    nis: "2425100123",
    nisn: "0091234567",
    name: "Raihan Pratama",
    className: "VIII-A",
  },
  {
    id: "s2",
    nis: "2425100124",
    nisn: "0091234568",
    name: "Keysa Aulia",
    className: "VIII-A",
  },
  {
    id: "s3",
    nis: "2425100125",
    nisn: "0091234569",
    name: "Fajar Ramadhan",
    className: "VIII-A",
  },
  {
    id: "s4",
    nis: "2425100126",
    nisn: "0091234570",
    name: "Nadia Putri",
    className: "VIII-A",
  },
  {
    id: "s5",
    nis: "2425100127",
    nisn: "0091234571",
    name: "Bintang Akbar",
    className: "VIII-A",
  },
  {
    id: "s6",
    nis: "2425100128",
    nisn: "0091234572",
    name: "Dimas Saputra",
    className: "VIII-A",
  },
  {
    id: "s7",
    nis: "2425100201",
    nisn: "0091234601",
    name: "Salsa Nabila",
    className: "VIII-B",
  },
  {
    id: "s8",
    nis: "2425100202",
    nisn: "0091234602",
    name: "Aulia Rahma",
    className: "VIII-B",
  },
  {
    id: "s9",
    nis: "2425100301",
    nisn: "0091234701",
    name: "Raka Mahendra",
    className: "IX-A",
  },
  {
    id: "s10",
    nis: "2425100302",
    nisn: "0091234702",
    name: "Nisa Khairunnisa",
    className: "IX-A",
  },
];

const defaultAttendance = [
  {
    studentId: "s1",
    scanTime: todayAt(6, 45),
    initialStatus: ATTENDANCE_STATUS.PRESENT,
    currentStatus: ATTENDANCE_STATUS.PRESENT,
    note: "",
  },
  {
    studentId: "s2",
    scanTime: todayAt(6, 51),
    initialStatus: ATTENDANCE_STATUS.PRESENT,
    currentStatus: ATTENDANCE_STATUS.PRESENT,
    note: "",
  },
  {
    studentId: "s3",
    scanTime: todayAt(7, 12),
    initialStatus: ATTENDANCE_STATUS.PRESENT,
    currentStatus: ATTENDANCE_STATUS.LATE,
    note: "Scan melewati batas 07:00",
    changedAt: todayAt(7, 20),
    changedBy: "Ibu Siti Aminah, S.Pd",
  },
  {
    studentId: "s4",
    scanTime: null,
    initialStatus: null,
    currentStatus: ATTENDANCE_STATUS.EXCUSED,
    note: "Izin keperluan keluarga",
    changedAt: todayAt(7, 30),
    changedBy: "Bapak Ahmad Fauzi, S.Pd",
  },
  {
    studentId: "s5",
    scanTime: null,
    initialStatus: null,
    currentStatus: ATTENDANCE_STATUS.SICK,
    note: "Surat sakit diterima",
    changedAt: todayAt(7, 35),
    changedBy: "Bapak Ahmad Fauzi, S.Pd",
  },
  {
    studentId: "s6",
    scanTime: null,
    initialStatus: null,
    currentStatus: ATTENDANCE_STATUS.NOT_YET,
    note: "",
  },
  {
    studentId: "s7",
    scanTime: todayAt(6, 55),
    initialStatus: ATTENDANCE_STATUS.PRESENT,
    currentStatus: ATTENDANCE_STATUS.PRESENT,
    note: "",
  },
  {
    studentId: "s8",
    scanTime: null,
    initialStatus: null,
    currentStatus: ATTENDANCE_STATUS.ABSENT,
    note: "Tidak ada konfirmasi",
    changedAt: todayAt(8, 0),
    changedBy: "Bapak Ahmad Fauzi, S.Pd",
  },
  {
    studentId: "s9",
    scanTime: todayAt(6, 58),
    initialStatus: ATTENDANCE_STATUS.PRESENT,
    currentStatus: ATTENDANCE_STATUS.PRESENT,
    note: "",
  },
  {
    studentId: "s10",
    scanTime: todayAt(7, 8),
    initialStatus: ATTENDANCE_STATUS.PRESENT,
    currentStatus: ATTENDANCE_STATUS.LATE,
    note: "Terlambat 8 menit",
    changedAt: todayAt(7, 15),
    changedBy: "Bapak Ahmad Fauzi, S.Pd",
  },
];

const ATT_KEY = `schoolattend_mock_attendance_${dateKey()}`;
function loadAttendance() {
  try {
    const raw = localStorage.getItem(ATT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const rows = defaultAttendance.map((x, i) => ({
    id: `att-${i + 1}`,
    date: dateKey(),
    ...x,
  }));
  localStorage.setItem(ATT_KEY, JSON.stringify(rows));
  return rows;
}
function saveAttendance(rows) {
  localStorage.setItem(ATT_KEY, JSON.stringify(rows));
}
function enrich(row) {
  const s = MOCK_STUDENTS.find((x) => x.id === row.studentId);
  return {
    ...row,
    student: s,
    scanTimeLabel: row.scanTime ? timeOf(row.scanTime) : "-",
  };
}

export function getMockAttendanceRows({ className, status, search } = {}) {
  let rows = loadAttendance().map(enrich);
  if (className) rows = rows.filter((r) => r.student?.className === className);
  if (status) rows = rows.filter((r) => r.currentStatus === status);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.student?.name.toLowerCase().includes(q) || r.student?.nis.includes(q),
    );
  }
  return rows;
}

export function updateMockAttendanceStatus(id, { status, note, changedBy }) {
  const rows = loadAttendance();
  const index = rows.findIndex((r) => r.id === id);
  if (index < 0) throw new Error("Data absensi tidak ditemukan.");
  rows[index] = {
    ...rows[index],
    currentStatus: status,
    note: note ?? rows[index].note,
    changedAt: new Date().toISOString(),
    changedBy: changedBy || "Guru",
    audit: [
      ...(rows[index].audit || []),
      {
        from: rows[index].currentStatus,
        to: status,
        note: note || "",
        changedAt: new Date().toISOString(),
        changedBy: changedBy || "Guru",
      },
    ],
  };
  saveAttendance(rows);
  return enrich(rows[index]);
}

export function getMockStats(rows) {
  const all = rows || getMockAttendanceRows();
  const count = (s) => all.filter((r) => r.currentStatus === s).length;
  return {
    total: all.length,
    present: count(ATTENDANCE_STATUS.PRESENT),
    late: count(ATTENDANCE_STATUS.LATE),
    absent: count(ATTENDANCE_STATUS.ABSENT),
    excused: count(ATTENDANCE_STATUS.EXCUSED),
    sick: count(ATTENDANCE_STATUS.SICK),
    not_yet: count(ATTENDANCE_STATUS.NOT_YET),
  };
}

const HISTORY = [
  {
    id: 1,
    date: dateKey(0),
    time: "06:45",
    status: ATTENDANCE_STATUS.PRESENT,
    note: "",
  },
  {
    id: 2,
    date: dateKey(1),
    time: "07:18",
    status: ATTENDANCE_STATUS.LATE,
    note: "Terlambat",
  },
  {
    id: 3,
    date: dateKey(2),
    time: "06:58",
    status: ATTENDANCE_STATUS.PRESENT,
    note: "",
  },
  {
    id: 4,
    date: dateKey(3),
    time: "-",
    status: ATTENDANCE_STATUS.EXCUSED,
    note: "Izin keluarga",
  },
  {
    id: 5,
    date: dateKey(4),
    time: "07:02",
    status: ATTENDANCE_STATUS.PRESENT,
    note: "",
  },
];

export function getMockStudentDashboard() {
  const todayKey = dateKey();
  const stored = localStorage.getItem(
    `schoolattend_daily_scan_${MOCK_USERS.student.id}_${todayKey}`,
  );
  return {
    student: MOCK_USERS.student,
    today: stored
      ? { status: ATTENDANCE_STATUS.PRESENT, scannedAt: stored }
      : { status: null, scannedAt: null },
    summary: { present: 18, late: 2, absent: 1, excused: 1 },
    activeSession: getMockActiveSession(),
    recentHistory: HISTORY.slice(0, 3),
  };
}
export function getMockStudentProfile() {
  return {
    student: MOCK_USERS.student,
    summary: { present: 18, late: 2, absent: 1, excused: 1 },
  };
}
export function getMockAttendanceHistory({
  page = 1,
  pageSize = 10,
  date,
  status,
} = {}) {
  let rows = HISTORY;
  if (date) rows = rows.filter((r) => r.date === date);
  if (status) rows = rows.filter((r) => r.status === status);
  const start = (page - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
}

export function getMockTeacherDashboard() {
  const rows = getMockAttendanceRows({
    className: MOCK_USERS.teacher.homeroomClass,
  });
  return {
    teacher: MOCK_USERS.teacher,
    selectedDate: dateKey(),
    allowedClasses: [MOCK_USERS.teacher.homeroomClass],
    attendanceWindow: { start: todayAt(6, 30), end: todayAt(7, 0) },
    activeSession: getMockActiveSession(),
    rows,
    stats: getMockStats(rows),
  };
}
export function getMockDutyDashboard() {
  const rows = getMockAttendanceRows();
  return {
    teacher: MOCK_USERS.duty_teacher,
    selectedDate: dateKey(),
    dutyActive: true,
    allowedClasses: ["VIII-A", "VIII-B", "IX-A"],
    rows,
    stats: getMockStats(rows),
  };
}
export function getMockActiveSession() {
  const s = getMockStats(getMockAttendanceRows());
  return {
    id: "daily-mock-1",
    attendanceDate: dateKey(),
    teacherName: MOCK_USERS.teacher.name,
    startsAt: todayAt(6, 15),
    endsAt: todayAt(7, 30),
    startTime: "06:15",
    endTime: "07:30",
    lateAfter: "07:00",
    qrToken: `ATT-${dateKey()}-ROTATING`,
    qrExpiresAt: new Date(Date.now() + 60000).toISOString(),
    presentCount: s.present,
    lateCount: s.late,
    notYetCount: s.not_yet,
    absentCount: s.absent,
    excusedCount: s.excused,
    sickCount: s.sick,
  };
}
export function getMockAttendanceMonitor() {
  const all = getMockAttendanceRows();
  const s = getMockStats(all);
  const rows = all
    .filter((r) => r.scanTime)
    .sort((a, b) => new Date(b.scanTime) - new Date(a.scanTime));
  return {
    events: rows.map((r) => ({
      id: r.id,
      student: r.student,
      time: r.scanTime,
      status: r.currentStatus,
    })),
    presentCount: s.present,
    lateCount: s.late,
    notYetCount: s.not_yet,
  };
}
export function generateMockAttendanceEvent(counter) {
  const student = MOCK_STUDENTS[counter % MOCK_STUDENTS.length];
  return {
    event: "attendance_created",
    student,
    time: new Date().toISOString(),
    status: ATTENDANCE_STATUS.PRESENT,
  };
}

export const MOCK_DUTY_SCHEDULES = [
  {
    id: "d1",
    date: dateKey(0),
    teacherId: "u-duty-1",
    teacherName: "Bapak Ahmad Fauzi, S.Pd",
    period: new Date().toISOString().slice(0, 7),
  },
  {
    id: "d2",
    date: dateKey(-1),
    teacherId: "u-teacher-1",
    teacherName: "Ibu Siti Aminah, S.Pd",
    period: new Date().toISOString().slice(0, 7),
  },
];
