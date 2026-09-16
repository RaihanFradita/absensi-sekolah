import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { APP_SHORT_NAME } from '../../utils/constants';
import schoolLogo from '../../assets/logo-sekolah.png';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('schoolattend_theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Topbar() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('schoolattend_theme', theme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <img src={schoolLogo} alt="" className="h-7 w-7 object-contain" aria-hidden="true" />
        <span className="truncate text-sm font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
          {APP_SHORT_NAME}
        </span>
      </div>

      <div className="hidden lg:block" />

      <button
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
