import db from '../config/database.js';

// 1. Ambil semua data siswa (READ - GET ALL)
export const getAllSiswa = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM siswa');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Ambil data siswa berdasarkan ID (READ - GET BY ID)
export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM siswa WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Tambah data siswa baru (CREATE - POST)
export const createSiswa = async (req, res) => {
  try {
    const { nama, nis, kelas_id } = req.body;
    const [result] = await db.query('INSERT INTO siswa (nama, nis, kelas_id) VALUES (?, ?, ?)', [nama, nis, kelas_id]);
    res.status(201).json({ id: result.insertId, nama, nis, kelas_id, message: 'Siswa berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Ubah data siswa (UPDATE - PUT)
export const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nis, kelas_id } = req.body;
    await db.query('UPDATE siswa SET nama = ?, nis = ?, kelas_id = ? WHERE id = ?', [nama, nis, kelas_id, id]);
    res.json({ message: 'Data siswa berhasil diubah' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Hapus data siswa (DELETE - DELETE)
export const deleteSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM siswa WHERE id = ?', [id]);
    res.json({ message: 'Data siswa berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};