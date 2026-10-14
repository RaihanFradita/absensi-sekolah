import { useEffect } from "react";

const SITE_NAME = "Absensi SMP Muhammadiyah 4";

/**
 * Mengatur document.title secara dinamis per halaman.
 * @param {string} pageTitle - Nama halaman (misal: "Dashboard Piket")
 * @param {string} [suffix]  - Override suffix, default pakai SITE_NAME
 */
export function usePageTitle(pageTitle, suffix = SITE_NAME) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = pageTitle ? `${pageTitle} | ${suffix}` : suffix;

    return () => {
      document.title = prevTitle;
    };
  }, [pageTitle, suffix]);
}
