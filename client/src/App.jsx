import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth pages
import LoginPage          from './pages/auth/LoginPage';
import SignupPage         from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';

// App pages
import DashboardPage   from './pages/dashboard/DashboardPage';
import FocusTimerPage  from './pages/focus/FocusTimerPage';
import PlannerPage     from './pages/planner/PlannerPage';
import CoursePage      from './pages/courses/CoursePage';
import GoalPage        from './pages/goals/GoalPage';
import NotesPage       from './pages/notes/NotesPage';
import DeadlinesPage   from './pages/deadlines/DeadlinesPage';
import ConsistencyPage from './pages/consistency/ConsistencyPage';
import AnalyticsPage   from './pages/analytics/AnalyticsPage';
import ProfilePage     from './pages/profile/ProfilePage';

// Layout & guards
import AppLayout      from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #13131f)',
            color: 'var(--toast-fg, #e2e8f0)',
            border: '1px solid var(--toast-border, #1e1e2e)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#13131f' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#13131f' },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login"                  element={<LoginPage />} />
        <Route path="/signup"                 element={<SignupPage />} />
        <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/focus"        element={<FocusTimerPage />} />
          <Route path="/planner"      element={<PlannerPage />} />
          <Route path="/courses"      element={<CoursePage />} />
          <Route path="/goals"        element={<GoalPage />} />
          <Route path="/notes"        element={<NotesPage />} />
          <Route path="/deadlines"    element={<DeadlinesPage />} />
          <Route path="/consistency"  element={<ConsistencyPage />} />
          <Route path="/analytics"    element={<AnalyticsPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/settings"     element={<ProfilePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default App;
