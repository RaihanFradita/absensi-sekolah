import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, AlertCircle, QrCode, Info } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import attendanceService from '../../services/attendanceService';

export default function CreateAttendanceSession() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ durationMinutes: 120, lateThresholdMinutes: 15 });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) next.durationMinutes = 'Durasi harus lebih dari 0 menit.';
    if (form.lateThresholdMinutes === '' || Number(form.lateThresholdMinutes) < 0) next.lateThresholdMinutes = 'Batas terlambat tidak boleh negatif.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault(); setSubmitError(''); if (!validate()) return;
    setIsSubmitting(true);
    try {
      const session = await attendanceService.createAttendanceSession({
        durationMinutes: Number(form.durationMinutes),
        lateThresholdMinutes: Number(form.lateThresholdMinutes),
      });
      navigate(`/teacher/sessions/${session.id}`);
    } catch (error) {
      setSubmitError(error?.message || 'Gagal membuat QR kehadiran. Silakan coba lagi.');
    } finally { setIsSubmitting(false); }
  }

  return (
    <PageContainer title="Buat QR Kehadiran Harian" description="Buat satu QR Code untuk absensi siswa saat masuk sekolah">
      <Card className="mx-auto max-w-lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {submitError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"><AlertCircle className="mt-0.5 h-4 w-4" /><span>{submitError}</span></div>}

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950">
            <div className="flex gap-3"><QrCode className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><div><p className="text-sm font-semibold text-brand-900 dark:text-brand-200">Satu QR untuk satu hari</p><p className="mt-1 text-xs leading-5 text-brand-700 dark:text-brand-300">Semua siswa yang masuk sekolah menggunakan QR yang sama. Sistem akan menolak scan kedua dari siswa yang sama pada tanggal yang sama.</p></div></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Durasi QR (menit)" type="number" min={1} value={form.durationMinutes} onChange={(e) => updateField('durationMinutes', e.target.value)} error={errors.durationMinutes} disabled={isSubmitting} hint="Masa aktif QR hari ini" />
            <Input label="Batas Terlambat (menit)" type="number" min={0} value={form.lateThresholdMinutes} onChange={(e) => updateField('lateThresholdMinutes', e.target.value)} error={errors.lateThresholdMinutes} disabled={isSubmitting} hint="Setelah batas ini: terlambat" />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400"><Info className="mt-0.5 h-4 w-4 shrink-0" />Status kehadiran dicatat berdasarkan waktu scan dan hanya boleh dibuat satu kali per siswa setiap hari.</div>
          <Button type="submit" fullWidth icon={CalendarPlus} isLoading={isSubmitting}>{isSubmitting ? 'Membuat QR...' : 'Buat QR Kehadiran'}</Button>
        </form>
      </Card>
    </PageContainer>
  );
}
