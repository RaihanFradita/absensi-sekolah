import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, KeyRound, Search, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const previewStudents = [
  {
    id_siswa: 1,
    id_user: 7,
    username: "andi",
    nis: "2607001",
    nama_siswa: "Andi Pratama",
    nama_kelas: "7A",
    status_aktif: 1,
  },
  {
    id_siswa: 2,
    id_user: 8,
    username: "budi",
    nis: "2607002",
    nama_siswa: "Budi Setiawan",
    nama_kelas: "7A",
    status_aktif: 1,
  },
  {
    id_siswa: 3,
    id_user: 9,
    username: "citra",
    nis: "2607003",
    nama_siswa: "Citra Lestari",
    nama_kelas: "7A",
    status_aktif: 1,
  },
  {
    id_siswa: 4,
    id_user: 10,
    username: "dina",
    nis: "2607004",
    nama_siswa: "Dina Maharani",
    nama_kelas: "7B",
    status_aktif: 1,
  },
  {
    id_siswa: 5,
    id_user: 11,
    username: "eko",
    nis: "2607005",
    nama_siswa: "Eko Saputra",
    nama_kelas: "7B",
    status_aktif: 1,
  },
  {
    id_siswa: 6,
    id_user: 12,
    username: "fajar",
    nis: "2608001",
    nama_siswa: "Fajar Ramadhan",
    nama_kelas: "8A",
    status_aktif: 1,
  },
];

export default function StudentAccounts() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStudents(previewStudents);
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return students;

    return students.filter((student) =>
      [
        student.nama_siswa,
        student.username,
        student.nis,
        student.nama_kelas,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [students, search]);

  function resetPassword(student) {
    setSelectedStudent(null);
    setMessage(
      `Permintaan reset password untuk ${student.nama_siswa} masih dalam mode pratinjau.`
    );
  }

  return (
    <PageContainer
      title="Kelola Akun Siswa"
      description="Kelola akun login siswa dan informasi kelas."
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
        <div className="flex flex-col gap-4">
          <Input
            label="Cari siswa"
            placeholder="Cari nama, username, NIS, atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />

          {message && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {message}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-950">
                <tr>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">NIS</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStudents.map((student) => (
                  <tr key={student.id_siswa}>
                    <td className="px-4 py-3 font-medium">
                      {student.nama_siswa}
                    </td>

                    <td className="px-4 py-3">
                      {student.username}
                    </td>

                    <td className="px-4 py-3">
                      {student.nis}
                    </td>

                    <td className="px-4 py-3">
                      {student.nama_kelas}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {student.status_aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={KeyRound}
                        onClick={() => setSelectedStudent(student)}
                      >
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Siswa tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold">
              Reset Password
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Reset password akun:
            </p>

            <p className="mt-1 font-medium">
              {selectedStudent.nama_siswa}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedStudent(null)}
              >
                Batal
              </Button>

              <Button
                onClick={() => resetPassword(selectedStudent)}
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