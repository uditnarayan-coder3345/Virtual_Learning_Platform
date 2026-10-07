import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';

const dashboardForRole = {
  STUDENT: '/student/dashboard',
  INSTRUCTOR: '/instructor/dashboard',
  ADMIN: '/admin/dashboard',
};

function RequireRole({ role, children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center"><Loader label="Restoring your session" /></main>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user.role !== role) {
    return <Navigate to={dashboardForRole[user.role] || '/login'} replace />;
  }
  return children;
}

export default RequireRole;
