import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Search,
  Loader2,
  X,
} from "lucide-react";

import { adminTeacherServices } from "../../services/adminServices/teacherServices";

const EMPTY_FORM = {
  nip: "",
  nama_guru: "",
  username: "",
  password: "",
};

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  // null = tambah
  // object = edit
  const [editingTeacher, setEditingTeacher] = useState(null);

  // ==============================
  // GET DATA GURU
  // ==============================

  const fetchDataTeachers = async () => {
    setLoading(true);

    try {
      const response = await adminTeacherServices.getTeachers();

      console.log("RESPONSE DATA GURU:", response);

      if (response.success) {
        setTeachers(response.data || []);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data guru:", error);

      setTeachers([]);
      alert(error?.message || "Gagal mengambil data guru.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataTeachers();
  }, []);

  // ==============================
  // SEARCH
  // ==============================

  const filteredTeachers = teachers.filter(
    (teacher) =>
      String(teacher.nama_guru || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(teacher.nip || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ==============================
  // BUKA MODAL TAMBAH
  // ==============================

  const handleOpenAdd = () => {
    setEditingTeacher(null);

    setForm({
      nip: "",
      nama_guru: "",
      username: "",
      password: "",
    });

    setShowModal(true);
  };

  // ==============================
  // BUKA MODAL EDIT
  // ==============================

  const handleOpenEdit = async (teacher) => {
    try {
      setSaving(true);

      console.log("EDIT GURU:", teacher);

      const response =
        await adminTeacherServices.getTeacherById(
          teacher.id_guru
        );

      console.log("DETAIL GURU:", response);

      if (!response.success) {
        alert(
          response.message ||
            "Gagal mengambil data guru."
        );
        return;
      }

      const data = response.data;

      setEditingTeacher(data);

      setForm({
        nip: data.nip || "",
        nama_guru: data.nama_guru || "",
        username: data.username || "",
        password: "",
      });

      setShowModal(true);
    } catch (error) {
      console.error(
        "Gagal mengambil detail guru:",
        error
      );

      alert(
        error?.message ||
          "Gagal mengambil detail guru."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // TUTUP MODAL
  // ==============================

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTeacher(null);

    setForm({
      nip: "",
      nama_guru: "",
      username: "",
      password: "",
    });
  };

  // ==============================
  // HANDLE INPUT
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // TAMBAH / EDIT
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nip.trim()) {
      alert("NIP wajib diisi.");
      return;
    }

    if (!form.nama_guru.trim()) {
      alert("Nama guru wajib diisi.");
      return;
    }

    if (!form.username.trim()) {
      alert("Username wajib diisi.");
      return;
    }

    // Password hanya wajib ketika TAMBAH
    if (!editingTeacher && !form.password.trim()) {
      alert("Password wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      // ==================================
      // MODE EDIT
      // ==================================

      if (editingTeacher) {
        const response =
          await adminTeacherServices.updateTeacher(
            editingTeacher.id_guru,
            {
              id_user: editingTeacher.id_user,
              nip: form.nip.trim(),
              username: form.username.trim(),
              nama_guru: form.nama_guru.trim(),
            }
          );

        console.log(
          "RESPONSE EDIT GURU:",
          response
        );

        if (!response.success) {
          alert(
            response.message ||
              "Gagal mengubah data guru."
          );
          return;
        }

        alert("Data guru berhasil diubah.");

        handleCloseModal();

        await fetchDataTeachers();

        return;
      }

      // ==================================
      // MODE TAMBAH
      // ==================================

      const response =
        await adminTeacherServices.createTeacher({
          nip: form.nip.trim(),
          nama_guru: form.nama_guru.trim(),
          username: form.username.trim(),
          password: form.password,
        });

      console.log(
        "RESPONSE TAMBAH GURU:",
        response
      );

      if (!response.success) {
        alert(
          response.message ||
            "Gagal menambahkan guru."
        );
        return;
      }

      alert("Guru berhasil ditambahkan.");

      handleCloseModal();

      await fetchDataTeachers();
    } catch (error) {
      console.error(
        "Gagal menyimpan data guru:",
        error
      );

      alert(
        error?.message ||
          "Terjadi kesalahan saat menyimpan data guru."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // HAPUS / NONAKTIFKAN GURU
  // ==============================

  const handleDelete = async (teacher) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menonaktifkan guru "${teacher.nama_guru}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      console.log(
        "HAPUS GURU:",
        teacher.id_guru,
        teacher.id_user
      );

      const response =
        await adminTeacherServices.deactivateTeacher(
          teacher.id_guru,
          teacher.id_user
        );

      console.log(
        "RESPONSE HAPUS GURU:",
        response
      );

      if (!response.success) {
        alert(
          response.message ||
            "Gagal menonaktifkan guru."
        );
        return;
      }

      alert("Guru berhasil dinonaktifkan.");

      await fetchDataTeachers();
    } catch (error) {
      console.error(
        "Gagal menonaktifkan guru:",
        error
      );

      alert(
        error?.message ||
          "Terjadi kesalahan saat menonaktifkan guru."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* ==============================
          HEADER
      ============================== */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Data Guru
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Kelola data guru yang terdaftar di sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-lg bg-[#126B3A] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0F5A31]"
        >
          <Plus size={18} />
          Tambah Guru
        </button>
      </div>

      {/* ==============================
          SEARCH
      ============================== */}

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Cari nama guru atau NIP..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#126B3A] focus:ring-2 focus:ring-[#126B3A]/10"
          />
        </div>
      </div>

      {/* ==============================
          TABLE
      ============================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2
                size={20}
                className="animate-spin"
              />

              Memuat data guru...
            </div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-gray-600">
                Data guru tidak ditemukan
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Belum ada data guru yang tersedia.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">
                    No
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    NIP
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Nama Guru
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map(
                  (teacher, index) => (
                    <tr
                      key={
                        teacher.id_guru ?? index
                      }
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-gray-600">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {teacher.nip || "-"}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {teacher.nama_guru || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            teacher.status_aktif
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {teacher.status_aktif
                            ? "Aktif"
                            : "Tidak Aktif"}
                        </span>
                      </td>

                      {/* ==============================
                          AKSI
                      ============================== */}

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(
                                teacher
                              )
                            }
                            disabled={loading}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Edit Guru"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* HAPUS */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                teacher
                              )
                            }
                            disabled={
                              loading ||
                              !teacher.status_aktif
                            }
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Nonaktifkan Guru"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==============================
          MODAL TAMBAH / EDIT
      ============================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* HEADER MODAL */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingTeacher
                    ? "Edit Guru"
                    : "Tambah Guru"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingTeacher
                    ? "Perbarui data guru."
                    : "Tambahkan guru baru ke sistem."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-6 py-5">
                {/* NIP */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    NIP
                  </label>

                  <input
                    type="text"
                    name="nip"
                    value={form.nip}
                    onChange={handleChange}
                    placeholder="Masukkan NIP guru"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#126B3A] focus:ring-2 focus:ring-[#126B3A]/10"
                  />
                </div>

                {/* NAMA */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nama Guru
                  </label>

                  <input
                    type="text"
                    name="nama_guru"
                    value={form.nama_guru}
                    onChange={handleChange}
                    placeholder="Masukkan nama guru"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#126B3A] focus:ring-2 focus:ring-[#126B3A]/10"
                  />
                </div>

                {/* USERNAME */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#126B3A] focus:ring-2 focus:ring-[#126B3A]/10"
                  />
                </div>

                {/* PASSWORD HANYA SAAT TAMBAH */}

                {!editingTeacher && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Masukkan password"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#126B3A] focus:ring-2 focus:ring-[#126B3A]/10"
                    />
                  </div>
                )}

                {/* INFO EDIT */}

                {editingTeacher && (
                  <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Password tidak diubah melalui
                    form edit ini.
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[#126B3A] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0F5A31] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Menyimpan..."
                    : editingTeacher
                    ? "Simpan Perubahan"
                    : "Simpan Guru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}