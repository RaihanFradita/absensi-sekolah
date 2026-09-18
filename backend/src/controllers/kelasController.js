import db from '../config/database.js';

export const getAllKelas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kelas');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM kelas WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createKelas = async (req, res) => {
  try {
    const { nama_kelas } = req.body;
    const [result] = await db.query('INSERT INTO kelas (nama_kelas) VALUES (?)', [nama_kelas]);
    res.status(201).json({ id: result.insertId, nama_kelas, message: 'Kelas berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kelas } = req.body;
    await db.query('UPDATE kelas SET nama_kelas = ? WHERE id = ?', [nama_kelas, id]);
    res.json({ message: 'Data kelas berhasil diubah' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM kelas WHERE id = ?', [id]);
    res.json({ message: 'Data kelas berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};