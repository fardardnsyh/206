import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user } = useAuth();

  if (user?.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-sm w-full h-full flex flex-col justify-center">
      <LoginForm />
    </div>
  );
}

