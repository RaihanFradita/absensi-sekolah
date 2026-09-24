import { QRCodeSVG } from "qrcode.react";

/**
 * Menampilkan QR Code besar dari token QR kehadiran harian yang dibuat backend.
 * Frontend TIDAK membuat/mengubah token — hanya merender apa yang diterima.
 */

export default function QRDisplay({ value, size = 280, className = "" }) {
  if (!value) return null;
  const baseUrl = window.location.origin;
  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-white p-6 shadow-card ${className}`}
    >
      <QRCodeSVG
        value={`${baseUrl}/attendance/scan?token=${value}`}
        size={size}
        level="M"
        marginSize={0}
      />
    </div>
  );
}
