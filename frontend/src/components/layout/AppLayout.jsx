import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNavbar from "./MobileNavbar";

// Shell utama aplikasi setelah login: sidebar di desktop, navbar bawah di mobile.
// Halaman spesifik role dirender lewat <Outlet /> (React Router nested routes).
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar />

        <main className="flex-1 pb-20 lg:pb-6">
          <Outlet />
        </main>

        <MobileNavbar />
      </div>
    </div>
  );
}
