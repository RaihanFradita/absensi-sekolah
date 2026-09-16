import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import AppLayout from '../components/layout/AppLayout';

import Login from '../pages/auth/Login';

import StudentDashboard from '../pages/student/StudentDashboard';
import ScanAttendance from '../pages/student/ScanAttendance';
import AttendanceHistory from '../pages/student/AttendanceHistory';
import StudentProfile from '../pages/student/StudentProfile';

import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import CreateAttendanceSession from '../pages/teacher/CreateAttendanceSession';
import AttendanceSession from '../pages/teacher/AttendanceSession';
import AttendanceMonitor from '../pages/teacher/AttendanceMonitor';

import AdminDashboard from '../pages/admin/AdminDashboard';
import Students from '../pages/admin/Students';
import Teachers from '../pages/admin/Teachers';
import Classes from '../pages/admin/Classes';
import Subjects from '../pages/admin/Subjects';
import Schedules from '../pages/admin/Schedules';
import AttendanceReports from '../pages/admin/AttendanceReports';

import { ROLES } from '../utils/constants';
import useAuth from '../hooks/useAuth';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const home = { student: '/student/dashboard', teacher: '/teacher/dashboard', admin: '/admin/dashboard' };
  return <Navigate to={home[role] || '/login'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Semua route di bawah ini butuh login (ProtectedRoute), lalu dibatasi per role (RoleRoute). */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/scan" element={<ScanAttendance />} />
            <Route path="/student/history" element={<AttendanceHistory />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.TEACHER]} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/sessions/create" element={<CreateAttendanceSession />} />
            <Route path="/teacher/sessions/:sessionId" element={<AttendanceSession />} />
            <Route path="/teacher/monitor" element={<AttendanceMonitor />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/teachers" element={<Teachers />} />
            <Route path="/admin/classes" element={<Classes />} />
            <Route path="/admin/subjects" element={<Subjects />} />
            <Route path="/admin/schedules" element={<Schedules />} />
            <Route path="/admin/reports" element={<AttendanceReports />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
