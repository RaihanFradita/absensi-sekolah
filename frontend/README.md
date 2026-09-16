# Absensi Siswa — SMP Muhammadiyah 4 Cipondoh Tangerang

Frontend sistem absensi siswa berbasis QR Code. Dibangun dengan React + Vite,
Tailwind CSS, React Router DOM, Axios, dan WebSocket untuk update real-time.

> Nama proyek/folder secara teknis tetap `schoolattend` (package.json, dsb) —
> ini hanya identifier internal dan tidak tampil ke pengguna. Semua teks yang
> dilihat pengguna (judul tab, halaman Login, sidebar, navbar) sudah memakai
> nama & logo sekolah lewat `src/utils/constants.js` dan `src/assets/logo-sekolah.png`.

> **Status:** Tahap 1, 2 & 3 selesai.
> - Tahap 1: struktur folder, routing, Tailwind, AppLayout, Login, AuthContext,
>   ProtectedRoute, RoleRoute.
> - Tahap 2: Student Dashboard, ScanAttendance (kamera QR real via `html5-qrcode`,
>   lazy-loaded), AttendanceHistory (filter + pagination).
> - Tahap 3: Teacher Dashboard, CreateAttendanceSession, AttendanceSession (QR
>   besar + countdown + fullscreen), AttendanceMonitor (feed real-time via
>   WebSocket dengan indikator koneksi & reconnect).
>
> Halaman admin masih placeholder dan akan dilengkapi di tahap berikutnya.

## Instalasi

```bash
cd schoolattend
npm install
cp .env.example .env
```

Sesuaikan isi `.env` dengan alamat backend Anda:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

## Menjalankan (development)

```bash
npm run dev
```

Buka `http://localhost:5173`. Karena backend belum terhubung, form login akan
menampilkan pesan error saat submit (request ke `/auth/login` gagal) — ini
diharapkan sampai backend tersedia atau endpoint di-mock.

## Build production

```bash
npm run build
npm run preview   # opsional, preview hasil build
```

## Lint

```bash
npm run lint
```

## Struktur folder

Struktur mengikuti pemisahan `components` (ui / layout / attendance),
`pages` (auth / student / teacher / admin), `routes`, `services`, `context`,
`hooks`, dan `utils` — lihat isi masing-masing folder di `src/`.

## Role & routing

Tiga role: `student`, `teacher`, `admin`. Setelah login, user diarahkan ke
dashboard sesuai role dari **respons backend** (bukan dari input form).

- `ProtectedRoute` (`src/routes/ProtectedRoute.jsx`) — memastikan user sudah login.
- `RoleRoute` (`src/routes/RoleRoute.jsx`) — membatasi subtree route ke role tertentu.

Keduanya **hanya proteksi navigasi di frontend untuk UX**. Otorisasi yang
sesungguhnya tetap wajib dilakukan backend di setiap endpoint API.

## Catatan keamanan frontend

- Password tidak pernah disimpan; hanya token dari respons login yang disimpan
  di `localStorage` (`src/services/authService.js`).
- Role user selalu diambil dari respons backend saat login, bukan dari input.
- `src/services/api.js` menangani status 401 dengan logout paksa dan tidak
  menampilkan detail error internal backend ke pengguna.

## Fitur Tahap 2

- **StudentDashboard** — identitas siswa, status sesi aktif, ringkasan hari ini
  (hadir/terlambat/tidak hadir), riwayat terbaru. Semua data dari
  `attendanceService.getStudentDashboard()`.
- **ScanAttendance** — akses kamera lewat `html5-qrcode` (lazy-loaded, hanya
  dimuat saat halaman ini dibuka), state permission/loading/success/error
  sesuai pesan di spesifikasi ("QR Code tidak valid.", "Sesi absensi sudah
  berakhir.", dst). QR hanya berisi session token; identitas siswa diambil
  backend dari token login, bukan dari frontend.
- **AttendanceHistory** — filter tanggal/mapel/status, tabel responsif (card
  list di mobile), pagination, empty state kontekstual (beda pesan saat
  filter aktif vs benar-benar belum ada data).

## Fitur Tahap 3

- **TeacherDashboard** — jadwal hari ini, sesi aktif (jika ada) dengan link cepat
  ke halaman sesi, statistik hadir/terlambat/belum absen.
- **CreateAttendanceSession** — form pilih kelas/mapel/jadwal, durasi sesi, dan
  batas keterlambatan, dengan validasi dan loading/error state. Setelah
  berhasil dibuat, diarahkan ke `AttendanceSession`. Daftar kelas/mapel/jadwal
  di form ini masih data sementara (`MOCK_CLASSES`, dst. — diberi komentar di
  kode) karena endpoint lookup-nya belum ada di spesifikasi service.
- **AttendanceSession** — QR Code besar (`qrcode.react`) dari `qrToken` yang
  dikirim backend (frontend tidak pernah membuat token sendiri), countdown
  masa aktif, tombol fullscreen (Fullscreen API), tombol akhiri sesi dengan
  `ConfirmDialog`, dan statistik yang ikut ter-update lewat WebSocket.
- **AttendanceMonitor** — feed absensi real-time (`LiveAttendanceFeed`, urutan
  terbaru di atas), indikator status koneksi WebSocket, tombol "Sambungkan
  Ulang" saat terputus, counter hadir/terlambat.
- `useWebSocket` — hook yang membungkus `websocketService` (auto-reconnect,
  status connecting/connected/reconnecting/failed) untuk dipakai halaman mana
  pun yang butuh update real-time.

## Tahap selanjutnya

- Tahap 4: Admin Dashboard, CRUD Siswa/Guru/Kelas/Mapel/Jadwal, AttendanceReports
- Tahap 5: Polish responsive, loading/error/empty state, toast, ESLint cleanup final

## Mode Pratinjau (tanpa backend)

Saat menjalankan `npm run dev`, halaman Login menampilkan kotak **"Mode
Pratinjau"** dengan 3 tombol (Siswa / Guru / Admin). Tombol ini login
memakai data contoh (`src/services/mockData.js`) tanpa memanggil backend
sama sekali — berguna untuk melihat semua halaman sebelum backend siap.

Yang ikut disimulasikan di mode ini:
- Dashboard, riwayat absensi, dan hasil scan QR (siswa) — data contoh.
- Dashboard, buat sesi, tampilan QR + countdown, dan monitor (guru) — data
  contoh, termasuk simulasi "siswa scan QR" setiap beberapa detik lewat
  `useWebSocket` (menggantikan koneksi WebSocket sungguhan).

Catatan penting:
- Kotak ini **hanya tampil di development** (`import.meta.env.DEV`) dan
  otomatis hilang dari hasil `npm run build` — tidak akan terlihat oleh
  siswa/guru di production.
- Untuk keluar dari mode pratinjau, cukup klik **Keluar** di sidebar seperti
  logout biasa.
- Begitu backend sungguhan siap, mode ini bisa dibiarkan (tidak mengganggu
  alur login/fetch asli) atau dihapus dengan menghilangkan blok
  `import.meta.env.DEV && (...)` di `src/pages/auth/Login.jsx` beserta
  `src/services/mockData.js` dan cabang `isMockMode()` di `authService.js`,
  `attendanceService.js`, dan `useWebSocket.js`.
