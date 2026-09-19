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
import TeacherProfile from '../pages/teacher/TeacherProfile';
import CreateAttendanceSession from '../pages/teacher/CreateAttendanceSession';
import AttendanceSession from '../pages/teacher/AttendanceSession';
import AttendanceMonitor from '../pages/teacher/AttendanceMonitor';

import DutyDashboard from '../pages/duty/DutyDashboard';
import NotScanned from '../pages/duty/NotScanned';
import DutyRecap from '../pages/duty/DutyRecap';

import AdminDashboard from '../pages/admin/AdminDashboard';
import Students from '../pages/admin/Students';
import Teachers from '../pages/admin/Teachers';
import Classes from '../pages/admin/Classes';
import Subjects from '../pages/admin/Subjects';
import Schedules from '../pages/admin/Schedules';
import AttendanceReports from '../pages/admin/AttendanceReports';
import DutySchedules from '../pages/admin/DutySchedules';
import UserRoles from '../pages/admin/UserRoles';
import AttendanceSessions from '../pages/admin/AttendanceSessions';
import StudentAccounts from '../pages/admin/StudentAccounts';
import TeacherAccounts from '../pages/admin/TeacherAccounts';

import { ROLES } from '../utils/constants';
import useAuth from '../hooks/useAuth';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const home = {
    siswa: '/student/dashboard',
    guru: '/teacher/dashboard',
    guru_piket: '/duty/dashboard',
    admin: '/admin/dashboard',
  };

  return (
    <Navigate
      to={home[role] || '/login'}
      replace
    />
  );
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* ==================== AUTHENTICATION ==================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ==================== ROOT ==================== */}

      <Route
        path="/"
        element={<RootRedirect />}
      />

      {/* ==================== PROTECTED APPLICATION ==================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* ==================== SISWA ==================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[ROLES.STUDENT]}
              />
            }
          >
            <Route
              path="/student/dashboard"
              element={<StudentDashboard />}
            />

            <Route
              path="/student/scan"
              element={<ScanAttendance />}
            />

            <Route
              path="/student/history"
              element={<AttendanceHistory />}
            />

            <Route
              path="/student/profile"
              element={<StudentProfile />}
            />
          </Route>

          {/* ==================== GURU KELAS ==================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[ROLES.TEACHER]}
              />
            }
          >
            <Route
              path="/teacher/dashboard"
              element={<TeacherDashboard />}
            />

            <Route
              path="/teacher/profile"
              element={<TeacherProfile />}
            />

            <Route
              path="/teacher/sessions/create"
              element={<CreateAttendanceSession />}
            />

            <Route
              path="/teacher/sessions/:sessionId"
              element={<AttendanceSession />}
            />

            <Route
              path="/teacher/monitor"
              element={<AttendanceMonitor />}
            />
          </Route>

          {/* ==================== GURU PIKET ==================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[ROLES.DUTY_TEACHER]}
              />
            }
          >
            <Route
              path="/duty/dashboard"
              element={<DutyDashboard />}
            />

            <Route
              path="/duty/not-scanned"
              element={<NotScanned />}
            />

            <Route
              path="/duty/recap"
              element={<DutyRecap />}
            />
          </Route>

          {/* ==================== ADMIN ==================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[ROLES.ADMIN]}
              />
            }
          >
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/students"
              element={<Students />}
            />

            <Route
              path="/admin/teachers"
              element={<Teachers />}
            />

            <Route
              path="/admin/classes"
              element={<Classes />}
            />

            <Route
              path="/admin/user-roles"
              element={<UserRoles />}
            />

            {/* ==================== AKUN & ROLE ==================== */}

            <Route
              path="/admin/accounts"
              element={<UserRoles />}
            />

            <Route
              path="/admin/accounts/students"
              element={<StudentAccounts />}
            />

            <Route
              path="/admin/accounts/teachers"
              element={<TeacherAccounts />}
            />

            {/* ==================== ADMIN LAINNYA ==================== */}

            <Route
              path="/admin/duty-schedules"
              element={<DutySchedules />}
            />

            <Route
              path="/admin/attendance-sessions"
              element={<AttendanceSessions />}
            />

            <Route
              path="/admin/subjects"
              element={<Subjects />}
            />

            <Route
              path="/admin/schedules"
              element={<Schedules />}
            />

            <Route
              path="/admin/reports"
              element={<AttendanceReports />}
            />
          </Route>

        </Route>
      </Route>

      {/* ==================== UNKNOWN ROUTE ==================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}