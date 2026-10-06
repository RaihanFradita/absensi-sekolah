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

INSERT INTO guru (id_guru, id_user, nama_guru, jenis_kelamin, status_aktif) VALUES
(1, 2, 'Budi Santoso', 'Laki-laki', 1),
(2, 3, 'Siti Aminah', 'Perempuan', 1);

INSERT INTO kelas (id_kelas, nama_kelas, tingkat, status_aktif) VALUES
(1, 'MM1', 7, 1), (2, 'MM2', 7, 1),
(3, 'A', 7, 1), (4, 'B', 7, 1), (5, 'C', 7, 1), (6, 'D', 7, 1), (7, 'E', 7, 1), (8, 'F', 7, 1),
(9, 'MM1', 8, 1), (10, 'MM2', 8, 1),
(11, 'A', 8, 1), (12, 'B', 8, 1), (13, 'C', 8, 1), (14, 'D', 8, 1), (15, 'E', 8, 1), (16, 'F', 8, 1),
(17, 'MM1', 9, 1), (18, 'MM2', 9, 1),
(19, 'A', 9, 1), (20, 'B', 9, 1), (21, 'C', 9, 1), (22, 'D', 9, 1), (23, 'E', 9, 1), (24, 'F', 9, 1);

INSERT INTO siswa (id_siswa, id_user, nama_siswa, id_kelas, jenis_kelamin, status_aktif) VALUES
(1, 7, 'Andi Pratama', 3, 'Laki-laki', 1),
(2, 8, 'Budi Setiawan', 3, 'Laki-laki', 1),
(3, 9, 'Citra Lestari', 3, 'Perempuan', 1),
(4, 10, 'Dina Maharani', 4, 'Perempuan', 1),
(5, 11, 'Eko Saputra', 4, 'Laki-laki', 1),
(6, 12, 'Fajar Ramadhan', 11, 'Laki-laki', 1);

INSERT INTO sesi_absensi
(id_sesi, id_guru, id_kelas, tanggal, kode_qr, waktu_buka, waktu_tutup, status)
VALUES
(1, 1, 3, '2026-09-19', 'QR-7A-19092026',
 '2026-09-19 07:00:00', '2026-09-19 08:00:00', 'tutup');

INSERT INTO absensi
(id_absensi, id_sesi, id_siswa, status, waktu_scan, keterangan)
VALUES
(1, 1, 1, 'hadir', '2026-09-19 07:10:00', NULL),
(2, 1, 2, 'hadir', '2026-09-19 07:15:00', NULL);

-- Verifikasi siswa kelas 7A.
SELECT
    s.nama_siswa,
    k.nama_kelas,
    a.status,
    a.waktu_scan
FROM siswa s
JOIN kelas k ON s.id_kelas = k.id_kelas
LEFT JOIN absensi a
    ON s.id_siswa = a.id_siswa AND a.id_sesi = 1
WHERE k.id_kelas = 1
ORDER BY s.nama_siswa;
