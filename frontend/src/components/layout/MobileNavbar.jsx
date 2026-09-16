import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { NAV_ITEMS, MOBILE_NAV_LIMIT } from '../../utils/navConfig';

export default function MobileNavbar() {
  const { role } = useAuth();
  const items = (NAV_ITEMS[role] || []).slice(0, MOBILE_NAV_LIMIT);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
