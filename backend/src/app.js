import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import kelasRoutes from './routes/kelasRoutes.js';
import siswaRoutes from './routes/siswaRoutes.js'; // <-- Tambahkan ini

export const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Terlalu banyak request dari IP ini, coba lagi nanti."
});
app.use(limiter);

// Daftarkan Rute CRUD
app.use('/api/kelas', kelasRoutes);
app.use('/api/siswa', siswaRoutes); // <-- Tambahkan ini