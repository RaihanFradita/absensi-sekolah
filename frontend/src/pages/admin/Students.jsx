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
  );
}