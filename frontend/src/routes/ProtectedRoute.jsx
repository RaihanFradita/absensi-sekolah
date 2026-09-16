import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from '../components/ui/Loading';

// Catatan: ini hanya proteksi navigasi di frontend untuk UX.
// Otorisasi yang sebenarnya tetap wajib dilakukan oleh backend di setiap endpoint.
export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <Loading fullScreen label="Memeriksa sesi..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
