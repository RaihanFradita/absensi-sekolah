import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, AlertCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import attendanceService from '../../services/attendanceService';

const selectClass =
  'h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 transition-colors focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

// DATA SEMENTARA untuk preview UI — pada implementasi nyata, daftar kelas,
// mata pelajaran, dan jadwal ini diambil dari endpoint milik guru
// (mis. GET /teacher/classes, /teacher/subjects, /teacher/schedules).
const MOCK_CLASSES = ['VII-A', 'VII-B', 'VIII-A', 'VIII-B', 'IX-A', 'IX-B'];
const MOCK_SUBJECTS = ['Matematika', 'Bahasa Indonesia', 'IPA', 'IPS', 'Bahasa Inggris'];
const MOCK_SCHEDULES = [
  { id: '', label: 'Tidak menggunakan jadwal tetap' },
  { id: 'sch-1', label: 'Senin, 07:00 - 08:30' },
  { id: 'sch-2', label: 'Senin, 08:30 - 10:00' },
];

const initialForm = {
  classId: '',
  subjectId: '',
  scheduleId: '',
  durationMinutes: 15,
  lateThresholdMinutes: 5,
};

export default function CreateAttendanceSession() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.classId) nextErrors.classId = 'Pilih kelas terlebih dahulu.';
    if (!form.subjectId) nextErrors.subjectId = 'Pilih mata pelajaran terlebih dahulu.';
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) {
      nextErrors.durationMinutes = 'Durasi sesi harus lebih dari 0 menit.';
    }
    if (form.lateThresholdMinutes === '' || Number(form.lateThresholdMinutes) < 0) {
      nextErrors.lateThresholdMinutes = 'Batas keterlambatan tidak boleh negatif.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const session = await attendanceService.createAttendanceSession({
        classId: form.classId,
        subjectId: form.subjectId,
        scheduleId: form.scheduleId || undefined,
        durationMinutes: Number(form.durationMinutes),
        lateThresholdMinutes: Number(form.lateThresholdMinutes),
      });
      navigate(`/teacher/sessions/${session.id}`);
    } catch (error) {
      setSubmitError(error?.message || 'Gagal membuat sesi absensi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer title="Buat Sesi Absensi" description="Mulai sesi absensi baru untuk kelas yang kamu ajar">
      <Card className="mx-auto max-w-lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Kelas</label>
            <select
              className={selectClass}
              value={form.classId}
              onChange={(e) => updateField('classId', e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Pilih kelas</option>
              {MOCK_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.classId && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.classId}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Mata Pelajaran
            </label>
            <select
              className={selectClass}
              value={form.subjectId}
              onChange={(e) => updateField('subjectId', e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Pilih mata pelajaran</option>
              {MOCK_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.subjectId}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Jadwal (opsional)
            </label>
            <select
              className={selectClass}
              value={form.scheduleId}
              onChange={(e) => updateField('scheduleId', e.target.value)}
              disabled={isSubmitting}
            >
              {MOCK_SCHEDULES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Durasi Sesi (menit)"
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => updateField('durationMinutes', e.target.value)}
              error={errors.durationMinutes}
              disabled={isSubmitting}
            />
            <Input
              label="Batas Terlambat (menit)"
              type="number"
              min={0}
              value={form.lateThresholdMinutes}
              onChange={(e) => updateField('lateThresholdMinutes', e.target.value)}
              error={errors.lateThresholdMinutes}
              disabled={isSubmitting}
              hint="Scan setelah batas ini dianggap terlambat"
            />
          </div>

          <Button type="submit" fullWidth icon={CalendarPlus} isLoading={isSubmitting}>
            {isSubmitting ? 'Membuat sesi...' : 'Mulai Sesi Absensi'}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
