import { CheckCircle2, Clock, XCircle, Circle, FileCheck2, HeartPulse } from 'lucide-react';
import Badge from '../ui/Badge';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABEL } from '../../utils/constants';

const STATUS_MAP = {
  hadir: ATTENDANCE_STATUS.PRESENT,
  present: ATTENDANCE_STATUS.PRESENT,
  terlambat: ATTENDANCE_STATUS.LATE,
  late: ATTENDANCE_STATUS.LATE,
  izin: ATTENDANCE_STATUS.EXCUSED,
  excused: ATTENDANCE_STATUS.EXCUSED,
  sakit: ATTENDANCE_STATUS.SICK,
  sick: ATTENDANCE_STATUS.SICK,
  tidak_hadir: ATTENDANCE_STATUS.ABSENT,
  "tidak hadir": ATTENDANCE_STATUS.ABSENT,
  "tanpa keterangan": ATTENDANCE_STATUS.ABSENT,
  absent: ATTENDANCE_STATUS.ABSENT,
  alpa: ATTENDANCE_STATUS.ABSENT,
  alpha: ATTENDANCE_STATUS.ABSENT,
  not_yet: ATTENDANCE_STATUS.NOT_YET,
  "belum absen": ATTENDANCE_STATUS.NOT_YET,
  "belum_absen": ATTENDANCE_STATUS.NOT_YET,
};

const CONFIG = {
  [ATTENDANCE_STATUS.PRESENT]: { tone: 'success', icon: CheckCircle2 },
  [ATTENDANCE_STATUS.LATE]: { tone: 'warning', icon: Clock },
  [ATTENDANCE_STATUS.ABSENT]: { tone: 'danger', icon: XCircle },
  [ATTENDANCE_STATUS.EXCUSED]: { tone: 'info', icon: FileCheck2 },
  [ATTENDANCE_STATUS.SICK]: { tone: 'neutral', icon: HeartPulse },
  [ATTENDANCE_STATUS.NOT_YET]: { tone: 'neutral', icon: Circle },
};

export default function AttendanceStatus({ status, className = '' }) {
  const normalizedKey = String(status || '').toLowerCase().trim();
  const canonicalStatus = STATUS_MAP[normalizedKey] || ATTENDANCE_STATUS.NOT_YET;
  const config = CONFIG[canonicalStatus] || CONFIG[ATTENDANCE_STATUS.NOT_YET];
  const Icon = config.icon;
  const label = ATTENDANCE_STATUS_LABEL[canonicalStatus] || status || 'Tidak diketahui';

  return (
    <Badge tone={config.tone} className={`gap-1 ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}
