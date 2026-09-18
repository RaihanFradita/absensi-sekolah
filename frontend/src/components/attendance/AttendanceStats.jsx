import {
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  FileCheck2,
  HeartPulse,
  Circle,
} from "lucide-react";
import Card from "../ui/Card";

const ICONS = {
  present: CheckCircle2,
  late: Clock,
  absent: XCircle,
  excused: FileCheck2,
  sick: HeartPulse,
  not_yet: Circle,
  total: Users,
};
const TONE_CLASS = {
  present:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  late: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  absent: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  excused: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
  sick: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  not_yet: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  total: "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400",
};

export default function AttendanceStats({ items, onItemClick, activeKey }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const Icon = ICONS[item.key] || Users;
        const clickable = Boolean(onItemClick);
        return (
          <Card
            key={item.key}
            padding="p-4"
            as={clickable ? "button" : "div"}
            type={clickable ? "button" : undefined}
            onClick={clickable ? () => onItemClick(item.key) : undefined}
            className={`${clickable ? "text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md" : ""} ${activeKey === item.key ? "ring-2 ring-brand-500" : ""}`}
          >
            <div
              className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${TONE_CLASS[item.key] || TONE_CLASS.total}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {item.value}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
