import express from "express";

export const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/students", students);
app.use("/api/teacher", teacher);

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