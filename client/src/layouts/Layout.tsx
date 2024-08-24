import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import MenuButton from '../components/ui/MenuButton';
import InvoiceIcon from '../components/icons/InvoiceIcon';
import CustomersIcon from '../components/icons/CustomersIcon';
import HomeIcon from '../components/icons/HomeIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import UserIcon from '../components/icons/UserIcon';

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen w-full flex">
      <Toaster position="top-center" reverseOrder={false} />
      <section className="bg-white text-black w-full max-w-72 sticky top-0 h-screen">
        <div className="px-10 py-8 flex flex-col h-full">
          <div className="flex">
            <a href="/" className="text-3xl font-extrabold text-zinc-600">
              Mint.
            </a>
            <div className="bg-green-400 w-4 h-4 rounded-tl-lg rounded-br-lg"></div>
          </div>
          <nav className="h-full py-8 pt-16">
            <menu className="flex flex-col flex-1 gap-1 h-full">
              <li>
                <MenuButton to="/" label="Home" icon={<HomeIcon />} />
              </li>
              <li>
                <MenuButton
                  to="/invoices"
                  label="Invoices"
                  icon={<InvoiceIcon />}
                />
              </li>
              <li className="mb-auto">
                <MenuButton
                  to="/customers"
                  label="Customers"
                  icon={<CustomersIcon />}
                />
              </li>
              {user ? (
                <>
                  <li>
                    <MenuButton
                      as="button"
                      label={user?.email}
                      icon={<UserIcon />}
                    />
                  </li>
                  <li>
                    <MenuButton
                      as="button"
                      onClick={logout}
                      label="Logout"
                      icon={<LogoutIcon />}
                    />
                  </li>
                </>
              ) : null}
            </menu>
          </nav>
        </div>
      </section>

      <main className="flex bg-gray-200 w-full justify-center px-8 pl-[calc(100vw-100%)]">
        <Outlet />
      </main>
    </div>
  );
}

