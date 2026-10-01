import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  RefreshCw,
  Radio,
  School,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import AttendanceStatus from '../../components/attendance/AttendanceStatus';
import useAttendance from '../../hooks/useAttendance';
import useAuth from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';
import { formatTimeShort } from '../../utils/formatTime';
import { PROFILE_PHOTO_KEY_PREFIX } from '../../utils/constants';

export default function StudentDashboard() {
  const { user } = useAuth();

  const fetchDashboard = useCallback(
    () => attendanceService.getStudentDashboard(),
    []
  );

  const { data, isLoading, error, refetch } =
    useAttendance(fetchDashboard);

  const [profilePhoto, setProfilePhoto] = useState(null);

  const photoKey = `${PROFILE_PHOTO_KEY_PREFIX}${user?.id || 'guest'}`;

  useEffect(() => {
    const savedPhoto = localStorage.getItem(photoKey);
    setProfilePhoto(savedPhoto);
  }, [photoKey]);

  const todayStatus = data?.today?.status;

  const todayTime =
    data?.today?.waktu_absen ||
    data?.today?.scannedAt ||
    null;

  const studentName =
    data?.student?.name ||
    user?.name ||
    'Siswa';

  const className =
    data?.student?.className ||
    '-';

  return (
    <PageContainer
      title={`Halo, ${studentName}`}
      description="Pantau kehadiran sekolahmu hari ini"
    >
      {isLoading && <Loading label="Memuat dashboard..." />}

      {!isLoading && error && (
        <EmptyState
          title="Gagal memuat dashboard"
          description={error}
          action={
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={refetch}
            >
              Coba Lagi
            </Button>
          }
        />
      )}

      {!isLoading && !error && data && (
        <div className="space-y-6">

          {/* HERO / PROFILE */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="bg-gradient-to-br from-brand-50 via-white to-emerald-50 px-5 py-5 dark:from-brand-950 dark:via-slate-900 dark:to-emerald-950 sm:px-7 sm:py-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-100 text-xl font-bold text-brand-700 ring-4 ring-white dark:bg-brand-900 dark:text-brand-300 dark:ring-slate-800">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Foto profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      studentName[0]?.toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
                      Profil Siswa
                    </p>

                    <h2 className="mt-1 truncate text-xl font-bold text-slate-900 dark:text-slate-100">
                      {studentName}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <School className="h-4 w-4 shrink-0" />
                      <span>Kelas {className}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    as={Link}
                    to="/student/scan"
                    icon={QrCode}
                    className="justify-center"
                  >
                    Scan Kehadiran
                  </Button>

                  <Button
                    as={Link}
                    to="/student/profile"
                    variant="secondary"
                    className="justify-center"
                  >
                    Lihat Profil
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ACTIVE QR SESSION */}
          {data.activeSession ? (
            <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Radio className="h-6 w-6 animate-pulse" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      Absensi sedang dibuka
                    </p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      AKTIF
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    Segera scan QR untuk mencatat kehadiran hari ini.
                    QR aktif sampai {formatTimeShort(data.activeSession.endsAt)}.
                  </p>
                </div>

                <Button
                  as={Link}
                  to="/student/scan"
                  icon={QrCode}
                  className="shrink-0 justify-center"
                >
                  Scan Sekarang
                </Button>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Belum ada sesi absensi aktif
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Tunggu sampai Guru Kelas membuka QR kehadiran.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* STATUS TODAY */}
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Kehadiran Hari Ini
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Status absensi kamu hari ini
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

              <Card className="relative overflow-hidden border-slate-200 dark:border-slate-800">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-50 blur-2xl dark:bg-brand-950" />

                <div className="relative flex min-h-[150px] items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      todayStatus === 'hadir'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : todayStatus === 'terlambat'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                          : todayStatus === 'tidak_hadir'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {todayStatus === 'hadir' ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : todayStatus === 'terlambat' ? (
                      <Clock3 className="h-7 w-7" />
                    ) : todayStatus === 'tidak_hadir' ? (
                      <XCircle className="h-7 w-7" />
                    ) : (
                      <Clock3 className="h-7 w-7" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Status Absensi
                    </p>

                    {todayStatus ? (
                      <div className="mt-1">
                        <AttendanceStatus status={todayStatus} />
                      </div>
                    ) : (
                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                        Belum Absen
                      </p>
                    )}

                    {todayTime && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Dicatat pukul {formatTimeShort(todayTime)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <AttendanceSummaryCard
                icon={CheckCircle2}
                value={data.summary?.present ?? 0}
                label="Hadir"
                type="success"
              />

              <AttendanceSummaryCard
                icon={Clock3}
                value={data.summary?.late ?? 0}
                label="Terlambat"
                type="warning"
              />

              <AttendanceSummaryCard
                icon={XCircle}
                value={data.summary?.absent ?? 0}
                label="Tidak Hadir"
                type="danger"
              />
            </div>
          </section>

          {/* RECENT HISTORY */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Riwayat Kehadiran"
              action={
                <Link
                  to="/student/history"
                  className="group flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Lihat semua
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />

            {data.recentHistory?.length > 0 ? (
              <AttendanceTable rows={data.recentHistory} />
            ) : (
              <EmptyState
                title="Belum ada riwayat"
                description="Riwayat kehadiran harianmu akan muncul di sini."
              />
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

function AttendanceSummaryCard({
  icon: Icon,
  value,
  label,
  type,
}) {
  const styles = {
    success: {
      wrapper:
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    warning: {
      wrapper:
        'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    danger: {
      wrapper:
        'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    },
  };

  return (
    <Card className="min-h-[150px] border-slate-200 dark:border-slate-800">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[type].wrapper}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </Card>
  );
}
