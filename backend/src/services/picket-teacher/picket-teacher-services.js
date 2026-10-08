import { pool } from "../../config/database.js";

const getTodayWIB = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

const KELAS_LABEL = "CONCAT(kl.tingkat, kl.nama_kelas)";

export const getDailyRows = async ({
  date,
  className,
  page = 1,
  limit = 20,
} = {}) => {
  const tanggal = date || getTodayWIB();

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (currentPage - 1) * perPage;

  // Filter kelas dipakai di COUNT dan data, jadi disiapkan sekali
  let classFilter = "";
  const filterParams = [];
  if (className) {
    classFilter = `AND ${KELAS_LABEL} = ?`;
    filterParams.push(className);
  }

  // 1. Hitung total siswa (tanpa JOIN sesi/absensi, jumlahnya tidak berubah)
  const [[{ total }]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM siswa s
    JOIN kelas kl
      ON kl.id_kelas = s.id_kelas
      AND kl.status_aktif = 1
    WHERE s.status_aktif = 1
      ${classFilter}
    `,
    filterParams,
  );

  // 2. Ambil data sesuai halaman
  const [rows] = await pool.query(
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
    ORDER BY kl.tingkat ASC, kl.nama_kelas ASC, s.nama_siswa ASC, s.id_siswa ASC
    LIMIT ? OFFSET ?
    `,
    [tanggal, ...filterParams, perPage, offset],
  );

  const totalPages = Math.ceil(total / perPage);

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
  const [{ date: tanggal, rows }, allowedClasses] = await Promise.all([
    getDailyRows({ date, className }),
    getActiveClassLabels(),
  ]);

  const summary = {
    total: rows.length,
    hadir: 0,
    terlambat: 0,
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
    belumAbsen: 0,
  };

  for (const r of rows) {
    switch (r.status) {
      case "hadir":
        summary.hadir++;
        break;
      case "terlambat":
        summary.terlambat++;
        break;
      case "sakit":
        summary.sakit++;
        break;
      case "izin":
        summary.izin++;
        break;
      case "tanpa keterangan":
        summary.tanpaKeterangan++;
        break;
      default:
        summary.belumAbsen++;
    }
  }

  return { date: tanggal, allowedClasses, summary };
};
