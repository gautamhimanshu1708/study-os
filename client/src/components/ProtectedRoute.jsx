import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FullPageSpinner } from './ui/Spinner';

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * Preserves the attempted URL so login can redirect back.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
