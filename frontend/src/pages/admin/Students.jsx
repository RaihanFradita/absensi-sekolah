import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, RefreshCw, Users } from "lucide-react";

import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import studentService from "../../services/studentService";

const EMPTY_FORM = {
  nis: "",
  nisn: "",
  name: "",
  className: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadStudents() {
    setIsLoading(true);
    setError("");

    try {
      const result = await studentService.getStudents();

      const rows =
        result?.students ||
        result?.rows ||
        result?.data ||
        (Array.isArray(result) ? result : []);

      setStudents(rows);
    } catch (err) {
      setError(err?.message || "Gagal mengambil data siswa.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(student) {
    setEditingId(student.id);

    setForm({
      nis: student.nis || "",
      nisn: student.nisn || "",
      name: student.name || "",
      className: student.className || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nis || !form.name || !form.className) {
      setError("NIS, nama siswa, dan kelas wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (editingId) {
        await studentService.updateStudent(editingId, form);
      } else {
        await studentService.createStudent(form);
      }

      resetForm();
      await loadStudents();
    } catch (err) {
      setError(
        err?.message ||
          (editingId
            ? "Gagal mengubah data siswa."
            : "Gagal menambahkan siswa."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(`Hapus data siswa "${student.name}"?`);

    if (!confirmed) return;

    setError("");

    try {
      await studentService.deleteStudent(student.id);
      await loadStudents();

      if (editingId === student.id) {
        resetForm();
      }
    } catch (err) {
      setError(err?.message || "Gagal menghapus data siswa.");
    }
  }

  const filteredStudents = students.filter((student) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      String(student.nis || "")
        .toLowerCase()
        .includes(keyword) ||
      String(student.nisn || "")
        .toLowerCase()
        .includes(keyword) ||
      String(student.name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(student.className || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  console.log(students);

  return (
    <PageContainer
      title="Data Siswa"
      description="Kelola data siswa yang digunakan dalam sistem absensi harian."
      action={
        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={loadStudents}
          disabled={isLoading}
        >
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <Card>
          <CardHeader
            title={editingId ? "Edit Data Siswa" : "Tambah Siswa"}
            subtitle={
              editingId
                ? "Perbarui informasi siswa."
                : "Masukkan data siswa baru ke sistem."
            }
          />

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="NIS"
              name="nis"
              value={form.nis}
              onChange={handleChange}
              placeholder="Contoh: 2425100123"
            />

            <Input
              label="NISN"
              name="nisn"
              value={form.nisn}
              onChange={handleChange}
              placeholder="Contoh: 0091234567"
            />

            <Input
              label="Nama Siswa"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama lengkap siswa"
            />

            <Input
              label="Kelas"
              name="className"
              value={form.className}
              onChange={handleChange}
              placeholder="Contoh: VIII-A"
            />

            <div className="flex gap-2 sm:col-span-2">
              <Button
                type="submit"
                icon={editingId ? Pencil : Plus}
                isLoading={isSaving}
              >
                {editingId ? "Simpan Perubahan" : "Tambah Siswa"}
              </Button>

              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            title="Daftar Siswa"
            subtitle={`${filteredStudents.length} siswa ditampilkan`}
          />

          <div className="mb-4">
            <Input
              icon={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari NIS, NISN, nama, atau kelas..."
            />
          </div>

          {isLoading ? (
            <Loading label="Memuat data siswa..." />
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Belum ada data siswa"
              description={
                search
                  ? "Tidak ada siswa yang cocok dengan pencarian."
                  : "Tambahkan siswa melalui form di atas."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-3 py-3">No</th>
                    <th className="px-3 py-3">NIS</th>
                    <th className="px-3 py-3">NISN</th>
                    <th className="px-3 py-3">Nama</th>
                    <th className="px-3 py-3">Kelas</th>
                    <th className="px-3 py-3 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id_siswa}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-3 text-slate-500">{index + 1}</td>

                      <td className="px-3 py-3 font-medium">
                        {student.nis || "-"}
                      </td>

                      <td className="px-3 py-3">{student.nisn || "-"}</td>

                      <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {student.nama_siswa || "-"}
                      </td>

                      <td className="px-3 py-3">
                        {`${student.tingkat}${student.nama_kelas}` || "-"}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Pencil}
                            onClick={() => handleEdit(student)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            icon={Trash2}
                            onClick={() => handleDelete(student)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
