import { GraduationCap, UsersRound, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function UserRoles() {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Kelola Akun Pengguna"
      description="Kelola akun siswa dan guru yang digunakan untuk mengakses sistem."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <GraduationCap size={26} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Kelola Akun Siswa
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Kelola akun login siswa, informasi kelas, status akun,
            dan reset password siswa.
          </p>

          <Button
            className="mt-5"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate("/admin/accounts/students")}
          >
            Kelola Akun Siswa
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <UsersRound size={26} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Kelola Akun Guru
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Kelola akun guru, informasi NIP, status akun,
            dan informasi penugasan guru.
          </p>

          <Button
            className="mt-5"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate("/admin/accounts/teachers")}
          >
            Kelola Akun Guru
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}