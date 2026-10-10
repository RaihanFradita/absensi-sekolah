import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { APP_SHORT_NAME, ROLES } from '../../utils/constants';
import ConfirmDialog from '../ui/ConfirmDialog';
import schoolLogo from '../../assets/logo-sekolah.png';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('schoolattend_theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Topbar() {
  const { role, logout } = useAuth();
  const [theme, setTheme] = useState(getInitialTheme);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const showLogout = role === ROLES.ADMIN || role === ROLES.DUTY_TEACHER;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('schoolattend_theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowConfirmLogout(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <img src={schoolLogo} alt="" className="h-7 w-7 object-contain" aria-hidden="true" />
        <span className="truncate text-sm font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
          {APP_SHORT_NAME}
        </span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {showLogout && (
          <button
            onClick={() => setShowConfirmLogout(true)}
            aria-label="Keluar dari akun"
            title="Keluar"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 lg:hidden"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {showLogout && (
        <ConfirmDialog
          open={showConfirmLogout}
          title="Konfirmasi Keluar"
          description="Apakah Anda yakin ingin keluar dari sistem absensi?"
          confirmLabel="Keluar"
          cancelLabel="Batal"
          tone="danger"
          isLoading={isLoggingOut}
          onConfirm={handleLogout}
          onCancel={() => setShowConfirmLogout(false)}
        />
      )}
    </header>
  );
}
