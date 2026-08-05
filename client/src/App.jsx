import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';

// Layouts
import MainLayout      from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route Guards
import { ProtectedRoute, AdminRoute, StudentRoute, PublicRoute } from './components/common/ProtectedRoute';

// Pages
import LandingPage    from './pages/LandingPage';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';
import VerifyEmail    from './pages/auth/VerifyEmail';
import Unauthorized   from './pages/Unauthorized';

// Dashboards
import StudentDashboard   from './pages/student/Dashboard';
import StudentProfile     from './pages/student/Profile';
import StudentApplications from './pages/student/Applications';
import StudentCalendar    from './pages/student/Calendar';
import OpportunitiesList  from './pages/opportunities/OpportunitiesList';
import OpportunityDetails from './pages/opportunities/OpportunityDetails';

import AdminDashboard      from './pages/admin/Dashboard';
import ManageOpportunities from './pages/admin/ManageOpportunities';
import ManageUsers         from './pages/admin/ManageUsers';
import ManageCategories    from './pages/admin/ManageCategories';
import ManageReports       from './pages/admin/ManageReports';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import AdminSettings       from './pages/admin/Settings';

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '0.875rem',
            fontFamily:   'Inter, system-ui, sans-serif',
            fontSize:     '0.875rem',
            fontWeight:   '500',
            boxShadow:    '0 10px 25px rgba(0,0,0,0.1)',
          },
          success: { style: { background: '#F0FDF4', color: '#065F46', border: '1px solid #A7F3D0' } },
          error:   { style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' } },
        }}
      />

      <Routes>
        {/* ── Public Routes ─────────────────────────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="opportunities"                               element={<OpportunitiesList />} />
          <Route path="opportunities/jobs"                          element={<OpportunitiesList routeCategory="Jobs" />} />
          <Route path="opportunities/internships"                   element={<OpportunitiesList routeCategory="Internships" />} />
          <Route path="opportunities/freelancing"                   element={<OpportunitiesList routeCategory="Freelancing" />} />
          <Route path="opportunities/hackathons"                    element={<OpportunitiesList routeCategory="Hackathons" />} />
          <Route path="opportunities/scholarships"                  element={<OpportunitiesList routeCategory="Scholarships" />} />
          <Route path="opportunities/category/:category"            element={<OpportunitiesList />} />
          <Route path="opportunities/:id"                           element={<OpportunityDetails />} />
        </Route>

        {/* ── Auth Routes ───────────────────────────────────────────────────── */}
        {/* PublicRoute redirects already-logged-in users to their dashboard   */}
        <Route path="login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="forgot-password"       element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="verify-email/:token"   element={<VerifyEmail />} />

        {/* ── 403 Unauthorized ──────────────────────────────────────────────── */}
        {/* Shown when a student tries to access an admin page directly by URL  */}
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* ── Student Routes ────────────────────────────────────────────────── */}
        {/* StudentRoute: unauthenticated → /login | admin → /admin/dashboard   */}
        <Route path="student" element={
          <StudentRoute>
            <DashboardLayout />
          </StudentRoute>
        }>
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<StudentDashboard />} />
          <Route path="profile"       element={<StudentProfile />} />
          <Route path="applications"  element={<StudentApplications />} />
          <Route path="bookmarks"     element={<Navigate to="/student/applications" replace />} />
          <Route path="calendar"      element={<StudentCalendar />} />
        </Route>

        {/* ── Admin Routes ──────────────────────────────────────────────────── */}
        {/* AdminRoute: unauthenticated → /login | non-admin → /unauthorized    */}
        <Route path="admin" element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }>
          <Route index                 element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="users"          element={<ManageUsers />} />
          <Route path="opportunities"  element={<ManageOpportunities />} />
          <Route path="categories"     element={<ManageCategories />} />
          <Route path="reports"        element={<ManageReports />} />
          <Route path="announcements"  element={<ManageAnnouncements />} />
          <Route path="settings"       element={<AdminSettings />} />
        </Route>

        {/* ── 404 ──────────────────────────────────────────────────────────── */}
        <Route path="*" element={
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔍</div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>Page Not Found</h1>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', color: 'white', borderRadius: '0.875rem', textDecoration: 'none', fontWeight: '700' }}>Go Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </Provider>
);

export default App;
