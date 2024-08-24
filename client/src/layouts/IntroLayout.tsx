import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import Intro from '../components/Intro';

// TODO: change order of layouts / persist login so that api check always runs first
// TODO: make login redirect to home if already logged in
// TODO: make home actually /dashboard ? (this might affect other links?), then have home as redirect route / api check ?

export default function IntroLayout() {
  return (
    <div className="min-h-screen w-full flex">
      <Toaster position="top-center" reverseOrder={false} />
      <Intro />
      <main className="flex bg-gray-200 w-2/3 pl-[10%]">
        <Outlet />
      </main>
    </div>
  );
}

