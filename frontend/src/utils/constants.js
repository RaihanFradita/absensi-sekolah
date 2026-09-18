export const APP_NAME = "SMP Muhammadiyah 4 Cipondoh";
export const APP_SHORT_NAME = "SMP Muhammadiyah 4";
export const APP_FULL_NAME = "SMP Muhammadiyah 4 Cipondoh Tangerang";

export const ROLES = {
  STUDENT: "siswa",
  TEACHER: "guru",
  DUTY_TEACHER: "guru_piket",
  ADMIN: "admin",
};

export const ROLE_LABEL = {
  [ROLES.STUDENT]: "Siswa",
  [ROLES.TEACHER]: "Guru Kelas",
  [ROLES.DUTY_TEACHER]: "Guru Piket",
  [ROLES.ADMIN]: "Admin",
};

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  EXCUSED: "excused",
  SICK: "sick",
  NOT_YET: "not_yet",
};

export const ATTENDANCE_STATUS_LABEL = {
  [ATTENDANCE_STATUS.PRESENT]: "Hadir",
  [ATTENDANCE_STATUS.LATE]: "Terlambat",
  [ATTENDANCE_STATUS.ABSENT]: "Tidak Hadir",
  [ATTENDANCE_STATUS.EXCUSED]: "Izin",
  [ATTENDANCE_STATUS.SICK]: "Sakit",
  [ATTENDANCE_STATUS.NOT_YET]: "Belum Absen",
};

export const SESSION_STATUS = { ACTIVE: "active", ENDED: "ended" };
export const AUTH_TOKEN_KEY = "schoolattend_token";
export const AUTH_USER_KEY = "schoolattend_user";
export const PROFILE_PHOTO_KEY_PREFIX = "schoolattend_profile_photo_";
export const DEFAULT_PAGE_SIZE = 10;
