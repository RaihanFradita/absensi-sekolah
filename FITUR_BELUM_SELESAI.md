# Daftar Fitur Belum Selesai (Roadmap & Status Pengembangan)

> **Sistem Absensi Sekolah SMP Berbasis QR**
> _Dokumen ini berisi hasil analisis fitur yang belum selesai, komponen yang masih menggunakan mock data, serta endpoint API yang belum diimplementasikan._

---

## 📊 Summary Status Proyek

- **Backend API**: Baru mengimplementasikan Autentikasi (Login, Logout, Me), Manajemen Guru (Get, Add, Edit, Deactivate), Manajemen Kelas (Add, Get, Edit, Deactivate), dan Pembuatan Sesi Absensi dasar.
- **Frontend UI**: Sebagian besar antarmuka UI sudah responsif dan modern, namun **banyak halaman masih menggunakan Mock Data (`mockData.js`)** atau **berupa halaman Placeholder**.
- **Integrasi Database & API**: Fitur inti absensi (Scan QR, Rekap Harian, Edit Status Absensi, Export Excel, Realtime Monitor, Guru Piket) belum terintegrasi ke backend database Node.js/MySQL.

---

## 🔴 1. Fitur Frontend UI (Belum Dibuat / Masih Placeholder)

| Fitur                       | Halaman / File                                                                                                                                           | Status         | Keterangan                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Kelola Data Kelas**       | [`Classes.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/admin/Classes.jsx)     | 🟡 Placeholder | Halaman UI belum dibuat (menggunakan `_Placeholder.jsx`), padahal API backend kelas (`/api/admin/class`) sudah tersedia. |
| **Kelola Mata Pelajaran**   | [`Subjects.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/admin/Subjects.jsx)   | 🔴 Placeholder | Halaman UI belum dibuat (`_Placeholder.jsx`). Di backend belum ada tabel/endpoint mata pelajaran.                        |
| **Kelola Jadwal Pelajaran** | [`Schedules.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/admin/Schedules.jsx) | 🔴 Placeholder | Halaman UI belum dibuat (`_Placeholder.jsx`). Di backend belum ada tabel/endpoint jadwal pelajaran.                      |

---

## 🟡 2. Fitur Frontend yang Masih Menggunakan Mock Data (Belum Integrasi API Real)

| Fitur                                 | Halaman / Service                                                                                                                                                                                                                                                                                                                              | Status       | Keterangan                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Kelola Akun Siswa**                 | [`StudentAccounts.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/admin/StudentAccounts.jsx)                                                                                                                                                                           | 🟡 Mock Data | Menggunakan array `previewStudents` lokal. Tombol Reset Password hanya berupa pratinjau toast.             |
| **Kelola Akun Guru**                  | [`TeacherAccounts.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/admin/TeacherAccounts.jsx)                                                                                                                                                                           | 🟡 Mock Data | Menggunakan array `previewTeachers` lokal. Tombol Reset Password hanya berupa pratinjau toast.             |
| **Penugasan Guru Piket**              | [`DutySchedules.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/admin/DutySchedules.jsx)                                                                                                                                                                               | 🟡 Mock Data | Menyimpan ke state lokal/mock (`MOCK_DUTY_SCHEDULES`). Belum ada backend API untuk Jadwal Piket.           |
| **Scan QR Absensi Siswa**             | [`ScanAttendance.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/student/ScanAttendance.jsx) & [`attendanceService.js`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/services/attendanceService.js)     | 🟡 Mock Data | Menggunakan `localStorage` dan fallback `mockData.js`. Belum terhubung ke endpoint `/api/attendance/scan`. |
| **Riwayat Absensi Siswa**             | [`AttendanceHistory.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/student/AttendanceHistory.jsx)                                                                                                                                                                     | 🟡 Mock Data | Data riwayat absensi diambil dari array `HISTORY` static di `mockData.js`.                                 |
| **Dashboard Siswa**                   | [`StudentDashboard.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/student/StudentDashboard.jsx)                                                                                                                                                                       | 🟡 Mock Data | Ringkasan statistik kehadiran (hadir, sakit, izin, alfa) masih hardcoded/mock.                             |
| **Dashboard Guru & Guru Piket**       | [`TeacherDashboard.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/teacher/TeacherDashboard.jsx) & [`DutyDashboard.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/duty/DutyDashboard.jsx)     | 🟡 Mock Data | Rekap kehadiran harian dan daftar siswa masih bersumber dari `mockData.js`.                                |
| **Rekap & Laporan Absensi Harian**    | [`AttendanceReports.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/admin/AttendanceReports.jsx) & [`DutyRecap.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/duty/DutyRecap.jsx)             | 🟡 Mock Data | Pengubahan status siswa dan ekspor file CSV/Excel dilakukan secara mockup di browser.                      |
| **Monitoring Real-time Sesi Absensi** | [`AttendanceMonitor.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/teacher/AttendanceMonitor.jsx) & [`websocketService.js`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/services/websocketService.js) | 🟡 Mock Data | Service dikonfigurasi ke `ws://localhost:8000/ws`, tetapi backend Node.js belum memiliki server WebSocket. |
| **Penutupan Sesi Absensi**            | [`AttendanceSession.jsx`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/pages/teacher/AttendanceSession.jsx)                                                                                                                                                                     | 🟡 Mock Data | Penutupan sesi absensi oleh guru menggunakan mock handler `endAttendanceSession`.                          |

