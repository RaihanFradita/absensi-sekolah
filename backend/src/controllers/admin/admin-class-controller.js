import {
  deactivateClass,
  findAllClass,
  findClassById,
  insertClass,
  updateClassById,
} from "../../services/admin/admin-class-service.js";

export const createClass = async (req, res) => {
  const { nama_kelas, tingkat } = req.body;

  if (!nama_kelas || !tingkat) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi!",
    });
  }

  try {
    const result = await insertClass({
      nama_kelas: nama_kelas.toUpperCase(),
      tingkat: Number(tingkat),
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server!",
    });
  }
};

export const getAllClass = async (req, res) => {
  try {
    const result = await findAllClass();

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahn server",
    });
  }
};

export const getClassById = async (req, res) => {
  const { id_kelas } = req.params;

  if (!id_kelas) {
    return res.status(400).json({
      success: false,
      message: "id tidak ditemukan!",
    });
  }

  try {
    const result = await findClassById(id_kelas);

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const editClassById = async (req, res) => {
  const { id_kelas } = req.params;
  const { nama_kelas, tingkat } = req.body;

  if (!id_kelas) {
    return res.status(400).json({
      success: false,
      message: "id tidak ditemukan!",
    });
  }

  if (!nama_kelas || !tingkat) {
    return res.status(400).json("Semua field wajib diisi!");
  }

  const upperNamaKelas = nama_kelas.toUpperCase();

  try {
    const result = await updateClassById({
      upperNamaKelas,
      tingkat: Number(tingkat),
      id_kelas,
    });

    if (!result) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const softDeleteClass = async (req, res) => {
  const { id_kelas } = req.params;

  if (!id_kelas) {
    return res.status(400).json({
      success: false,
      message: "id tidak ditemukan!",
    });
  }

  try {
    const result = await deactivateClass(id_kelas);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server!",
    });
  }
};
