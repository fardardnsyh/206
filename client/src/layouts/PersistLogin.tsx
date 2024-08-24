import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';
import { refreshAccessToken } from '../api/auth';

import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Intro from '../components/Intro';

export default function PersistLogin() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('refreshAuthOnFirstMount');

    const refreshAuthOnFirstMount = async () => {
      try {
        const token = await refreshAccessToken();
        const decoded = jwtDecode<{ name: string; email: string }>(token);
        setUser({
          name: decoded.name,
          email: decoded.email,
          accessToken: token,
          isAuthenticated: true,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void refreshAuthOnFirstMount();

    // don't know if this is needed as this should never unmount
    return () => setUser(null);
  }, [setUser]);

  return isLoading ? (
    <div className="min-h-screen w-full flex">
      <Intro />
      <main className="flex items-center bg-gray-200 w-2/3 pl-[10%]">
        <div className="flex gap-6">
          <LoadingSpinner />
        </div>
      </main>
    </div>
  ) : (
    <Outlet />
  );
}

