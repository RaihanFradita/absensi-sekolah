import { CheckCircle2, Clock, XCircle, Users } from 'lucide-react';
import Card from '../ui/Card';

const ICONS = {
  present: CheckCircle2,
  late: Clock,
  absent: XCircle,
  total: Users,
};

const TONE_CLASS = {
  present: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  late: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  absent: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  total: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
};

/**
 * items: [{ key: 'present' | 'late' | 'absent' | 'total', label, value }]
 */
export default function AttendanceStats({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => {
        const Icon = ICONS[item.key] || Users;
        return (
          <Card key={item.key} padding="p-4">
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${TONE_CLASS[item.key] || TONE_CLASS.total}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {item.value}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          </Card>
        );
      })}
    </div>
  );
}
