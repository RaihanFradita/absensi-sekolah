import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../utils/navConfig';
import { APP_SHORT_NAME } from '../../utils/constants';
import schoolLogo from '../../assets/logo-sekolah.png';

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const items = NAV_ITEMS[role] || [];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-800">
        <img src={schoolLogo} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
        <span className="truncate text-sm font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
          {APP_SHORT_NAME}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {user?.name || 'Pengguna'}
            </p>
            <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">{role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
