import { pool } from "../../config/database.js";

const getTodayWIB = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

const KELAS_LABEL = "CONCAT(kl.tingkat, kl.nama_kelas)";

const normalizeStatusFilter = (st) => {
  if (!st) return null;
  const s = String(st).toLowerCase().trim();
  switch (s) {
    case "hadir":
    case "present":
      return "hadir";
    case "terlambat":
    case "late":
      return "terlambat";
    case "sakit":
    case "sick":
      return "sakit";
    case "izin":
    case "excused":
      return "izin";
    case "tanpa keterangan":
    case "tanpa_keterangan":
    case "tidak hadir":
    case "tidak_hadir":
    case "alpa":
    case "alpha":
    case "absent":
      return "tanpa keterangan";
    case "belum absen":
    case "belum_absen":
    case "not_yet":
      return "belum absen";
    default:
      return s;
  }
};

export const getDailyRows = async ({
  date,
  className,
  status,
  search,
  page = 1,
  limit = 20,
  all = false,
} = {}) => {
  const tanggal = date || getTodayWIB();

  const whereConditions = ["s.status_aktif = 1"];
  const queryParams = [tanggal];

  if (className) {
    whereConditions.push(`${KELAS_LABEL} = ?`);
    queryParams.push(className);
  }

  if (search) {
    whereConditions.push(`s.nama_siswa LIKE ?`);
    queryParams.push(`%${search}%`);
  }

  const normStatus = normalizeStatusFilter(status);
  if (normStatus) {
    if (normStatus === "tanpa keterangan") {
      whereConditions.push(
        `COALESCE(a.status, 'belum absen') IN ('tanpa keterangan', 'tidak hadir', 'alpa')`,
      );
    } else {
      whereConditions.push(`COALESCE(a.status, 'belum absen') = ?`);
      queryParams.push(normStatus);
    }
  }

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const baseFromJoin = `
    FROM siswa s
    JOIN kelas kl
      ON kl.id_kelas = s.id_kelas
      AND kl.status_aktif = 1
    LEFT JOIN sesi_absensi sa
      ON sa.id_kelas = s.id_kelas
      AND sa.tanggal = ?
      AND sa.status <> 'batal'
    LEFT JOIN absensi a
      ON a.id_siswa = s.id_siswa
      AND a.id_sesi = sa.id_sesi
  `;

  // 1. Hitung total siswa sesuai kriteria filter
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    ${baseFromJoin}
    ${whereClause}
    `,
    queryParams,
  );

  let rows = [];
  let currentPage = 1;
  let perPage = total || 1;
  let totalPages = 1;

  if (all || limit === "all") {
    // Ambil seluruh data tanpa pemotongan paginasi (cocok untuk export berkas)
    const [result] = await pool.query(
      `
      SELECT
        s.id_siswa,
        s.nama_siswa,
        kl.id_kelas,
        ${KELAS_LABEL} AS nama_kelas,
        a.id_absensi,
        a.waktu_scan,
        COALESCE(a.status, 'belum absen') AS status,
        a.keterangan
      ${baseFromJoin}
      ${whereClause}
      ORDER BY kl.tingkat ASC, kl.nama_kelas ASC, s.nama_siswa ASC, s.id_siswa ASC
      `,
      queryParams,
    );
    rows = result;
    perPage = total || 1;
    totalPages = 1;
  } else {
    currentPage = Math.max(parseInt(page, 10) || 1, 1);
    perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (currentPage - 1) * perPage;
    totalPages = Math.max(1, Math.ceil(total / perPage));

    const [result] = await pool.query(
      `
      SELECT
        s.id_siswa,
        s.nama_siswa,
        kl.id_kelas,
        ${KELAS_LABEL} AS nama_kelas,
        a.id_absensi,
        a.waktu_scan,
        COALESCE(a.status, 'belum absen') AS status,
        a.keterangan
      ${baseFromJoin}
      ${whereClause}
      ORDER BY kl.tingkat ASC, kl.nama_kelas ASC, s.nama_siswa ASC, s.id_siswa ASC
      LIMIT ? OFFSET ?
      `,
      [...queryParams, perPage, offset],
    );
    rows = result;
  }

  return {
    date: tanggal,
    rows,
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

export const getActiveClassLabels = async () => {
  const [rows] = await pool.query(`
         SELECT CONCAT(tingkat, nama_kelas) AS nama_kelas
    FROM kelas
    WHERE status_aktif = 1
    ORDER BY tingkat ASC,
      FIELD(nama_kelas, 'MM1', 'MM2', 'A', 'B', 'C', 'D', 'E', 'F')
        `);

  return rows.map((r) => r.nama_kelas);
};

export const getDutyDashboardData = async ({ date, className }) => {
  const tanggal = date || getTodayWIB();

  let classFilter = "";
  const filterParams = [tanggal];
  if (className) {
    classFilter = `AND ${KELAS_LABEL} = ?`;
    filterParams.push(className);
  }

  const [summaryRows, allowedClasses] = await Promise.all([
    pool.query(
      `
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN COALESCE(a.status, 'belum absen') = 'hadir' THEN 1 END) AS hadir,
        COUNT(CASE WHEN COALESCE(a.status, 'belum absen') = 'terlambat' THEN 1 END) AS terlambat,
        COUNT(CASE WHEN COALESCE(a.status, 'belum absen') = 'sakit' THEN 1 END) AS sakit,
        COUNT(CASE WHEN COALESCE(a.status, 'belum absen') = 'izin' THEN 1 END) AS izin,
        COUNT(CASE WHEN COALESCE(a.status, 'belum absen') IN ('tanpa keterangan', 'tidak hadir', 'alpa') THEN 1 END) AS tanpaKeterangan,
        COUNT(CASE WHEN COALESCE(a.status, 'belum absen') = 'belum absen' THEN 1 END) AS belumAbsen
      FROM siswa s
      JOIN kelas kl
        ON kl.id_kelas = s.id_kelas
        AND kl.status_aktif = 1
      LEFT JOIN sesi_absensi sa
        ON sa.id_kelas = s.id_kelas
        AND sa.tanggal = ?
        AND sa.status <> 'batal'
      LEFT JOIN absensi a
        ON a.id_siswa = s.id_siswa
        AND a.id_sesi = sa.id_sesi
      WHERE s.status_aktif = 1
        ${classFilter}
      `,
      filterParams,
    ),
    getActiveClassLabels(),
  ]);

  const summaryRow = summaryRows[0]?.[0] || {};

  const summary = {
    total: Number(summaryRow.total || 0),
    hadir: Number(summaryRow.hadir || 0),
    terlambat: Number(summaryRow.terlambat || 0),
    sakit: Number(summaryRow.sakit || 0),
    izin: Number(summaryRow.izin || 0),
    tanpaKeterangan: Number(summaryRow.tanpaKeterangan || 0),
    belumAbsen: Number(summaryRow.belumAbsen || 0),
  };

  return { date: tanggal, allowedClasses, summary };
};
