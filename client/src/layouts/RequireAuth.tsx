import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAuth() {
  const { user } = useAuth();

  console.log('rendering RequireAuth, user.authenticated is:', user);

  return !user?.isAuthenticated ? <Navigate to="/login" replace /> : <Outlet />;
}

