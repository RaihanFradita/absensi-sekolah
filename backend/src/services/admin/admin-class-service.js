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

export const findAllClass = async ({
  page = 1,
  limit = 10,
  search,
  tingkat,
  statusAktif,
} = {}) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (currentPage - 1) * perPage;

  // Bangun WHERE dinamis
  const conditions = ["status_aktif = 1"];
  const params = [];

  // Default: hanya kelas aktif (sama seperti logic lama).
  // Kirim statusAktif="all" kalau ingin menampilkan semua.
  if (statusAktif !== "all") {
    conditions.push("status_aktif = ?");
    params.push(
      statusAktif === undefined || statusAktif === "" ? 1 : statusAktif,
    );
  }

  const keyword = typeof search === "string" ? search.trim() : "";
  if (keyword) {
    conditions.push("nama_kelas LIKE ?");
    params.push(`%${keyword}%`);
  }

  // Opsional: filter tingkat (mis. 10, 11, 12)
  if (tingkat !== undefined && tingkat !== "") {
    conditions.push("tingkat = ?");
    params.push(tingkat);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Hitung total data (dengan filter yang sama)
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM kelas ${whereClause}`,
    params,
  );

  // Ambil data sesuai halaman
  const [rows] = await pool.query(
    `
    SELECT id_kelas, nama_kelas, tingkat, status_aktif
    FROM kelas
    ${whereClause}
    ORDER BY tingkat ASC,
      FIELD(nama_kelas, 'MM1', 'MM2', 'A', 'B', 'C', 'D', 'E', 'F'),
      id_kelas ASC
    LIMIT ? OFFSET ?
    `,
    [...params, perPage, offset],
  );

  const totalPages = Math.ceil(total / perPage);

  return {
    success: true,
    message: "Data berhasil diambil",
    data: rows,
    pagination: {
      page: currentPage,
      limit: perPage,
      totalItems: total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export const findClassById = async (id_kelas) => {
  const [[rows]] = await pool.query(
    `
        SELECT id_kelas, nama_kelas, tingkat, status_aktif FROM kelas WHERE id_kelas = ?
        `,
    [id_kelas],
  );

  return {
    success: true,
    message: "Berhasil mengambil data",
    data: rows ?? {},
  };
};

export const updateClassById = async (data) => {
  const [currentClass] = await pool.query(
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
    [data.upperNamaKelas, data.tingkat, data.id_kelas],
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
