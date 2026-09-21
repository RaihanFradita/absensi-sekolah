import {
  findAllTeacher,
  findTeacherById,
  insertTeacher,
  softDeleteTeacher,
  updateTeacherById,
} from "../../services/admin/admin-teacher-service.js";

export const createTeacher = async (req, res) => {
  const { username, password, nama_guru } = req.body;

  if (!username || !password || !nama_guru) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi!",
    });
  }

  try {
    const result = await insertTeacher({
      username,
      password,
      nama_guru,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("createTeacher:", error);

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
    console.error("getAllTeachers:", error);

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
      message: "ID guru tidak ditemukan",
    });
  }

  try {
    const result = await findTeacherById(id_guru);

    return res.json(result);
  } catch (error) {
    console.error("getTeacherById:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const editTeacher = async (req, res) => {
  const { id_guru } = req.params;
  const { id_user, username, nama_guru } = req.body;

  if (!id_guru) {
    return res.status(400).json({
      success: false,
      message: "ID guru tidak ditemukan",
    });
  }

  if (!id_user || !username || !nama_guru) {
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
      nama_guru,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("editTeacher:", error);

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
      message: "ID guru atau ID user tidak ditemukan",
    });
  }

  try {
    const result = await softDeleteTeacher({
      id_guru,
      id_user,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("deleteTeacher:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};