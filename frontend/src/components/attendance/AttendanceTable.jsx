import { Calendar, Clock, FileText } from 'lucide-react';
import AttendanceStatus from './AttendanceStatus';
import { formatDateShort } from '../../utils/formatDate';

function formatDisplayTime(timeValue) {
  if (!timeValue) return '-';
  if (typeof timeValue === 'string') {
    const trimmed = timeValue.trim();
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed.slice(0, 5).replace(':', '.');
    }
  }
  const date = new Date(timeValue);
  if (Number.isNaN(date.getTime())) {
    return String(timeValue);
  }
  return date
    .toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(':', '.');
}

/**
 * rows: [{ id, date, time, status, keterangan, ... }]
 * Satu baris mewakili satu kehadiran harian.
 */
export default function AttendanceTable({ rows = [] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 sm:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Waktu Masuk</th>
              <th className="px-4 py-3">Status Kehadiran</th>
              <th className="px-4 py-3">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row, idx) => {
              const id = row.id_absensi || row.id || idx;
              const date = row.tanggal || row.date;
              const time = row.waktu_scan || row.waktu_catat || row.time;
              const status = row.status || row.status_kehadiran;
              const note = row.keterangan || row.note || '-';

              return (
                <tr
                  key={id}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {formatDateShort(date)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {time ? formatDisplayTime(time) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <AttendanceStatus status={status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                    {note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {rows.map((row, idx) => {
          const id = row.id_absensi || row.id || idx;
          const date = row.tanggal || row.date;
          const time = row.waktu_scan || row.waktu_catat || row.time;
          const status = row.status || row.status_kehadiran;
          const note = row.keterangan || row.note;

          return (
            <div
              key={id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  {formatDateShort(date)}
                </div>
                <AttendanceStatus status={status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Masuk: {time ? formatDisplayTime(time) : '-'}
                </div>
                {note && (
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 italic">
                    <FileText className="h-3 w-3" />
                    {note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
