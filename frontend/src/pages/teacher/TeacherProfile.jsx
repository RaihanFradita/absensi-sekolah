import { UserCircle, GraduationCap, School, BadgeCheck } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import useAuth from "../../hooks/useAuth";

export default function TeacherProfile() {
  const { user } = useAuth();

  const fullName = user?.fullName || user?.name || "Guru";
  const homeroomClass = user?.homeroomClass || "-";

  return (
    <PageContainer
      title="Profil Guru"
      description="Informasi akun guru dan kelas yang menjadi tanggung jawab sebagai wali kelas."
    >
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <UserCircle className="h-14 w-14" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {fullName}
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Guru Kelas
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Profil pengguna guru pada sistem absensi sekolah
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Informasi Guru"
            subtitle="Data yang digunakan untuk menentukan hak akses rekap kelas."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={UserCircle} label="Nama Lengkap" value={fullName} />

            <InfoItem
              icon={School}
              label="Wali Kelas"
              value={homeroomClass === "-" ? "-" : `Kelas ${homeroomClass}`}
            />

            <InfoItem icon={GraduationCap} label="Role" value="Guru Kelas" />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </div>

      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
