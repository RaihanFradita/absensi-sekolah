import {
  LayoutDashboard,
  QrCode,
  History,
  UserCircle,
  CalendarPlus,
  Users,
  GraduationCap,
  School,
  FileBarChart,
  ClipboardCheck,
  UserCog,
  CalendarDays,
  UserCheck,
} from 'lucide-react';

import { ROLES } from './constants';

export const NAV_ITEMS = {
  // ==================== SISWA ====================

  [ROLES.STUDENT]: [
    {
      to: '/student/dashboard',
      label: 'Beranda',
      icon: LayoutDashboard,
    },
    {
      to: '/student/scan',
      label: 'Scan QR',
      icon: QrCode,
    },
    {
      to: '/student/history',
      label: 'Riwayat',
      icon: History,
    },
    {
      to: '/student/profile',
      label: 'Profil',
      icon: UserCircle,
    },
  ],

  // ==================== GURU KELAS ====================

  [ROLES.TEACHER]: [
    {
      to: '/teacher/dashboard',
      label: 'Rekap Kelas',
      icon: LayoutDashboard,
    },
    {
      to: '/teacher/monitor',
      label: 'Data Kehadiran',
      icon: ClipboardCheck,
    },
    {
      to: '/teacher/sessions/create',
      label: 'QR Kehadiran',
      icon: CalendarPlus,
    },
    {
      to: '/teacher/profile',
      label: 'Profil Guru',
      icon: UserCircle,
    },
  ],

  // ==================== GURU PIKET ====================

  [ROLES.DUTY_TEACHER]: [
    {
      to: '/duty/dashboard',
      label: 'Dashboard Piket',
      icon: FileBarChart,
    },
  ],

  // ==================== ADMIN ====================

  [ROLES.ADMIN]: [
    {
      to: '/admin/dashboard',
      label: 'Beranda',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/students',
      label: 'Siswa',
      icon: Users,
    },
    {
      to: '/admin/teachers',
      label: 'Guru',
      icon: GraduationCap,
    },
    {
      to: '/admin/duty-schedules',
      label: 'Guru Piket',
      icon: UserCheck,
    },
    {
      to: '/admin/classes',
      label: 'Kelas',
      icon: School,
    },
    {
      to: '/admin/user-roles',
      label: 'Kelola Akun',
      icon: UserCog,
    },
    {
      to: '/admin/reports',
      label: 'Data Absensi',
      icon: FileBarChart,
    },
  ],
};

export const MOBILE_NAV_LIMIT = 5;
