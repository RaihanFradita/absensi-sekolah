import {
  findAllPicketTeacher,
  findPicketTeacherById,
  insertPicketTeacher,
  softDeletePicketTeacher,
  updatePicketTeacherById,
} from "../../services/admin/admin-picket-teacher.service.js";

export const createPicketTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi!",
      });
    }

    const result = await insertPicketTeacher({ username, password });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Terjadi error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getAllPicketTeachers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await findAllPicketTeacher({ page, limit });

    return res.json(result);
  } catch (error) {
    console.error("getAllTeachers:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getPicketTeacherById = async (req, res) => {
  try {
    const { id_user } = req.params;

    if (!id_user) {
      return res.status(400).json({
        success: false,
        message: "ID tidak ditemukan",
      });
    }

    const result = await findPicketTeacherById(id_user);

    return res.json(result);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const editPicketTeacher = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { username, password } = req.body;

    if (!id_user) {
      return res.status(400).json({
        success: false,
        message: "ID tidak ditemukan!",
      });
    }

    const result = await updatePicketTeacherById({
      id_user,
      username,
      password,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const deletePicketTeacher = async (req, res) => {
  try {
    const { id_user } = req.params;

    if (!id_user) {
      return res.status(400).json({
        success: false,
        message: "ID tidak ditemukan",
      });
    }

    const result = await softDeletePicketTeacher(id_user);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
