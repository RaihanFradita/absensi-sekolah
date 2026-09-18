# Database Sistem Absensi Siswa

Database untuk aplikasi absensi siswa SMP berbasis QR.

## Tanggung jawab database

- Perancangan struktur tabel.
- Relasi antar tabel.
- Primary key, foreign key, dan unique constraint.
- Seed data untuk pengujian frontend/backend.
- Query verifikasi dan rekap absensi.

## Struktur tabel

| Tabel | Fungsi |
|---|---|
| `users` | Akun dan role pengguna |
| `admin` | Profil administrator |
| `guru` | Profil guru |
| `kelas` | Data kelas dan tahun ajaran |
| `siswa` | Data siswa dan kelas |
| `sesi_absensi` | Sesi absensi dan kode QR |
| `absensi` | Catatan kehadiran siswa |

## Relasi

```text
users
 ├── admin
 ├── guru
 └── siswa
        │
        └── kelas

guru + kelas
      │
      ▼
sesi_absensi
      │
      ▼
absensi ◄── siswa
```

## Cara menjalankan

1. Jalankan `schema.sql` pada MySQL.
2. Jalankan `seed.sql` untuk memasukkan data dummy.
3. Pastikan konfigurasi `.env` backend mengarah ke database `absensi_siswa`.
4. Jalankan `queries.sql` untuk memeriksa data.

## Akun dummy

Semua akun development menggunakan password `123456`.

| Username | Role |
|---|---|
| `admin` | Admin |
| `guru.budi` | Guru |
| `guru.siti` | Guru |
| `piket1` | Guru Piket |
| `piket2` | Guru Piket |
| `piket3` | Guru Piket |
| `andi` | Siswa |
| `budi` | Siswa |
| `citra` | Siswa |

**Catatan:** password di atas hanya data dummy untuk development/testing. Jangan gunakan kredensial tersebut pada production.

## Status

Schema dan seed data disiapkan untuk mendukung pengembangan dan pengujian frontend serta backend sistem absensi.
