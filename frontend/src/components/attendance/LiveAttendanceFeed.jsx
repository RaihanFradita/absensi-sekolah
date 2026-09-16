import { IdCard, School } from 'lucide-react';
import AttendanceStatus from './AttendanceStatus';
import { formatTimeShort } from '../../utils/formatTime';
import EmptyState from '../ui/EmptyState';

/**
 * events: [{ id, student: { name, nis, className }, time, status }]
 * Urutan terbaru berada paling atas — pemanggil (halaman) yang bertanggung
 * jawab menaruh event baru di indeks 0.
 */
export default function LiveAttendanceFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <EmptyState
        title="Menunggu siswa scan..."
        description="Daftar siswa yang baru saja absen akan muncul di sini secara real-time."
      />
    );
  }

  return (
    <ul className="max-h-[28rem] space-y-2 overflow-y-auto scrollbar-thin">
      {events.map((event, index) => (
        <li
          key={event.id}
          className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 ${
            index === 0 ? 'animate-slide-up' : ''
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            {event.student?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {event.student?.name}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <IdCard className="h-3 w-3" aria-hidden="true" />
                {event.student?.nis}
              </span>
              <span className="flex items-center gap-1">
                <School className="h-3 w-3" aria-hidden="true" />
                {event.student?.className}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <AttendanceStatus status={event.status} />
            <span className="text-xs text-slate-400">{formatTimeShort(event.time)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
