import {
  getDailyRows,
  getDutyDashboardData,
} from "../../services/picket-teacher/picket-teacher-services.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const parseQuery = (req) => {
  const date = req.query.date?.trim() || undefined;
  const className = req.query.className?.trim() || undefined;
  const status = req.query.status?.trim() || undefined;
  const search = req.query.search?.trim() || undefined;
  const all = req.query.all === "true" || req.query.all === "1";
  const { page, limit } = req.query;

  if (date && !DATE_RE.test(date)) {
    return { error: "Format tanggal harus YYYY-MM-DD." };
  }
  return { date, className, status, search, all, page, limit };
};

export const getDutyDashboard = async (req, res) => {
  const q = parseQuery(req);
  if (q.error) return res.status(400).json({ message: q.error });

  try {
    const data = await getDutyDashboardData(q);
    res.json(data);
  } catch (err) {
    console.error("getDutyDashboard:", err);
    res.status(500).json({ message: "Gagal memuat dashboard piket." });
  }
};

export const getDaily = async (req, res) => {
  const q = parseQuery(req);
  if (q.error) return res.status(400).json({ message: q.error });

  try {
    const { date, rows, pagination } = await getDailyRows(q);
    res.json({ date, rows, pagination });
  } catch (err) {
    console.error("getDaily:", err);
    res.status(500).json({ message: "Gagal memuat data absensi harian." });
  }
};
