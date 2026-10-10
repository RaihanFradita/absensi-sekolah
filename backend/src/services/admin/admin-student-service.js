import { pool } from "../../config/database.js";
import bcrypt from "bcrypt";

export const insertStudents = async ({
  namaSiswa,
  idKelas,
  username,
  password,
  jenisKelamin,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Cek apakah username sudah digunakan
    const [user] = await connection.query(
      `
      SELECT id_user
      FROM users
      WHERE username = ?
      `,
      [username],
    );

    if (user.length > 0) {
      await connection.rollback();

      return {
        success: false,
        message: "Username sudah digunakan",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Tambahkan user
    const [insertUser] = await connection.query(
      `
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
      `,
      [username, passwordHash, "siswa"],
    );

    if (insertUser.affectedRows === 0) {
      await connection.rollback();

      return {
        success: false,
        message: "Gagal menambahkan data user",
      };
    }

    const idUser = insertUser.insertId;

    await connection.query(
      `
      INSERT INTO siswa (
        id_user,
        nama_siswa,
        id_kelas,
        jenis_kelamin
      )
      VALUES (?, ?, ?, ?)
      `,
      [idUser, namaSiswa, idKelas, jenisKelamin],
    );

    await connection.commit();

    return {
      success: true,
      message: "Data siswa berhasil ditambahkan",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export async function findAllStudents({
  page = 1,
  limit = 10,
  classId,
  search,
} = {}) {
  // sanitasi input suapaya aman dan tidak negatif
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (currentPage - 1) * perPage;

  // bangun where dinamis
  const conditions = ["s.status_aktif = 1"];
  const params = [];

  const selectedClassId = classId ? Number(classId) : null;

  if (selectedClassId) {
    conditions.push("s.id_kelas = ?");
    params.push(selectedClassId);
  }

  const keyword = typeof search === "string" ? search.trim() : "";

  if (keyword) {
    conditions.push("(s.nama_siswa LIKE ? OR u.username LIKE ?)");
    const like = `%${keyword}%`;
    params.push(like, like);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Hitung total data
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM siswa s
    INNER JOIN kelas k
      ON s.id_kelas = k.id_kelas
    INNER JOIN users u
      ON s.id_user = u.id_user
    ${whereClause}
  `,
    params,
  );

  const [rows] = await pool.query(
    `
    SELECT
      s.id_siswa, s.id_user, s.nama_siswa, s.jenis_kelamin,
      s.id_kelas, k.nama_kelas, k.tingkat, s.status_aktif, u.username
    FROM siswa s
    INNER JOIN kelas k ON s.id_kelas = k.id_kelas
    INNER JOIN users u ON s.id_user = u.id_user
    ${whereClause}
    ORDER BY 
    k.tingkat ASC,
    k.nama_kelas ASC,
    s.nama_siswa ASC,
    s.id_siswa ASC
    LIMIT ? OFFSET ?
    `,
    [...params, perPage, offset],
  );

  const totalPages = Math.ceil(total / perPage);

  return {
    data: rows,
    pagination: {
      page: currentPage,
      limit: perPage,
      totalItems: total,
      totalPage: totalPages,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}

export async function findStudentById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      s.id_siswa,
      s.id_user,
      s.nama_siswa,
      s.jenis_kelamin,
      s.id_kelas,
      u.username,
      k.nama_kelas,
      k.tingkat,
      s.status_aktif
    FROM siswa s
    INNER JOIN kelas k
      ON s.id_kelas = k.id_kelas
    INNER JOIN users u
      ON s.id_user = u.id_user
    WHERE s.id_siswa = ?
    `,
    [id],
  );

  return rows[0];
}

export const updateStudentById = async ({
  id_user,
  id_siswa,
  namaSiswa,
  username,
  password,
  idKelas,
  jenisKelamin,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let updateUser;

    // Jika password kosong, password lama tetap digunakan
    if (!password || password.trim() === "") {
      [updateUser] = await connection.query(
        `
        UPDATE users
        SET username = ?
        WHERE id_user = ?
        `,
        [username, id_user],
      );
    } else {
      const passwordHash = await bcrypt.hash(password, 10);

      [updateUser] = await connection.query(
        `
        UPDATE users
        SET username = ?, password = ?
        WHERE id_user = ?
        `,
        [username, passwordHash, id_user],
      );
    }

    if (updateUser.affectedRows === 0) {
      await connection.rollback();

      return {
        success: false,
        message: "Gagal mengubah data user",
      };
    }

    // Update data siswa
    const [updateSiswa] = await connection.query(
      `
      UPDATE siswa
      SET nama_siswa = ?, id_kelas = ?, jenis_kelamin = ?
      WHERE id_siswa = ?
      `,
      [namaSiswa, idKelas, jenisKelamin, id_siswa],
    );

    if (updateSiswa.affectedRows === 0) {
      await connection.rollback();

      return {
        success: false,
        message: "Gagal mengubah data siswa",
      };
    }

    await connection.commit();

    return {
      success: true,
      message: "Data siswa berhasil diperbarui",
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

export const softDeleteStudent = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Nonaktifkan user
    await connection.query(
      `
      UPDATE users
      SET status_aktif = ?
      WHERE id_user = ?
      `,
      [0, data.id_user],
    );

    // Nonaktifkan siswa
    await connection.query(
      `
      UPDATE siswa
      SET status_aktif = ?
      WHERE id_siswa = ?
      `,
      [0, data.id_siswa],
    );

    await connection.commit();

    return {
      success: true,
      message: "Data siswa berhasil dinonaktifkan",
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

export async function findAllClasses() {
  const [rows] = await pool.query(`
    SELECT
      id_kelas,
      nama_kelas,
      tingkat
    FROM kelas
    WHERE status_aktif = 1
    ORDER BY tingkat ASC,
      FIELD(nama_kelas, 'MM1', 'MM2', 'A', 'B', 'C', 'D', 'E', 'F'),
      id_kelas ASC
  `);

  return rows;
}

const normalizedIds = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }

  const ids = [...new Set(list.map(Number))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) return null;

  return ids;
};

// pindah kelas
export const bulkChangeStudentClass = async ({ id_siswa_list, id_kelas }) => {
  const studentIds = normalizedIds(id_siswa_list);

  if (!studentIds) {
    return {
      success: false,
      message: "Pilih minimal satu siswa yang valid",
    };
  }

  const classId = Number(id_kelas);
  if (!Number.isInteger(classId) || classId <= 0) {
    return {
      success: false,
      message: "Kelas tujuan tidak valid",
    };
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Pastikan kelas tujuan ada & aktif
    const [classes] = await connection.query(
      `SELECT id_kelas FROM kelas WHERE id_kelas = ? AND status_aktif = 1`,
      [classId],
    );

    if (classes.length === 0) {
      throw new Error("Kelas tujuan tidak ditemukan atau tidak aktif");
    }

    //  Pastikan semua siswa ada
    const [students] = await connection.query(
      `SELECT id_siswa, id_kelas FROM siswa WHERE id_siswa IN (?)`,
      [studentIds],
    );

    if (students.length !== studentIds.length) {
      const found = new Set(students.map((s) => s.id_siswa));
      const invalid = studentIds.filter((id) => !found.has(id));
      throw new Error(`Siswa tidak ditemukan (ID: ${invalid.join(", ")})`);
    }

    // Hanya update yang kelasnya memang berbeda
    const toMove = students
      .filter((s) => s.id_kelas !== classId)
      .map((s) => s.id_siswa);

    if (toMove.length > 0) {
      await connection.query(
        `UPDATE siswa SET id_kelas = ? WHERE id_siswa IN (?)`,
        [classId, toMove],
      );
    }

    await connection.commit();

    return {
      success: true,
      message: `${toMove.length} siswa berhasil dipindahkan`,
      data: {
        total: studentIds.length,
        updated: toMove.length,
        skipped: studentIds.length - toMove.length, // sudah di kelas tujuan
      },
    };
  } catch (error) {
    await connection.rollback();
    return {
      success: false,
      message: error.message || "Terjadi kesalahan server",
    };
  } finally {
    connection.release();
  }
};

// aktif / non aktif siswa
export const bulkSetStudentStatus = async ({ id_siswa_list, status_aktif }) => {
  const studentIds = normalizedIds(id_siswa_list);
  if (!studentIds) {
    return { success: false, message: "Pilih minimal satu siswa yang valid" };
  }

  if (![0, 1].includes(Number(status_aktif))) {
    return { success: false, message: "Status tidak valid" };
  }

  const newStatus = Number(status_aktif);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Ambil siswa + id_user-nya
    const [students] = await connection.query(
      `SELECT id_siswa, id_user FROM siswa WHERE id_siswa IN (?)`,
      [studentIds],
    );

    if (students.length !== studentIds.length) {
      const found = new Set(students.map((s) => s.id_siswa));
      const invalid = studentIds.filter((id) => !found.has(id));
      throw new Error(`Siswa tidak ditemukan (ID: ${invalid.join(", ")})`);
    }

    const userIds = students.map((s) => s.id_user);

    // Update tabel siswa
    await connection.query(
      `UPDATE siswa SET status_aktif = ? WHERE id_siswa IN (?)`,
      [newStatus, studentIds],
    );

    // Update akun login-nya
    await connection.query(
      `UPDATE users SET status_aktif = ? WHERE id_user IN (?)`,
      [newStatus, userIds],
    );

    await connection.commit();

    return {
      success: true,
      message: `${studentIds.length} siswa berhasil ${
        newStatus ? "diaktifkan" : "dinonaktifkan"
      }`,
      data: { total: studentIds.length },
    };
  } catch (error) {
    await connection.rollback();
    return {
      success: false,
      message: error.message || "Terjadi kesalahan server",
    };
  } finally {
    connection.release();
  }
};
