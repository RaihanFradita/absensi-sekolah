import { pool } from "../../config/database.js";

export const insertClass = async (data) => {
  const [existingClass] = await pool.query(
    "SELECT * FROM kelas WHERE nama_kelas = ? AND tingkat = ?",
    [data.nama_kelas.toUpperCase(), data.tingkat],
  );

  if (existingClass.length > 0) {
    return {
      success: false,
      message: "Kelas sudah ada!",
    };
  }

  const [result] = await pool.query(
    "INSERT INTO kelas (nama_kelas, tingkat) VALUES (?, ?)",
    [data.nama_kelas.toUpperCase(), data.tingkat],
  );

  if (result.affectedRows === 0) {
    return {
      success: false,
      message: "Gagal menambahkan data!",
    };
  }

  return {
    success: true,
    message: "Berhasil menambahkan kelas",
  };
};

export const findAllClass = async () => {
  const [rows] = await pool.query("SELECT * FROM kelas");

  return {
    success: true,
    message: "Data berhasil diambil",
    data: rows,
  };
};

export const findClassById = async (id_kelas) => {
  const [[rows]] = await pool.query(
    `
        SELECT * FROM kelas WHERE id_kelas = ?
        `,
    [id_kelas],
  );

  return {
    success: true,
    message: "Berhasil mengambil data",
    data: rows,
  };
};

export const updateClassById = async (data) => {
  const [currentClass] = await pool(
    `
        SELECT * FROM kelas WHERE id_kelas = ?
        `,
    [data.id_kelas],
  );

  if (currentClass.length === 0) {
    return {
      success: false,
      message: "Kelas tidak ditemukan!",
    };
  }

  const [duplicateCheck] = await pool.query(
    "SELECT * FROM kelas WHERE nama_kelas = ? AND tingkat = ? AND id_kelas != ?",
    [data.upperNamaKelas, data.tingkat, data.id_kelas],
  );

  if (duplicateCheck.length > 0) {
    return {
      success: false,
      message: "Kombinasi kelas sudah diguanakan!",
    };
  }

  const [result] = await pool.query(
    "UPDATE kelas SET nama_kelas = ?, tingkat = ? WHERE id_kelas = ?",
    [data.upperNamaKelas, data.tingkat, data.id_kelasd],
  );

  if (result.affectedRows === 0) {
    return {
      success: false,
      message: "Gagal mengupdate data!",
    };
  }

  return {
    success: true,
    message: "Edit kelas berhasil",
  };
};

export const deactivateClass = async (id_kelas) => {
  const [existingClass] = await pool.query(
    "SELECT * FROM kelas WHERE id_kelas = ?",
    [id_kelas],
  );

  if (existingClass.length === 0) {
    return {
      success: false,
      message: "Kelas tidak ditemukan!",
    };
  }

  const [result] = await pool.query(
    `
    UPDATE kelas SET status_aktif = ? WHERE id_kelas = ?
    `,
    [0, id_kelas],
  );

  if (result.affectedRows === 0) {
    return {
      success: false,
      message: "Gagal mengupdate data!",
    };
  }

  return {
    success: true,
    message: "Berhasil mengupdate data!",
  };
};
