-- Add columns only when missing, so this migration can be rerun safely.
SET @add_guru_gender = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE guru ADD COLUMN jenis_kelamin ENUM(''Laki-laki'', ''Perempuan'') NULL AFTER nama_guru',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'guru'
    AND COLUMN_NAME = 'jenis_kelamin'
);
PREPARE add_guru_gender_stmt FROM @add_guru_gender;
EXECUTE add_guru_gender_stmt;
DEALLOCATE PREPARE add_guru_gender_stmt;

SET @add_student_gender = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE siswa ADD COLUMN jenis_kelamin ENUM(''Laki-laki'', ''Perempuan'') NULL AFTER nama_siswa',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'siswa'
    AND COLUMN_NAME = 'jenis_kelamin'
);
PREPARE add_student_gender_stmt FROM @add_student_gender;
EXECUTE add_student_gender_stmt;
DEALLOCATE PREPARE add_student_gender_stmt;
