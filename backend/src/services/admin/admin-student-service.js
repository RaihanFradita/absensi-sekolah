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
  const conditions = [];
  const params = [];

  const selectedClassId = classId ? Number(classId) : null;

  if (selectedClassId) {
    conditions.push("s.id_kelas = ?");
    params.push(selectedClassId);
  }

  const keyword = typeof search === "string" ? search.trim() : "";

  if (keyword) {
    conditions.push("s.nama_siswa LIKE ? OR u.username LIKE ?");
    const like = `%${keyword}%`;
    params.push(like, like);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // const classFilter = selectedClassId ? "WHERE s.id_kelas = ?" : "";
  // const classParams = selectedClassId ? [selectedClassId] : [];

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
    ORDER BY s.nama_siswa ASC, s.id_siswa ASC
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
