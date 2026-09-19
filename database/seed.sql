-- DATA DUMMY / DEVELOPMENT SEED
-- Semua password dummy: 123456
-- Hanya untuk development/testing. Jangan gunakan untuk production.

USE absensi_siswa;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE absensi;
TRUNCATE TABLE sesi_absensi;
TRUNCATE TABLE siswa;
TRUNCATE TABLE guru;
TRUNCATE TABLE admin;
TRUNCATE TABLE kelas;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id_user, username, password, role, status_aktif) VALUES
(1, 'admin', '123456', 'admin', 1),
(2, 'guru.budi', '123456', 'guru', 1),
(3, 'guru.siti', '123456', 'guru', 1),
(4, 'piket1', '123456', 'guru_piket', 1),
(5, 'piket2', '123456', 'guru_piket', 1),
(6, 'piket3', '123456', 'guru_piket', 1),
(7, 'andi', '123456', 'siswa', 1),
(8, 'budi', '123456', 'siswa', 1),
(9, 'citra', '123456', 'siswa', 1),
(10, 'dina', '123456', 'siswa', 1),
(11, 'eko', '123456', 'siswa', 1),
(12, 'fajar', '123456', 'siswa', 1);

INSERT INTO admin (id_admin, id_user, nama_admin, status_aktif) VALUES
(1, 1, 'Administrator Sekolah', 1);

INSERT INTO guru (id_guru, id_user, nip, nama_guru, status_aktif) VALUES
(1, 2, '19780101001', 'Budi Santoso', 1),
(2, 3, '19820512002', 'Siti Aminah', 1);

INSERT INTO kelas (id_kelas, nama_kelas, tingkat, tahun_ajaran, status_aktif) VALUES
(1, '7A', 7, '2026/2027', 1),
(2, '7B', 7, '2026/2027', 1),
(3, '8A', 8, '2026/2027', 1);

INSERT INTO siswa (id_siswa, id_user, nis, nama_siswa, id_kelas, status_aktif) VALUES
(1, 7, '2607001', 'Andi Pratama', 1, 1),
(2, 8, '2607002', 'Budi Setiawan', 1, 1),
(3, 9, '2607003', 'Citra Lestari', 1, 1),
(4, 10, '2607004', 'Dina Maharani', 2, 1),
(5, 11, '2607005', 'Eko Saputra', 2, 1),
(6, 12, '2608001', 'Fajar Ramadhan', 3, 1);

INSERT INTO sesi_absensi
(id_sesi, id_guru, id_kelas, tanggal, kode_qr, waktu_buka, waktu_tutup, status)
VALUES
(1, 1, 1, '2026-09-19', 'QR-7A-19092026',
 '2026-09-19 07:00:00', '2026-09-19 08:00:00', 'tutup');

INSERT INTO absensi
(id_absensi, id_sesi, id_siswa, status, waktu_scan, keterangan)
VALUES
(1, 1, 1, 'hadir', '2026-09-19 07:10:00', NULL),
(2, 1, 2, 'hadir', '2026-09-19 07:15:00', NULL);

-- Verifikasi siswa kelas 7A.
SELECT
    s.nis,
    s.nama_siswa,
    k.nama_kelas,
    a.status,
    a.waktu_scan
FROM siswa s
JOIN kelas k ON s.id_kelas = k.id_kelas
LEFT JOIN absensi a
    ON s.id_siswa = a.id_siswa AND a.id_sesi = 1
WHERE k.id_kelas = 1
ORDER BY s.nis;
