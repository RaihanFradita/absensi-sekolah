import { useState, useEffect } from "react";

/**
 * Hook useDebounce – menunda pembaruan nilai hingga setelah
 * `delay` ms tidak ada perubahan. Berguna untuk mencegah
 * terlalu banyak request ke server saat user mengetik.
 *
 * @param {*}      value - Nilai yang ingin di-debounce
 * @param {number} delay - Waktu tunda dalam milidetik (default 400ms)
 * @returns nilai yang sudah di-debounce
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Batalkan timer sebelumnya setiap kali value berubah
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
