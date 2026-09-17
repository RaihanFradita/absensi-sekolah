import { CheckCircle2, Clock, XCircle, Circle, FileCheck2, HeartPulse } from 'lucide-react';
import Badge from '../ui/Badge';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABEL } from '../../utils/constants';

const CONFIG = {
  [ATTENDANCE_STATUS.PRESENT]: { tone: 'success', icon: CheckCircle2 },
  [ATTENDANCE_STATUS.LATE]: { tone: 'warning', icon: Clock },
  [ATTENDANCE_STATUS.ABSENT]: { tone: 'danger', icon: XCircle },
  [ATTENDANCE_STATUS.EXCUSED]: { tone: 'info', icon: FileCheck2 },
  [ATTENDANCE_STATUS.SICK]: { tone: 'neutral', icon: HeartPulse },
  [ATTENDANCE_STATUS.NOT_YET]: { tone: 'neutral', icon: Circle },
};

export default function AttendanceStatus({ status, className = '' }) {
  const config = CONFIG[status] || CONFIG[ATTENDANCE_STATUS.NOT_YET];
  const Icon = config.icon;
  return (
    <Badge tone={config.tone} className={`gap-1 ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {ATTENDANCE_STATUS_LABEL[status] || 'Tidak diketahui'}
    </Badge>
  );
}
