# Update Requirement: Absensi Kehadiran Harian

Frontend ini sudah disesuaikan agar absensi tidak bergantung pada mata pelajaran.

## Role
- `student`: scan QR satu kali per hari dan melihat riwayat sendiri.
- `teacher`: guru kelas, melihat kelas yang menjadi tanggung jawabnya, filter status, koreksi status/keterangan, export.
- `duty_teacher`: guru piket, melihat siswa belum scan, verifikasi status, rekap harian, export.
- `admin`: data master, akun/role, jadwal piket, sesi QR, data absensi.

## Kontrak data attendance yang disarankan
Setiap record attendance harian minimal:
- `id`
- `studentId`
- `attendanceDate`
- `sessionId`
- `scanTime` (nullable)
- `initialStatus`
- `currentStatus`
- `note`
- `changedAt` (nullable)
- `changedByUserId` (nullable)

Audit status sebaiknya tabel terpisah `attendance_status_logs` agar perubahan tidak menimpa bukti scan asli.

## Endpoint yang digunakan frontend
- `POST /attendance/scan`
- `GET /attendance/daily?date=&className=&status=&search=`
- `PATCH /attendance/:id/status`
- `GET /attendance/export.xlsx?date=&className=`
- `POST /attendance/sessions`
- `GET /attendance/sessions/active`
- `POST /attendance/sessions/:id/end`
- `GET /attendance/sessions/:id/monitor`
- `GET /teacher/dashboard`
- `GET /duty/dashboard`
- `GET /duty-schedules`
- `POST /duty-schedules`

## Aturan backend yang wajib
Frontend hanya membantu UX. Backend tetap wajib menegakkan:
1. Unique attendance per `(student_id, attendance_date)`.
2. Validasi sesi aktif dan QR/token.
3. Role/authorization untuk koreksi status dan export.
4. Guru kelas hanya mengakses kelas yang menjadi tanggung jawabnya.
5. Guru piket hanya mendapat kewenangan sesuai assignment/jadwal.
6. Simpan scan asli dan audit log saat status berubah.
7. Export produksi dikirim sebagai file `.xlsx` dari endpoint backend.

Mode mock frontend menggunakan CSV sebagai fallback export pratinjau karena tidak menambahkan library spreadsheet baru. Pada backend produksi endpoint `export.xlsx` tetap diharapkan mengembalikan `.xlsx` valid.
