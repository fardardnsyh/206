import { Link } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import PlusIcon from '../components/icons/PlusIcon';
import SortIcon from '../components/icons/SortIcon';
import Button from '../components/ui/Button';

export default function Customers() {
  const { data, error, isLoading } = useCustomers();

  if (error) {
    return <p>Something went wrong...</p>;
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="sticky top-0 bg-gray-200">
        <div className="bg-white rounded-b-xl px-6 py-2 pt-8 mb-6">
          <h1 className="text-3xl font-extrabold text-zinc-600">Customers</h1>
          <div className="flex items-center justify-end gap-8 my-4 mt-8">
            <Button
              as="link"
              to="new"
              label="New customer"
              iconLeft={<PlusIcon />}
            />
          </div>
        </div>
        <div className="grid grid-cols-5 px-6 py-4 font-bold bg-white text-zinc-400 text-xs gap-4 mb-[2px] uppercase rounded-t-xl border-b-2 border-gray-200">
          <h3 id="customer-name">
            <Link className="inline-flex gap-1" to={`?filter=name`}>
              Name <SortIcon />
            </Link>
          </h3>
          <h3 id="customer-email">
            <Link className="inline-flex gap-1" to={`?filter=email`}>
              Email <SortIcon />
            </Link>
          </h3>
        </div>
      </div>
      {isLoading ? (
        <div className="animate-pulse bg-white px-6 py-4 font-bold text-gray-500">
          Loading...
        </div>
      ) : (
        <ul className="flex flex-col gap-[2px] font-medium text-zinc-600">
          {data?.map((cust) => (
            <li key={cust.id}>
              <Link
                to={cust.id}
                className="w-full bg-zinc-100 hover:bg-white px-6 py-4 grid grid-cols-5 gap-4"
              >
                <span aria-describedby="customer-name">{cust.name}</span>
                <span
                  aria-describedby="customer-email"
                  className="text-zinc-400"
                >
                  {cust.email}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="h-6 bg-zinc-100 rounded-b-xl mt-[2px] mb-20"></div>
    </div>
  );
}

