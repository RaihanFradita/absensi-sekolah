import {
  findAllTeacher,
  findTeacherById,
  insertTeacher,
  softDeleteTeacher,
  updateTeacherById,
} from "../services/teacher-service.js";

export const createTeacher = async (req, res) => {
  const { username, password, nip, nama_guru } = req.body;

  if (!username || !password || !nip || !nama_guru) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi!",
    });
  }

  try {
    const result = await insertTeacher({ username, password, nip, nama_guru });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const result = await findAllTeacher();

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getTeacherById = async (req, res) => {
  const { id_guru } = req.params;

  if (!id_guru) {
    return res.status(400).json({
      success: false,
      message: "id tidak ditemukan",
    });
  }

  try {
    const result = await findTeacherById(id_guru);

    res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const editTeacher = async (req, res) => {
  const { id_guru } = req.params;
  const { id_user, username, nip, nama_guru } = req.body;

  if (!id_guru) {
    return res.status(400).json({
      success: false,
      message: "id tidak ditemukan",
    });
  }

  if (!id_user || !username || !nip || !nama_guru) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi",
    });
  }

  try {
    const result = await updateTeacherById({
      id_guru,
      id_user,
      username,
      nip,
      nama_guru,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const deleteTeacher = async (req, res) => {
  const { id_guru } = req.params;
  const { id_user } = req.body;

  if (!id_guru || !id_user) {
    return res.status(400).json({
      success: false,
      message: "id tidak ditemukan",
    });
  }

  try {
    const result = await softDeleteTeacher({ id_guru, id_user });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
