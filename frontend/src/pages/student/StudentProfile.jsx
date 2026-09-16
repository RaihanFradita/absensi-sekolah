import { useCallback, useMemo, useRef, useState } from 'react';
import { Camera, IdCard, School, RefreshCw, CheckCircle2, Clock, XCircle, BookOpen } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import useAttendance from '../../hooks/useAttendance';
import useAuth from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';
import { PROFILE_PHOTO_KEY_PREFIX } from '../../utils/constants';

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// Bentuk data yang diharapkan dari GET /student/profile, lihat attendanceService.js:
// { student: { name, nisn, className }, subjectRecap: [{ id, subject, present, late, absent, total }] }
export default function StudentProfile() {
  const { user } = useAuth();
  const fetchProfile = useCallback(() => attendanceService.getStudentProfile(), []);
  const { data, isLoading, error, refetch } = useAttendance(fetchProfile);

  // Foto profil disimpan lokal (localStorage) per akun, lihat catatan di
  // utils/constants.js — nanti diganti pemanggilan API upload sungguhan.
  const photoKey = `${PROFILE_PHOTO_KEY_PREFIX}${user?.id || 'guest'}`;
  const [photo, setPhoto] = useState(() => localStorage.getItem(photoKey));
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  function handlePickPhoto() {
    setPhotoError('');
    fileInputRef.current?.click();
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // supaya bisa pilih file yang sama lagi kalau perlu
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('File harus berupa gambar (JPG, PNG, dsb).');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError('Ukuran foto maksimal 2MB.');
      return;
    }

    setPhotoError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPhoto(dataUrl);
      try {
        localStorage.setItem(photoKey, dataUrl);
      } catch {
        setPhotoError('Gagal menyimpan foto di perangkat ini.');
      }
    };
    reader.onerror = () => setPhotoError('Gagal membaca file gambar.');
    reader.readAsDataURL(file);
  }

  const student = data?.student;
  const recap = useMemo(() => data?.subjectRecap || [], [data]);

  const totals = useMemo(
    () =>
      recap.reduce(
        (acc, row) => ({
          present: acc.present + row.present,
          late: acc.late + row.late,
          absent: acc.absent + row.absent,
          total: acc.total + row.total,
        }),
        { present: 0, late: 0, absent: 0, total: 0 }
      ),
    [recap]
  );
  const overallRate = totals.total > 0 ? Math.round((totals.present / totals.total) * 100) : 0;

  return (
    <PageContainer title="Profil Siswa" description="Informasi akun dan rekap kehadiranmu di setiap mata pelajaran">
      {isLoading && <Loading label="Memuat profil..." />}

      {!isLoading && error && (
        <EmptyState
          title="Gagal memuat profil"
          description={error}
          action={
            <Button variant="secondary" icon={RefreshCw} onClick={refetch}>
              Coba Lagi
            </Button>
          }
        />
      )}

      {!isLoading && !error && student && (
        <div className="space-y-6">
          {/* Kartu identitas: foto di samping nama, NISN, dan kelas */}
          <Card>
            <div className="flex flex-wrap items-center gap-5">
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-brand-100 text-3xl font-semibold text-brand-700 dark:border-slate-700 dark:bg-brand-900 dark:text-brand-300">
                  {photo ? (
                    <img src={photo} alt="Foto profil" className="h-full w-full object-cover" />
                  ) : (
                    (student.name || '?')[0]?.toUpperCase()
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePickPhoto}
                  aria-label="Ganti foto profil"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow ring-2 ring-white transition-colors hover:bg-brand-700 dark:ring-slate-900"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="min-w-0">
                <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {student.name}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <IdCard className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    NISN {student.nisn || '-'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <School className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    Kelas {student.className || '-'}
                  </span>
                </div>
                {photoError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{photoError}</p>}
              </div>
            </div>
          </Card>

          {/* Rekap kehadiran per mata pelajaran */}
          <Card>
            <CardHeader
              title="Rekap Kehadiran per Mata Pelajaran"
              subtitle={`Total keseluruhan: ${overallRate}% hadir dari ${totals.total} sesi`}
            />

            {recap.length === 0 ? (
              <EmptyState title="Belum ada data kehadiran" description="Rekap akan muncul setelah ada sesi absensi." />
            ) : (
              <>
                {/* Desktop: tabel */}
                <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 sm:block">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Mata Pelajaran</th>
                        <th className="px-4 py-3 text-center">Hadir</th>
                        <th className="px-4 py-3 text-center">Terlambat</th>
                        <th className="px-4 py-3 text-center">Tidak Hadir</th>
                        <th className="px-4 py-3">Persentase Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {recap.map((row) => (
                        <SubjectRecapRow key={row.id} row={row} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: card list */}
                <div className="space-y-3 sm:hidden">
                  {recap.map((row) => (
                    <SubjectRecapCard key={row.id} row={row} />
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

function subjectRate(row) {
  return row.total > 0 ? Math.round((row.present / row.total) * 100) : 0;
}

function SubjectRecapRow({ row }) {
  const rate = subjectRate(row);
  return (
    <tr className="bg-white dark:bg-slate-900">
      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.subject}</td>
      <td className="px-4 py-3 text-center text-emerald-700 dark:text-emerald-400">{row.present}</td>
      <td className="px-4 py-3 text-center text-amber-700 dark:text-amber-400">{row.late}</td>
      <td className="px-4 py-3 text-center text-red-700 dark:text-red-400">{row.absent}</td>
      <td className="px-4 py-3">
        <RecapBar row={row} rate={rate} />
      </td>
    </tr>
  );
}

function SubjectRecapCard({ row }) {
  const rate = subjectRate(row);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
        <BookOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />
        {row.subject}
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          {row.present} hadir
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
          {row.late} terlambat
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
          {row.absent} tidak hadir
        </span>
      </div>
      <RecapBar row={row} rate={rate} />
    </div>
  );
}

// Progress bar bertumpuk: hijau (hadir), kuning (terlambat), merah (tidak hadir).
function RecapBar({ row, rate }) {
  const presentPct = row.total > 0 ? (row.present / row.total) * 100 : 0;
  const latePct = row.total > 0 ? (row.late / row.total) * 100 : 0;
  const absentPct = row.total > 0 ? (row.absent / row.total) * 100 : 0;

  return (
    <div className="flex min-w-[9rem] items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="flex h-full w-full">
          <div className="h-full bg-emerald-500" style={{ width: `${presentPct}%` }} />
          <div className="h-full bg-amber-400" style={{ width: `${latePct}%` }} />
          <div className="h-full bg-red-400" style={{ width: `${absentPct}%` }} />
        </div>
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-600 dark:text-slate-400">
        {rate}%
      </span>
    </div>
  );
}
