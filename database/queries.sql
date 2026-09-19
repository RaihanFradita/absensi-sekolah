USE absensi_siswa;

SHOW TABLES;

-- Data siswa + kelas
SELECT s.id_siswa, s.nis, s.nama_siswa,
       k.nama_kelas, k.tingkat, k.tahun_ajaran
FROM siswa s
JOIN kelas k ON s.id_kelas = k.id_kelas
ORDER BY k.id_kelas, s.nis;

-- Sesi absensi + guru + kelas
SELECT sa.id_sesi, g.nama_guru, k.nama_kelas,
       sa.tanggal, sa.kode_qr, sa.status
FROM sesi_absensi sa
JOIN guru g ON sa.id_guru = g.id_guru
JOIN kelas k ON sa.id_kelas = k.id_kelas;

-- Rekap kelas 7A
SELECT s.nis, s.nama_siswa, k.nama_kelas,
       COALESCE(a.status, 'belum tercatat') AS status_absensi,
       a.waktu_scan
FROM siswa s
JOIN kelas k ON s.id_kelas = k.id_kelas
LEFT JOIN absensi a
    ON a.id_siswa = s.id_siswa AND a.id_sesi = 1
WHERE k.id_kelas = 1
ORDER BY s.nis;

-- Jumlah absensi berdasarkan status
SELECT status, COUNT(*) AS jumlah
FROM absensi
WHERE id_sesi = 1
GROUP BY status;
