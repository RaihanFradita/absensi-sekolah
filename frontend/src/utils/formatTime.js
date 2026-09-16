// Helper format waktu (jam:menit:detik) dan countdown.

export function formatTime(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatTimeShort(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Mengubah sisa detik menjadi format mm:ss untuk countdown QR/sesi.
export function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Menghitung sisa detik antara sekarang dan waktu berakhir (ISO string / Date).
export function getSecondsUntil(endTime) {
  if (!endTime) return 0;
  const end = endTime instanceof Date ? endTime : new Date(endTime);
  if (Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
}
