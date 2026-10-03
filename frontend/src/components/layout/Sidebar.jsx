import { NavLink } from "react-router-dom";
import {
  LogOut,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import useAuth from "../../hooks/useAuth";
import { NAV_ITEMS } from "../../utils/navConfig";
import {
  APP_SHORT_NAME,
  PROFILE_PHOTO_KEY_PREFIX,
} from "../../utils/constants";

import schoolLogo from "../../assets/logo-sekolah.png";

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const items = NAV_ITEMS[role] || [];

  /*
   * Foto profil hanya digunakan untuk Guru/Admin.
   * Siswa menggunakan icon UserCircle.
   */
  const isStudent = role === "siswa";

  const photoKey = `${PROFILE_PHOTO_KEY_PREFIX}${user?.id || "guest"}`;

  const [profilePhoto, setProfilePhoto] = useState(() =>
    isStudent ? null : localStorage.getItem(photoKey)
  );

  /*
   * Ambil foto ketika user berubah.
   * Tidak dijalankan untuk siswa.
   */
  useEffect(() => {
    if (isStudent) {
      setProfilePhoto(null);
      return;
    }

    setProfilePhoto(localStorage.getItem(photoKey));
  }, [photoKey, isStudent]);

  /*
   * Update foto ketika localStorage berubah
   * dari tab/window lain.
   */
  useEffect(() => {
    if (isStudent) return;

    function handleStorageChange(event) {
      if (event.key === photoKey) {
        setProfilePhoto(event.newValue);
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [photoKey, isStudent]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">

      {/* =========================
          HEADER
      ========================== */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 dark:border-slate-800">
        <img
          src={schoolLogo}
          alt=""
          className="h-8 w-8 object-contain"
          aria-hidden="true"
        />

        <span className="truncate text-sm font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
          {APP_SHORT_NAME}
        </span>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`
            }
          >
            <Icon
              className="h-5 w-5"
              aria-hidden="true"
            />

            {label}
          </NavLink>
        ))}
      </nav>

      {/* =========================
          USER PROFILE
      ========================== */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">

        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-1.5">

          {/* =========================
              AVATAR
              Siswa = Icon
              Guru/Admin = Foto
          ========================== */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isStudent
                ? "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
                : "overflow-hidden bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300"
            }`}
          >
            {isStudent ? (
              <UserCircle
                className="h-6 w-6"
                aria-hidden="true"
              />
            ) : profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Foto profil"
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || "?"
            )}
          </div>

          {/* =========================
              NAMA DAN ROLE
          ========================== */}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {user?.name || "Pengguna"}
            </p>

            <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">
              {role}
            </p>
          </div>
        </div>

        {/* =========================
            LOGOUT
        ========================== */}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <LogOut
            className="h-5 w-5"
            aria-hidden="true"
          />

          Keluar
        </button>
      </div>
    </aside>
  );
}