---

## 🔵 3. Backend API Endpoints (Belum Dibuat / Belum Lengkap)

### A. Modul Siswa (Student Management API)

- [x] **`POST /api/admin/student/add`** : Tambah siswa baru beserta pembuatan akun login (`users` + `siswa`).
- [x] **`PUT /api/admin/student/edit/:id`** : Edit data profil siswa & username akun.
- [ ] **`PATCH /api/admin/student/:id/deactivate`** : Nonaktifkan siswa & akun user (Soft delete).
- [ ] **`POST /api/admin/student/:id/reset-password`** : Reset password akun siswa.

### B. Modul Sesi & Absensi (Attendance Engine API)

- [ ] **`POST /api/attendance/scan`** : API untuk siswa mengirimkan QR token & mencatat kehadiran (`hadir`/`terlambat`).
- [ ] **`GET /api/attendance/daily`** : API rekap absensi harian per kelas/tanggal dengan status (`hadir`, `terlambat`, `sakit`, `izin`, `tanpa keterangan`).
- [ ] **`PATCH /api/attendance/:id/status`** : API pengubahan status absensi oleh Guru Piket/Admin beserta pencatatan keterangan & audit `changed_by`.
- [ ] **`GET /api/attendance/export.xlsx`** : API generate rekap absensi ke file Excel (.xlsx) atau CSV.
- [ ] **`POST /api/attendance/sessions/:id/end`** : API menutup sesi absensi secara manual oleh Guru.
- [ ] **`GET /api/attendance/sessions/:id/monitor`** : API statistik monitoring sesi absensi secara real-time / polling.
- [ ] **`GET /api/students/attendance-history`** : API riwayat absensi siswa berdasarkan ID siswa yang sedang login.

### C. Modul Guru Piket (Duty Schedule API)

- [ ] **`GET /api/duty-schedules`** : Mengambil daftar penugasan guru piket berdasarkan periode/bulan.
- [ ] **`POST /api/duty-schedules`** : Menambahkan / memperbarui penugasan guru piket pada tanggal tertentu.

### D. Server WebSocket (Realtime Updates)

- [ ] Setup WebSocket server (menggunakan `ws` atau `socket.io` di Express Node.js) untuk broadcast event saat siswa scan QR ke monitor Guru.

---

## 🛠️ 4. Bug & Perbaikan Kode Terdeteksi

1. **SQL Error di Backend Service**:
   - [`admin-student-service.js`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/backend/src/services/admin/admin-student-service.js#L48): Query SQL `findAllClasses` memiliki syntax error:
     ```sql
     SELECT id_kelas, nama_kelas, tingkat, FROM kelas
     ```
     _(Terdapat koma ekstra sebelum `FROM kelas` yang akan menyebabkan query gagal saat dipanggil)_.

2. **Ketidakcocokan Endpoint Frontend & Backend**:
   - [`studentService.js`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/frontend/src/services/studentService.js): Menggunakan path URL `/students/...` yang berbeda dengan route backend yang terdaftar di `/admin/student/...`.

---

## 🚀 Rekomendasi Prioritas Pengerjaan (Next Action Plan)

1. **Perbaikan Bug Dasar & Endpoint Siswa**:
   - Perbaiki SQL error di [`admin-student-service.js`](file:///c:/Users/Asus/Documents/Perkuliahan/Semester%205/pemrograman%20web/PKM/absensi-sekolah/backend/src/services/admin/admin-student-service.js#L48).
   - Buat endpoint CRUD Siswa lengkap (`add`, `edit`, `deactivate`, `reset-password`).
2. **Pengembangan Absensi Engine di Backend**:
   - Buat controller & service untuk `scan`, `daily attendance`, `update status`, dan `export`.
3. **Implementasi UI Halaman Kelas**:
   - Ganti `Classes.jsx` dari placeholder menjadi UI CRUD Kelas nyata yang memanfaatkan API `/api/admin/class`.
4. **Integrasi Frontend ke API Real**:
   - Hubungkan `attendanceService.js` ke backend Express agar tidak bergantung pada `mockData.js`.
