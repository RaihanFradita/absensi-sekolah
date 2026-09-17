import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ROLE_HOME = {
  student: '/student/dashboard',
  teacher: '/teacher/dashboard',
  duty_teacher: '/duty/dashboard',
  admin: '/admin/dashboard',
};

// Catatan: role di sini datang dari AuthContext (hasil respons backend saat login),
// bukan dari input user. Tetap hanya untuk UX — backend wajib validasi ulang.
export default function RoleRoute({ allowedRoles = [] }) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || '/login'} replace />;
  }

  return <Outlet />;
}
