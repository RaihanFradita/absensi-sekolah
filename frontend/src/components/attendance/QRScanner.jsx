import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const SCANNER_ELEMENT_ID = 'schoolattend-qr-scanner';

/**
 * Scanner QR berbasis kamera. Hanya bertugas membaca teks dari QR (session token)
 * dan meneruskannya lewat onScan — TIDAK menentukan valid/tidaknya absensi.
 * Keputusan absensi (hadir/terlambat/ditolak) selalu berasal dari backend.
 */
export default function QRScanner({ onScan, isProcessing = false }) {
  const scannerRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | starting | running | denied | unsupported | error

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    if (isProcessing) return;
    setStatus('starting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }

    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // Callback ini dipanggil terus-menerus saat frame tidak mengandung QR valid,
          // sengaja diabaikan supaya tidak membanjiri UI dengan "error" palsu.
        }
      );

      setStatus('running');
    } catch {
      setStatus('denied');
    }
  }

  async function stopCamera() {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // Kamera mungkin sudah berhenti, aman untuk diabaikan.
      }
      scannerRef.current = null;
    }
    setStatus('idle');
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 dark:border-slate-800">
        <div id={SCANNER_ELEMENT_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

        {status !== 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/95 px-6 text-center text-white">
            {status === 'starting' && (
              <>
                <Spinner size={28} className="text-white" />
                <p className="text-sm text-slate-300">Membuka kamera...</p>
              </>
            )}

            {status === 'denied' && (
              <>
                <ShieldAlert className="h-8 w-8 text-amber-400" aria-hidden="true" />
                <p className="text-sm font-medium">Izin kamera ditolak</p>
                <p className="text-xs text-slate-400">
                  Aktifkan izin kamera untuk browser ini di pengaturan perangkat Anda, lalu coba lagi.
                </p>
              </>
            )}

            {status === 'unsupported' && (
              <>
                <ShieldAlert className="h-8 w-8 text-amber-400" aria-hidden="true" />
                <p className="text-sm font-medium">Kamera tidak didukung</p>
                <p className="text-xs text-slate-400">Perangkat atau browser ini tidak mendukung akses kamera.</p>
              </>
            )}

            {status === 'idle' && (
              <>
                <Camera className="h-8 w-8 text-slate-400" aria-hidden="true" />
                <p className="text-sm text-slate-300">Tekan &quot;Mulai Scan&quot; untuk membuka kamera</p>
              </>
            )}
          </div>
        )}

        {isProcessing && status === 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80 text-white">
            <Spinner size={28} className="text-white" />
            <p className="text-sm">Memproses QR Code...</p>
          </div>
        )}

        {status === 'running' && !isProcessing && (
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/70" />
        )}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        {status === 'running' ? (
          <Button variant="secondary" icon={CameraOff} onClick={stopCamera} disabled={isProcessing}>
            Hentikan Kamera
          </Button>
        ) : (
          <Button
            icon={Camera}
            onClick={startCamera}
            isLoading={status === 'starting'}
            disabled={status === 'unsupported'}
          >
            Mulai Scan
          </Button>
        )}
      </div>
    </div>
  );
}
