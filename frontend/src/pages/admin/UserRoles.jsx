import { useState } from "react";
import { Save } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ROLE_LABEL, ROLES } from "../../utils/constants";

const initial = [
  {
    id: "u1",
    name: "Raihan Pratama",
    identifier: "2425100123",
    role: ROLES.STUDENT,
  },
  {
    id: "u2",
    name: "Ibu Siti Aminah, S.Pd",
    identifier: "siti.aminah",
    role: ROLES.TEACHER,
  },
  {
    id: "u3",
    name: "Bapak Ahmad Fauzi, S.Pd",
    identifier: "ahmad.fauzi",
    role: ROLES.DUTY_TEACHER,
  },
  { id: "u4", name: "Admin Sekolah", identifier: "admin", role: ROLES.ADMIN },
];
const selectClass =
  "h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
export default function UserRoles() {
  const [rows, setRows] = useState(initial),
    [saved, setSaved] = useState("");
  function changeRole(id, role) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, role } : x)));
    setSaved("");
  }
  function save() {
    setSaved(
      "Perubahan role tersimpan pada mode pratinjau. Hubungkan ke endpoint user/role pada backend untuk produksi.",
    );
  }
  return (
    <PageContainer
      title="Akun & Role"
      description="Kelola akun pengguna dan pisahkan hak akses Siswa, Guru Kelas, Guru Piket, dan Admin."
    >
      <Card padding="p-0">
        <CardHeader
          className="px-5 pt-5"
          title="Daftar Akun"
          subtitle="Role dari backend harus menjadi sumber kebenaran saat login."
          action={
            <Button size="sm" icon={Save} onClick={save}>
              Simpan
            </Button>
          }
        />
        {saved && (
          <p className="mx-5 mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {saved}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Username/NIS</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.identifier}</td>
                  <td className="px-4 py-3">
                    <select
                      className={selectClass}
                      value={r.role}
                      onChange={(e) => changeRole(r.id, e.target.value)}
                    >
                      {Object.values(ROLES).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
