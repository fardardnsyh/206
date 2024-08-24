import { Navigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const { user } = useAuth();

  if (user?.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-sm w-full h-full flex flex-col justify-center">
      <SignupForm />
    </div>
  );
}

