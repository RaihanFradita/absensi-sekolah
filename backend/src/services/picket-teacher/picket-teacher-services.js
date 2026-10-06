import { pool } from "../../config/database.js";

const getTodayWIB = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

const KELAS_LABEL = "CONCAT(kl.tingkat, kl.nama_kelas)";

export const getDailyRows = async ({ date, className }) => {
  const tanggal = date || getTodayWIB();
  const params = [tanggal];

  let classFilter = "";
  if (className) {
    classFilter = `AND ${KELAS_LABEL} = ?`;
    params.push(className);
  }

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
    ORDER BY kl.tingkat ASC, kl.nama_kelas ASC, s.nama_siswa ASC
    `,
    params,
  );

  return { date: tanggal, rows };
};

export const getActiveClassLabels = async () => {
  const [rows] = await pool.query(`
         SELECT CONCAT(tingkat, nama_kelas) AS nama_kelas
    FROM kelas
    WHERE status_aktif = 1
    ORDER BY tingkat ASC, nama_kelas ASC
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
