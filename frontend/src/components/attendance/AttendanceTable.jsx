import { Calendar, BookOpen } from 'lucide-react';
import AttendanceStatus from './AttendanceStatus';
import { formatDateShort } from '../../utils/formatDate';

/**
 * rows: [{ id, date, subject, time, status }]
 */
export default function AttendanceTable({ rows }) {
  return (
    <>
      {/* Desktop: tabel biasa */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 sm:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Mata Pelajaran</th>
              <th className="px-4 py-3">Waktu Scan</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.id} className="bg-white dark:bg-slate-900">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatDateShort(row.date)}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.subject}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.time}</td>
                <td className="px-4 py-3">
                  <AttendanceStatus status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list, menghindari horizontal scroll */}
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <BookOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {row.subject}
              </div>
              <AttendanceStatus status={row.status} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDateShort(row.date)} &middot; {row.time}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
