-- Ensure the standard class groups are active for grades 7, 8, and 9.
-- Existing class IDs and student assignments are preserved.
INSERT INTO kelas (nama_kelas, tingkat, status_aktif) VALUES
  ('MM1', 7, 1), ('MM2', 7, 1),
  ('A', 7, 1), ('B', 7, 1), ('C', 7, 1), ('D', 7, 1), ('E', 7, 1), ('F', 7, 1),
  ('MM1', 8, 1), ('MM2', 8, 1),
  ('A', 8, 1), ('B', 8, 1), ('C', 8, 1), ('D', 8, 1), ('E', 8, 1), ('F', 8, 1),
  ('MM1', 9, 1), ('MM2', 9, 1),
  ('A', 9, 1), ('B', 9, 1), ('C', 9, 1), ('D', 9, 1), ('E', 9, 1), ('F', 9, 1)
ON DUPLICATE KEY UPDATE status_aktif = 1;
