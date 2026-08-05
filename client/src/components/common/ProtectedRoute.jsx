import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

// ── ProtectedRoute: requires authentication ────────────────────────────────────
// Redirects unauthenticated users to /login.
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ── AdminRoute: requires role === "admin" ─────────────────────────────────────
// Unauthenticated → /login
// Authenticated but not admin → /unauthorized (shows 403 page)
export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/unauthorized" replace />;
  return children;
};

// ── StudentRoute: requires role === "student" ──────────────────────────────────
// Unauthenticated → /login
// Authenticated but not student → their own dashboard
export const StudentRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'student') return <Navigate to={`/${user?.role}/dashboard`} replace />;
  return children;
};

// ── RoleRoute: generic role guard ─────────────────────────────────────────────
// Redirects to /unauthorized if the user's role is not in allowedRoles.
// Kept for backward compatibility.
export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

// ── PublicRoute: redirect already-logged-in users to their dashboard ───────────
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (isAuthenticated && user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
};
