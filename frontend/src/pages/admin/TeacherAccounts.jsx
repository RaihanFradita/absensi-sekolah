import { useMemo, useState } from "react";
import { ArrowLeft, KeyRound, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const previewTeachers = [
  {
    id_guru: 1,
    username: "guru.budi",
    nip: "19780101001",
    nama_guru: "Budi Santoso",
    wali_kelas: "7A",
    status_aktif: 1,
  },
  {
    id_guru: 2,
    username: "guru.siti",
    nip: "19820512002",
    nama_guru: "Siti Aminah",
    wali_kelas: "8A",
    status_aktif: 1,
  },
];

export default function TeacherAccounts() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [message, setMessage] = useState("");

  const filteredTeachers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return previewTeachers;

    return previewTeachers.filter((teacher) =>
      [
        teacher.nama_guru,
        teacher.username,
        teacher.nip,
        teacher.wali_kelas,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [search]);

  function resetPassword(teacher) {
    setSelectedTeacher(null);

    setMessage(
      `Permintaan reset password untuk ${teacher.nama_guru} masih dalam mode pratinjau.`
    );
  }

  return (
    <PageContainer
      title="Kelola Akun Guru"
      description="Kelola akun login guru, informasi NIP, wali kelas, dan status akun."
      action={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/admin/accounts")}
        >
          <ArrowLeft size={16} />
          Kembali
        </Button>
      }
    >
      <Card>
        <Input
          label="Cari guru"
          placeholder="Cari nama, username, NIP, atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />

        {message && (
          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {message}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">Nama Guru</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id_guru}>
                  <td className="px-4 py-3 font-medium">
                    {teacher.nama_guru}
                  </td>

                  <td className="px-4 py-3">
                    {teacher.username}
                  </td>

                  <td className="px-4 py-3">
                    {teacher.nip}
                  </td>

                  <td className="px-4 py-3">
                    {teacher.wali_kelas || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {teacher.status_aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={KeyRound}
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      Reset Password
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredTeachers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Guru tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold">
              Reset Password
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Reset password akun guru:
            </p>

            <p className="mt-1 font-medium">
              {selectedTeacher.nama_guru}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Username: {selectedTeacher.username}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedTeacher(null)}
              >
                Batal
              </Button>

              <Button
                onClick={() => resetPassword(selectedTeacher)}
              >
                Reset Password
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}