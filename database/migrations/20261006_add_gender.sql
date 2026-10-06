ALTER TABLE guru
  ADD COLUMN jenis_kelamin ENUM('Laki-laki', 'Perempuan') NULL AFTER nama_guru;

ALTER TABLE siswa
  ADD COLUMN jenis_kelamin ENUM('Laki-laki', 'Perempuan') NULL AFTER nama_siswa;
