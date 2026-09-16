import {
  LayoutDashboard,
  QrCode,
  History,
  UserCircle,
  CalendarPlus,
  Radio,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarClock,
  FileBarChart,
} from 'lucide-react';
import { ROLES } from './constants';

// Item navigasi utama (ditampilkan di Sidebar & MobileNavbar) per role.
export const NAV_ITEMS = {
  [ROLES.STUDENT]: [
    { to: '/student/dashboard', label: 'Beranda', icon: LayoutDashboard },
    { to: '/student/scan', label: 'Scan QR', icon: QrCode },
    { to: '/student/history', label: 'Riwayat', icon: History },
    { to: '/student/profile', label: 'Profil', icon: UserCircle },
  ],
  [ROLES.TEACHER]: [
    { to: '/teacher/dashboard', label: 'Beranda', icon: LayoutDashboard },
    { to: '/teacher/sessions/create', label: 'Buat Sesi', icon: CalendarPlus },
    { to: '/teacher/monitor', label: 'Monitor', icon: Radio },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', label: 'Beranda', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Siswa', icon: Users },
    { to: '/admin/teachers', label: 'Guru', icon: GraduationCap },
    { to: '/admin/classes', label: 'Kelas', icon: School },
    { to: '/admin/subjects', label: 'Mapel', icon: BookOpen },
    { to: '/admin/schedules', label: 'Jadwal', icon: CalendarClock },
    { to: '/admin/reports', label: 'Laporan', icon: FileBarChart },
  ],
};

// Untuk mobile bottom nav, tampilkan maksimal 4-5 item paling penting saja
// supaya tombol tetap cukup besar untuk ditekan di layar kecil.
export const MOBILE_NAV_LIMIT = 5;
