<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/siswa');
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal memuat data siswa:", err);
      setError("Gagal mengambil data dari server");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-white">Memuat data siswa...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      {/* Header Halaman & Tombol Tambah */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Data Siswa</h1>
          <p className="text-sm text-gray-400">Kelola data seluruh siswa terdaftar di sistem.</p>
        </div>
        <button 
          onClick={() => alert("Fitur tambah siswa via UI bisa kita buat selanjutnya!")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/30"
        >
          + Tambah Siswa
        </button>
      </div>
      
      {/* Tabel Data */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-gray-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-6">#</th>
              <th className="py-3.5 px-6">Nama Lengkap</th>
              <th className="py-3.5 px-6">NIS</th>
              <th className="py-3.5 px-6">ID Kelas</th>
              <th className="py-3.5 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6 text-gray-500 font-mono">{index + 1}</td>
                  <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
                      {(student.nama || student.nana || "S").charAt(0)}
                    </div>
                    {student.nama || student.nana}
                  </td>
                  <td className="py-4 px-6 font-mono text-gray-300">{student.nis}</td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700">
                      Kelas {student.kelas_id}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-xs font-medium bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 transition">Edit</button>
                    <button className="text-red-400 hover:text-red-300 text-xs font-medium bg-red-500/10 px-3 py-1 rounded border border-red-500/20 transition">Hapus</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  Belum ada data siswa yang tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
=======
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
} from "lucide-react";

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
    const confirmed = window.confirm(
      `Hapus data siswa "${student.name}"?`,
    );

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

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
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
                      key={student.id}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-3 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-3 py-3 font-medium">
                        {student.nis || "-"}
                      </td>

                      <td className="px-3 py-3">
                        {student.nisn || "-"}
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {student.name || "-"}
                      </td>

                      <td className="px-3 py-3">
                        {student.className || "-"}
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
>>>>>>> 97728a2b2866d6607111761f23e291b52ff9799e
  );
}