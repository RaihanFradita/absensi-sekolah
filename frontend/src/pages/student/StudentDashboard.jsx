import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  RefreshCw,
  Radio,
  IdCard,
  School,
  CheckCircle2,
  Clock3,
  XCircle,
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

  return (
    <PageContainer
      title={`Halo, ${user?.name || 'Siswa'}`}
      description="Pantau kehadiran sekolahmu hari ini"
    >
      {isLoading && (
        <Loading label="Memuat dashboard..." />
      )}

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

          {/* =========================
              PROFILE CARD
          ========================= */}
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                {/* Profile Photo */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-xl font-semibold text-brand-700 ring-4 ring-brand-50 dark:bg-brand-900 dark:text-brand-300 dark:ring-brand-950">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Foto profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (
                      data.student?.name ||
                      user?.name ||
                      '?'
                    )[0]?.toUpperCase()
                  )}
                </div>

                {/* Student Information */}
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {data.student?.name || user?.name}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <IdCard className="h-4 w-4" />
                      NIS {data.student?.nis || '-'}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <School className="h-4 w-4" />
                      Kelas {data.student?.className || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scan Button */}
              <Button
                as={Link}
                to="/student/scan"
                icon={QrCode}
                className="shrink-0"
              >
                Scan Kehadiran
              </Button>
            </div>
          </Card>

          {/* =========================
              ACTIVE SESSION
          ========================= */}
          {data.activeSession && (
            <Card className="border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Radio className="h-4 w-4 animate-pulse" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                    Absensi masuk sekolah sedang dibuka
                  </p>

                  <p className="mt-0.5 text-xs text-brand-700 dark:text-brand-400">
                    Scan QR sekali saja hari ini. QR aktif sampai{' '}
                    {formatTimeShort(data.activeSession.endsAt)}.
                  </p>
                </div>

                <Button
                  as={Link}
                  to="/student/scan"
                  size="sm"
                  icon={QrCode}
                >
                  Scan
                </Button>
              </div>
            </Card>
          )}

          {/* =========================
              STATUS HARI INI
          ========================= */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Status Hari Ini
            </h2>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(130px,160px))]">

              {/* Current Status */}
              <Card className="flex min-h-[140px] items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
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
                    <CheckCircle2 className="h-6 w-6" />
                  ) : todayStatus === 'terlambat' ? (
                    <Clock3 className="h-6 w-6" />
                  ) : todayStatus === 'tidak_hadir' ? (
                    <XCircle className="h-6 w-6" />
                  ) : (
                    <Clock3 className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Kehadiran
                  </p>

                  {todayStatus ? (
                    <div className="mt-1">
                      <AttendanceStatus status={todayStatus} />
                    </div>
                  ) : (
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                      Belum Absen
                    </p>
                  )}

                  {todayTime && (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Absen pukul {formatTimeShort(todayTime)}
                    </p>
                  )}
                </div>
              </Card>

              {/* Hadir */}
              <AttendanceSummaryCard
                icon={CheckCircle2}
                value={data.summary?.present ?? 0}
                label="Hadir"
                type="success"
              />

              {/* Terlambat */}
              <AttendanceSummaryCard
                icon={Clock3}
                value={data.summary?.late ?? 0}
                label="Terlambat"
                type="warning"
              />

              {/* Tidak Hadir */}
              <AttendanceSummaryCard
                icon={XCircle}
                value={data.summary?.absent ?? 0}
                label="Tidak Hadir"
                type="danger"
              />
            </div>
          </div>

          {/* =========================
              RIWAYAT TERBARU
          ========================= */}
          <Card>
            <CardHeader
              title="Riwayat Terbaru"
              action={
                <Link
                  to="/student/history"
                  className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Lihat semua
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


/* =====================================
   ATTENDANCE SUMMARY CARD
===================================== */

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
    <Card className="min-h-[140px]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[type].wrapper}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>

      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </Card>
  );
}