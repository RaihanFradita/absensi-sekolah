-- DATABASE: absensi_siswa
-- Sistem Absensi Siswa SMP Berbasis QR
-- Struktur database tanpa data dummy.

CREATE DATABASE IF NOT EXISTS absensi_siswa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE absensi_siswa;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS absensi;
DROP TABLE IF EXISTS sesi_absensi;
DROP TABLE IF EXISTS siswa;
DROP TABLE IF EXISTS kelas;
DROP TABLE IF EXISTS guru;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id_user INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','guru','guru_piket','siswa') NOT NULL,
    status_aktif TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_user),
    UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE admin (
    id_admin INT NOT NULL AUTO_INCREMENT,
    id_user INT NOT NULL,
    nama_admin VARCHAR(100) NOT NULL,
    status_aktif TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_admin),
    UNIQUE KEY uq_admin_id_user (id_user),
    CONSTRAINT fk_admin_user FOREIGN KEY (id_user) REFERENCES users(id_user)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE guru (
    id_guru INT NOT NULL AUTO_INCREMENT,
    id_user INT NOT NULL,
    nip VARCHAR(20) NOT NULL,
    nama_guru VARCHAR(100) NOT NULL,
    status_aktif TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_guru),
    UNIQUE KEY uq_guru_id_user (id_user),
    UNIQUE KEY uq_guru_nip (nip),
    CONSTRAINT fk_guru_user FOREIGN KEY (id_user) REFERENCES users(id_user)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE kelas (
    id_kelas INT NOT NULL AUTO_INCREMENT,
    nama_kelas VARCHAR(10) NOT NULL,
    tingkat TINYINT NOT NULL,
    tahun_ajaran VARCHAR(9) NOT NULL,
    status_aktif TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_kelas),
    UNIQUE KEY uq_kelas_tahun (nama_kelas, tahun_ajaran)
) ENGINE=InnoDB;

CREATE TABLE siswa (
    id_siswa INT NOT NULL AUTO_INCREMENT,
    id_user INT NOT NULL,
    nis VARCHAR(20) NOT NULL,
    nama_siswa VARCHAR(100) NOT NULL,
    id_kelas INT NOT NULL,
    status_aktif TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_siswa),
    UNIQUE KEY uq_siswa_id_user (id_user),
    UNIQUE KEY uq_siswa_nis (nis),
    KEY idx_siswa_kelas (id_kelas),
    CONSTRAINT fk_siswa_user FOREIGN KEY (id_user) REFERENCES users(id_user)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_siswa_kelas FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE sesi_absensi (
    id_sesi INT NOT NULL AUTO_INCREMENT,
    id_guru INT NOT NULL,
    id_kelas INT NOT NULL,
    tanggal DATE NOT NULL,
    kode_qr VARCHAR(100) NOT NULL,
    waktu_buka DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    waktu_tutup DATETIME NULL,
    status ENUM('aktif','tutup','batal') NOT NULL DEFAULT 'aktif',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_sesi),
    UNIQUE KEY uq_sesi_kode_qr (kode_qr),
    UNIQUE KEY uq_sesi_kelas_tanggal (id_kelas, tanggal),
    KEY idx_sesi_guru (id_guru),
    KEY idx_sesi_tanggal (tanggal),
    CONSTRAINT fk_sesi_guru FOREIGN KEY (id_guru) REFERENCES guru(id_guru)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sesi_kelas FOREIGN KEY (id_kelas) REFERENCES kelas(id_kelas)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE absensi (
    id_absensi INT NOT NULL AUTO_INCREMENT,
    id_sesi INT NOT NULL,
    id_siswa INT NOT NULL,
    status ENUM('hadir','terlambat','sakit','izin','tanpa keterangan') NOT NULL,
    waktu_scan DATETIME NULL,
    waktu_catat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    keterangan VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_absensi),
    UNIQUE KEY uq_absensi_sesi_siswa (id_sesi, id_siswa),
    KEY idx_absensi_siswa (id_siswa),
    KEY idx_absensi_status (status),
    CONSTRAINT fk_absensi_sesi FOREIGN KEY (id_sesi) REFERENCES sesi_absensi(id_sesi)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_absensi_siswa FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
