import { useCallback, useEffect, useState } from 'react';

/**
 * Hook generik untuk memanggil fungsi service (attendanceService, dsb) dan
 * mengelola state loading/error/data secara konsisten di seluruh halaman.
 *
 * `fetcher` harus berupa async function yang sudah di-memoize oleh caller
 * (lewat useCallback) dengan dependency yang sesuai, misalnya:
 *
 *   const fetcher = useCallback(
 *     () => attendanceService.getAttendanceHistory({ page, status }),
 *     [page, status]
 *   );
 *   const { data, isLoading, error, refetch } = useAttendance(fetcher);
 */
export default function useAttendance(fetcher, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err?.message || 'Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fetcher]);

  useEffect(() => {
    // `load` sudah memvalidasi `enabled` dan menyimpan hasil lewat setState
    // di dalam try/catch/finally-nya sendiri (async, bukan sinkron di body
    // effect ini) — pola fetch-on-mount/deps-change standar untuk hook data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load, setData };
}
