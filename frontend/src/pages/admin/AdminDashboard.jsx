import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  School,
  CalendarDays,
  QrCode,
  FileBarChart,
  UserCog,
  ArrowRight,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";

const items = [
  {
    to: "/admin/students",
    label: "Data Siswa",
    desc: "Kelola identitas siswa dan kelas.",
    icon: Users,
  },
  {
    to: "/admin/teachers",
    label: "Data Guru",
    desc: "Kelola data guru sekolah.",
    icon: GraduationCap,
  },
  {
    to: "/admin/classes",
    label: "Data Kelas",
    desc: "Kelola kelas dan wali kelas.",
    icon: School,
  },
  {
    to: "/admin/user-roles",
    label: "Akun & Role",
    desc: "Atur hak akses siswa, guru kelas, guru piket, admin.",
    icon: UserCog,
  },
  {
    to: "/admin/duty-schedules",
    label: "Jadwal Guru Piket",
    desc: "Atur assignment piket per tanggal/bulan tanpa membuat akun ulang.",
    icon: CalendarDays,
  },
  {
    to: "/admin/attendance-sessions",
    label: "Sesi & QR",
    desc: "Kelola QR absensi masuk sekolah dan batas waktunya.",
    icon: QrCode,
  },
  {
    to: "/admin/reports",
    label: "Data Absensi",
    desc: "Lihat, koreksi, dan ekspor rekap kehadiran harian.",
    icon: FileBarChart,
  },
];
export default function AdminDashboard() {
  return (
    <PageContainer
      title="Beranda Admin"
      description="Pusat pengelolaan sistem absensi kehadiran harian berbasis QR Code."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ to, label, desc, icon: Icon }) => (
          <Card
            key={to}
            as={Link}
            to={to}
            className="group transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-500" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
              {label}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {desc}
            </p>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
