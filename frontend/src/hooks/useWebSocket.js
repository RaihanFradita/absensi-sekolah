import { useCallback, useEffect, useRef, useState } from 'react';
import createWebSocketService from '../services/websocketService';
import { isMockMode, generateMockAttendanceEvent } from '../services/mockData';

const MOCK_EVENT_INTERVAL_MS = 4000;

/**
 * Menghubungkan komponen ke WebSocket backend untuk update real-time
 * (mis. absensi baru masuk). `onMessage` boleh berubah identitas setiap
 * render tanpa memicu reconnect — disimpan lewat ref yang di-update di
 * dalam effect (bukan saat render) supaya tidak melanggar aturan hooks.
 *
 * Saat mode pratinjau (mock login) aktif, hook ini TIDAK membuka koneksi
 * WebSocket sungguhan — melainkan mensimulasikan event "siswa scan QR"
 * secara berkala lewat setInterval, supaya AttendanceMonitor & QR Display
 * tetap terasa live tanpa backend.
 *
 * @param {string|null} path - path WebSocket, mis. `/sessions/123/monitor`
 * @param {{ enabled?: boolean, onMessage?: (payload: any) => void }} options
 */
export default function useWebSocket(path, { enabled = true, onMessage } = {}) {
  const [status, setStatus] = useState('idle');
  const serviceRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!enabled || !path) {
      // Mereset indikator status saat koneksi memang tidak diminta (mis. sesi
      // belum ada id-nya) — bukan efek samping dari fetching data.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle');
      return undefined;
    }

    // ---- Mode pratinjau: simulasikan koneksi + event, tanpa WebSocket asli ----
    if (isMockMode()) {
      setStatus('connecting');
      let counter = 0;
      const connectTimeout = setTimeout(() => setStatus('connected'), 600);
      const interval = setInterval(() => {
        counter += 1;
        onMessageRef.current?.(generateMockAttendanceEvent(counter));
      }, MOCK_EVENT_INTERVAL_MS);

      return () => {
        clearTimeout(connectTimeout);
        clearInterval(interval);
      };
    }

    // ---- Mode sungguhan: sambungkan ke backend lewat websocketService ----
    const service = createWebSocketService();
    serviceRef.current = service;

    const unsubscribeStatus = service.onStatusChange(setStatus);
    const unsubscribeMessage = service.onMessage((payload) => {
      onMessageRef.current?.(payload);
    });

    service.connect(path);

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
      service.disconnect();
      serviceRef.current = null;
    };
  }, [path, enabled]);

  const reconnect = useCallback(() => {
    if (isMockMode()) {
      setStatus('connected');
      return;
    }
    serviceRef.current?.reconnect();
  }, []);

  return { status, reconnect };
}
