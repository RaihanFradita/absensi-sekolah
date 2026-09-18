# 📚 Ringkasan Frontend — Sistem Absensi Sekolah

> Dokumen ini merangkum seluruh struktur kode frontend secara terstruktur agar mudah dipahami oleh siapa pun yang baru bergabung ke proyek ini.

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| **React** | 19 | UI library utama |
| **Vite** | 8 | Build tool & dev server |
| **React Router DOM** | 7 | Client-side routing |
| **TailwindCSS** | 3 | Styling / utility CSS |
| **Axios** | 1.x | HTTP client ke backend |
| **html5-qrcode** | 2.x | Scan QR Code dari kamera |
| **qrcode.react** | 4.x | Generate/tampilkan QR Code |
| **lucide-react** | 1.x | Ikon UI |
| **react-hot-toast** | 2.x | Notifikasi toast |

**Menjalankan secara lokal:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Struktur Direktori

```
frontend/
├── src/
│   ├── main.jsx          # Entry point React
│   ├── App.jsx           # Root component + provider setup
│   ├── index.css         # CSS global
│   ├── assets/           # Gambar / aset statis
│   ├── context/          # React Context (state global)
│   ├── hooks/            # Custom hooks
│   ├── routes/           # Konfigurasi routing
│   ├── pages/            # Halaman per-role
│   │   ├── auth/         # Halaman login
│   │   ├── student/      # Halaman siswa
│   │   ├── teacher/      # Halaman guru kelas
│   │   ├── duty/         # Halaman guru piket
│   │   └── admin/        # Halaman admin
│   ├── components/       # Komponen reusable
│   │   ├── layout/       # Shell layout (sidebar, topbar, navbar)
│   │   ├── attendance/   # Komponen khusus absensi
│   │   └── ui/           # Komponen UI generik
│   ├── services/         # Lapisan API & logika komunikasi
│   └── utils/            # Konstanta & utilitas
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔁 Alur Aplikasi (Flow Utama)

```
main.jsx
  └─► App.jsx
        ├─ BrowserRouter      ← Routing berbasis URL
        ├─ AuthProvider       ← State autentikasi global
        ├─ ToastProvider      ← Notifikasi global
        └─ AppRoutes          ← Semua definisi route
              ├─ /login       ← Publik
              └─ /*           ← Protected (login wajib)
                    └─ AppLayout (Sidebar + Topbar + Outlet)
                          ├─ /student/*
                          ├─ /teacher/*
                          ├─ /duty/*
                          └─ /admin/*
```

### Redirect Otomatis Berdasarkan Role

Saat user mengakses `/`, komponen `RootRedirect` mengarahkan ke halaman awal sesuai role:

| Role | Halaman Awal |
|---|---|
| `siswa` | `/student/dashboard` |
| `guru` | `/teacher/dashboard` |
| `guru_piket` | `/duty/dashboard` |
| `admin` | `/admin/dashboard` |

---

## 👤 Sistem Autentikasi

### `src/context/AuthContext.jsx`
Context global yang menyimpan state autentikasi. Tersedia di seluruh komponen lewat hook `useAuth`.

**State yang disimpan:**
- `user` — objek user yang login (`{ id, name, role, ... }`)
- `isAuthenticated` — boolean apakah sudah login
- `isAuthenticating` — boolean saat proses login berlangsung
- `authError` — pesan error jika login gagal

**Fungsi yang disediakan:**
| Fungsi | Keterangan |
|---|---|
| `login({ identifier, password })` | Login ke backend sungguhan |
| `loginAsMock(role)` | Login pratinjau tanpa backend |
| `logout()` | Hapus sesi, redirect ke login |

**Cara pakai di komponen:**
```jsx
import useAuth from '../hooks/useAuth';

const { user, isAuthenticated, login, logout } = useAuth();
```

### `src/services/authService.js`
Lapisan service yang menangani panggilan API untuk autentikasi:
- Menyimpan token JWT ke `localStorage` dengan key `schoolattend_token`
- Menyimpan data user ke `localStorage` dengan key `schoolattend_user`
- Mendukung **Mock Mode** untuk demo tanpa backend

---

## 🌐 Komunikasi dengan Backend

### `src/services/api.js` — HTTP Client (Axios)

Semua request HTTP melewati instance Axios terpusat ini.

- **Base URL:** diambil dari `VITE_API_BASE_URL` di file `.env` (default: `http://localhost:3000/api`)
- **Request Interceptor:** otomatis menyisipkan `Authorization: Bearer <token>` di setiap request
- **Response Interceptor:**
  - Jika server merespons `401` → logout paksa otomatis
  - Jika error server (`5xx`) → pesan aman ditampilkan ke user (bukan stack trace)

### `src/services/attendanceService.js` — API Absensi

Kumpulan fungsi untuk semua operasi absensi. Setiap fungsi mendukung **Mock Mode**.

| Fungsi | HTTP | Endpoint | Kegunaan |
|---|---|---|---|
| `getStudentDashboard()` | GET | `/student/dashboard` | Data dashboard siswa |
| `getStudentProfile()` | GET | `/student/profile` | Profil siswa |
| `scanAttendance({ sessionToken })` | POST | `/attendance/scan` | Siswa scan QR |
| `getAttendanceHistory(params)` | GET | `/student/attendance-history` | Riwayat absensi siswa |
| `getTeacherDashboard()` | GET | `/teacher/dashboard` | Data dashboard guru |
| `getDutyDashboard()` | GET | `/duty/dashboard` | Data dashboard piket |
| `getDailyAttendance(params)` | GET | `/attendance/daily` | Data absensi harian |
| `updateAttendanceStatus(id, payload)` | PATCH | `/attendance/:id/status` | Update status absensi |
| `exportAttendanceExcel(params)` | GET | `/attendance/export.xlsx` | Ekspor Excel/CSV |
| `createAttendanceSession(payload)` | POST | `/attendance/sessions` | Buat sesi QR baru |
| `getActiveSession()` | GET | `/attendance/sessions/active` | Ambil sesi aktif |
| `endAttendanceSession(id)` | POST | `/attendance/sessions/:id/end` | Akhiri sesi |
| `getAttendanceMonitor(id)` | GET | `/attendance/sessions/:id/monitor` | Monitor sesi |
| `getDutySchedules(params)` | GET | `/duty-schedules` | Jadwal piket |
| `saveDutySchedule(payload)` | POST | `/duty-schedules` | Simpan jadwal piket |

### `src/services/websocketService.js` — Real-Time WebSocket

Kelas `WebSocketService` membungkus native WebSocket dengan fitur:
- **Auto-reconnect** setiap 3 detik, maksimal 10 percobaan
- Token autentikasi disisipkan di URL koneksi (`?token=...`)
- Status koneksi: `idle → connecting → connected → disconnected → reconnecting → failed`

---

## 🎣 Custom Hooks

### `src/hooks/useAuth.js`
Shortcut untuk mengakses `AuthContext`.
```js
const { user, role, isAuthenticated, login, logout } = useAuth();
```

### `src/hooks/useAttendance.js`
Hook generik untuk fetch data dari service dengan state loading/error/data.
```js
const fetcher = useCallback(
  () => attendanceService.getAttendanceHistory({ page }),
  [page]
);
const { data, isLoading, error, refetch } = useAttendance(fetcher);
```

### `src/hooks/useWebSocket.js`
Hook untuk koneksi real-time WebSocket. Di Mock Mode, event disimulasikan dengan `setInterval`.
```js
const { status, reconnect } = useWebSocket(`/sessions/${id}/monitor`, {
  enabled: Boolean(id),
  onMessage: (payload) => handleNewAttendance(payload),
});
```

---

## 🗺️ Routing & Perlindungan Halaman

### `src/routes/ProtectedRoute.jsx`
Mengecek apakah user sudah login. Jika belum → redirect ke `/login`.

### `src/routes/RoleRoute.jsx`
Mengecek apakah role user sesuai dengan `allowedRoles`. Jika tidak → redirect ke halaman awal role yang bersangkutan.

### `src/routes/AppRoutes.jsx`
Mendefinisikan seluruh route aplikasi dengan pola nested:
```
ProtectedRoute
  └─ AppLayout
       ├─ RoleRoute (allowedRoles: ['siswa'])
       │    ├─ /student/dashboard
       │    ├─ /student/scan
       │    ├─ /student/history
       │    └─ /student/profile
       ├─ RoleRoute (allowedRoles: ['guru'])
       │    ├─ /teacher/dashboard
       │    ├─ /teacher/profile
       │    ├─ /teacher/sessions/create
       │    ├─ /teacher/sessions/:sessionId
       │    └─ /teacher/monitor
       ├─ RoleRoute (allowedRoles: ['guru_piket'])
       │    ├─ /duty/dashboard
       │    ├─ /duty/not-scanned
       │    └─ /duty/recap
       └─ RoleRoute (allowedRoles: ['admin'])
            ├─ /admin/dashboard
            ├─ /admin/students
            ├─ /admin/teachers
            ├─ /admin/classes
            ├─ /admin/user-roles
            ├─ /admin/duty-schedules
            ├─ /admin/attendance-sessions
            ├─ /admin/subjects
            ├─ /admin/schedules
            └─ /admin/reports
```

---

## 🖼️ Layout Aplikasi

### `src/components/layout/AppLayout.jsx`
Shell utama setelah login. Terdiri dari:
- `Sidebar` — navigasi samping kiri (desktop, lebar 256px / `lg:pl-64`)
- `Topbar` — header atas
- `<Outlet />` — area konten halaman yang sedang aktif
- `MobileNavbar` — navigasi bawah layar (mobile only)

### Konfigurasi Navigasi — `src/utils/navConfig.js`
Setiap role memiliki daftar item navigasi sendiri (`NAV_ITEMS[role]`). Navigasi mobile dibatasi `MOBILE_NAV_LIMIT = 5` item.

---

## 📄 Halaman per Role

### Siswa (`src/pages/student/`)

| File | Route | Fungsi |
|---|---|---|
| `StudentDashboard.jsx` | `/student/dashboard` | Statistik kehadiran & info sesi aktif |
| `ScanAttendance.jsx` | `/student/scan` | Scan QR Code untuk absen |
| `AttendanceHistory.jsx` | `/student/history` | Riwayat absensi dengan filter |
| `StudentProfile.jsx` | `/student/profile` | Profil & foto siswa |

### Guru Kelas (`src/pages/teacher/`)

| File | Route | Fungsi |
|---|---|---|
| `TeacherDashboard.jsx` | `/teacher/dashboard` | Rekap kehadiran kelas |
| `TeacherProfile.jsx` | `/teacher/profile` | Profil guru |
| `CreateAttendanceSession.jsx` | `/teacher/sessions/create` | Buat sesi QR absensi baru |
| `AttendanceSession.jsx` | `/teacher/sessions/:id` | Detail sesi + tampilkan QR |
| `AttendanceMonitor.jsx` | `/teacher/monitor` | Monitor absensi real-time via WebSocket |

### Guru Piket (`src/pages/duty/`)

| File | Route | Fungsi |
|---|---|---|
| `DutyDashboard.jsx` | `/duty/dashboard` | Ringkasan piket hari ini |
| `NotScanned.jsx` | `/duty/not-scanned` | Daftar siswa belum scan |
| `DutyRecap.jsx` | `/duty/recap` | Rekap absensi harian |

### Admin (`src/pages/admin/`)

| File | Route | Fungsi |
|---|---|---|
| `AdminDashboard.jsx` | `/admin/dashboard` | Dashboard statistik global |
| `Students.jsx` | `/admin/students` | Manajemen data siswa |
| `Teachers.jsx` | `/admin/teachers` | Manajemen data guru |
| `Classes.jsx` | `/admin/classes` | Manajemen kelas |
| `Subjects.jsx` | `/admin/subjects` | Manajemen mata pelajaran |
| `Schedules.jsx` | `/admin/schedules` | Jadwal akademik |
| `UserRoles.jsx` | `/admin/user-roles` | Manajemen akun & role user |
| `DutySchedules.jsx` | `/admin/duty-schedules` | Jadwal piket guru |
| `AttendanceSessions.jsx` | `/admin/attendance-sessions` | Daftar semua sesi QR |
| `AttendanceReports.jsx` | `/admin/reports` | Laporan & ekspor data absensi |

---

## 🧩 Komponen Reusable

### Layout (`src/components/layout/`)

| Komponen | Kegunaan |
|---|---|
| `AppLayout.jsx` | Shell utama (sidebar + konten + navbar) |
| `Sidebar.jsx` | Navigasi samping desktop |
| `Topbar.jsx` | Header atas (judul halaman + info user) |
| `MobileNavbar.jsx` | Navigasi bawah mobile |
| `PageContainer.jsx` | Wrapper halaman (padding + max-width konsisten) |

### Absensi (`src/components/attendance/`)

| Komponen | Kegunaan |
|---|---|
| `AttendanceStats.jsx` | Kartu statistik kehadiran (hadir/izin/sakit/dll) |
| `AttendanceStatus.jsx` | Badge status absensi dengan warna |
| `AttendanceTable.jsx` | Tabel data absensi siswa |
| `DailyAttendanceManager.jsx` | Manajer absensi harian (filter + update status) |
| `LiveAttendanceFeed.jsx` | Feed real-time siswa yang baru scan |
| `QRDisplay.jsx` | Tampilkan gambar QR Code sesi |
| `QRScanner.jsx` | Buka kamera & scan QR Code |

### UI Generik (`src/components/ui/`)

| Komponen | Kegunaan |
|---|---|
| `Button.jsx` | Tombol dengan varian (primary, outline, danger) |
| `Input.jsx` | Input field dengan label & pesan error |
| `Card.jsx` | Container kartu dengan shadow |
| `Badge.jsx` | Label badge berwarna kecil |
| `Toast.jsx` | Sistem notifikasi toast global |
| `ConfirmDialog.jsx` | Dialog konfirmasi sebelum aksi destruktif |
| `EmptyState.jsx` | Tampilan saat data kosong |
| `Loading.jsx` | Layar loading fullscreen |
| `Spinner.jsx` | Spinner loading kecil inline |

---

## 🔧 Utilitas

### `src/utils/constants.js`
Konstanta aplikasi yang dipakai di seluruh kode:

```js
// Nama sekolah
APP_NAME = "SMP Muhammadiyah 4 Cipondoh"

// Role user
ROLES = { STUDENT: 'siswa', TEACHER: 'guru', DUTY_TEACHER: 'guru_piket', ADMIN: 'admin' }

// Status absensi
ATTENDANCE_STATUS = {
  PRESENT: 'present', LATE: 'late', ABSENT: 'absent',
  EXCUSED: 'excused', SICK: 'sick', NOT_YET: 'not_yet'
}

// Key localStorage
AUTH_TOKEN_KEY = "schoolattend_token"
AUTH_USER_KEY  = "schoolattend_user"
```

### `src/utils/navConfig.js`
Daftar item navigasi per role untuk Sidebar dan MobileNavbar.

### `src/utils/formatDate.js` & `formatTime.js`
Fungsi utilitas untuk memformat tanggal dan waktu ke format Indonesia.

---

## 🎭 Mode Pratinjau (Mock Mode)

Fitur khusus yang memungkinkan tampilan semua halaman **tanpa backend** sungguhan. Berguna saat backend belum siap.

**Cara mengaktifkan:** Klik tombol _"Coba tanpa backend"_ di halaman Login, lalu pilih role.

**Cara kerja:**
1. `authService.loginMock(role)` dipanggil — menyimpan mock token & user ke localStorage
2. Flag `mock_mode = true` disimpan di localStorage
3. Setiap fungsi di `attendanceService.js` mengecek `isMockMode()` — jika `true`, kembalikan data dari `mockData.js`
4. `useWebSocket` tidak membuka koneksi WebSocket sungguhan — event disimulasikan tiap 4 detik

**File mock:** `src/services/mockData.js` — berisi semua data dummy.

---

## 🔐 Variabel Environment

Buat file `.env` di folder `frontend/` berdasarkan `.env.example`:

```env
# URL REST API backend
VITE_API_BASE_URL=http://localhost:3000/api

# URL WebSocket backend
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

---

## 🗝️ Poin Penting untuk Developer Baru

1. **Jangan tambah role di frontend** — role SELALU berasal dari respons backend (`authService.login`), tidak dari form login.
2. **Gunakan `useAttendance` hook** untuk semua fetch data agar loading/error state konsisten.
3. **Gunakan `useWebSocket` hook** untuk fitur real-time, bukan langsung pakai `WebSocketService`.
4. **Mock Mode otomatis off** saat login sungguhan berhasil.
5. **Semua request HTTP melewati `api.js`** — jangan pakai Axios atau fetch langsung di komponen.
6. **Route baru harus didaftarkan di `AppRoutes.jsx`** dan item navigasinya di `navConfig.js`.
