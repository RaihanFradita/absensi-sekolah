// Helper format tanggal menggunakan locale Indonesia (id-ID).
// Menerima Date object atau string ISO dari backend.

export function formatDate(value, options) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function formatDateShort(value) {
  return formatDate(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateInputValue(value) {
  // Format YYYY-MM-DD untuk value input[type=date]
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function isToday(value) {
  if (!value) return false;
  const date = value instanceof Date ? value : new Date(value);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
