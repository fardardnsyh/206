import { useEffect, useState } from 'react';
// import { statusCheck } from '../api/status';
import axios from '../api/axios';
import { Outlet } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Intro from '../components/Intro';

export default function ApiStatus() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      console.log('checkApiStatus');
      try {
        const res = await axios.get('/api/status', { timeout: 180000 });
        if (res.status === 200) {
          console.log('api status: ready');
          setStatus('ready');
        }
      } catch (err) {
        setError(true);
        console.error('Error checking API status:', err);
      }
    };

    void checkApiStatus();
  }, []);

  return status === 'ready' ? (
    <Outlet />
  ) : (
    <div className="min-h-screen w-full flex">
      <Intro />
      <main className="flex items-center bg-gray-200 w-2/3 pl-[10%]">
        <div className="flex gap-6">
          {error ? (
            <p className="text-xl text-black">Please reload your browser</p>
          ) : (
            <>
              <LoadingSpinner />
              <details className="text-sm text-gray-500 max-w-[54ch] absolute ml-14">
                <summary className="text-xl text-black cursor-pointer hover:text-gray-500 transition-colors">
                  API server loading, please wait...
                </summary>
                <p className="pl-5 mt-4">
                  The API is hosted on a free-tier web service provider.
                  <br />
                  It spins down when idle, and up again on next request
                  <br />- this should only take a minute or two!
                </p>
              </details>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

