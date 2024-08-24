import { Link, NavLink, useSearchParams } from 'react-router-dom';
import useInvoices from '../hooks/useInvoices';
import formatDate from '../utils/formatDate';
import StatusPill from '../components/ui/StatusPill';
import formatCurrency from '../utils/formatCurrency';
import formatInvoiceNumber from '../utils/formatInvoiceNumber';
import SortIcon from '../components/icons/SortIcon';
import PlusIcon from '../components/icons/PlusIcon';
import Button from '../components/ui/Button';

export default function Invoices() {
  const { data, error, isLoading } = useInvoices();

  const [params] = useSearchParams({
    filter: 'all',
    sort: 'invoice',
    order: 'desc',
  });

  const filter = params.get('filter');
  const sort = params.get('sort');
  const order = params.get('order');

  if (error) {
    return <h2 className="text-bold mt-8">Something went wrong...</h2>;
  }

  const invoices =
    filter === 'all' ? data : data?.filter((inv) => inv.status === filter);

  if (sort === 'invoice') {
    invoices?.sort((a, b) => {
      return order === 'asc'
        ? a.invoiceNumber - b.invoiceNumber
        : b.invoiceNumber - a.invoiceNumber;
    });
  } else if (sort === 'date') {
    invoices?.sort((a, b) => {
      return order === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } else if (sort === 'customer') {
    invoices?.sort((a, b) => {
      return order === 'asc'
        ? a.customer.name.localeCompare(b.customer.name)
        : b.customer.name.localeCompare(a.customer.name);
    });
  } else if (sort === 'total') {
    invoices?.sort((a, b) => {
      return order === 'asc' ? a.total - b.total : b.total - a.total;
    });
  } else if (sort === 'status') {
    invoices?.sort((a, b) => {
      return order === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    });
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="sticky top-0 bg-gray-200">
        <div className="bg-white rounded-b-xl px-6 py-2 pt-8 mb-6">
          <h1 className="text-3xl font-extrabold text-zinc-600">Invoices</h1>
          <div className="flex items-center gap-8 my-4 mt-8">
            <NavLink
              to="/invoices?filter=all"
              className={
                filter === 'all'
                  ? 'font-extrabold text-nowrap text-black underline underline-offset-[2rem] decoration-8'
                  : 'font-extrabold text-nowrap text-zinc-400'
              }
            >
              All invoices
            </NavLink>
            <NavLink
              to="/invoices?filter=pending"
              className={
                filter === 'pending'
                  ? 'font-extrabold text-nowrap text-black underline underline-offset-[2rem] decoration-8'
                  : 'font-extrabold text-nowrap text-zinc-400'
              }
            >
              Pending
            </NavLink>
            <NavLink
              to="/invoices?filter=paid"
              className={
                filter === 'paid'
                  ? 'font-extrabold text-nowrap text-black underline underline-offset-[2rem] decoration-8'
                  : 'font-extrabold text-nowrap text-zinc-400'
              }
            >
              Paid
            </NavLink>
            <NavLink
              to="/invoices?filter=draft"
              className={
                filter === 'draft'
                  ? 'font-extrabold text-nowrap text-black underline underline-offset-[2rem] decoration-8 mr-auto'
                  : 'font-extrabold text-nowrap text-zinc-400 mr-auto'
              }
            >
              Draft
            </NavLink>
            <Button
              as="link"
              to="new"
              label="New invoice"
              iconLeft={<PlusIcon />}
            />
          </div>
        </div>
        <div className="grid grid-cols-5 px-6 py-4 font-bold bg-white text-zinc-400 text-xs gap-4 mb-[2px] uppercase rounded-t-xl border-b-2 border-gray-200">
          <h3 id="invoice-number">
            <Link
              className="inline-flex gap-1"
              to={`?filter=${filter}&sort=invoice&order=${
                order === 'asc' ? 'desc' : 'asc'
              }`}
            >
              Invoice number <SortIcon />
            </Link>
          </h3>
          <h3 id="invoice-date">
            <Link
              className="inline-flex gap-1"
              to={`?filter=${filter}&sort=date&order=${
                order === 'asc' ? 'desc' : 'asc'
              }`}
            >
              Date <SortIcon />
            </Link>
          </h3>
          <h3 id="invoice-customer">
            <Link
              className="inline-flex gap-1"
              to={`?filter=${filter}&sort=customer&order=${
                order === 'asc' ? 'desc' : 'asc'
              }`}
            >
              Customer <SortIcon />
            </Link>
          </h3>
          <h3 id="invoice-total" className="text-end">
            <Link
              className="inline-flex gap-1"
              to={`?filter=${filter}&sort=total&order=${
                order === 'asc' ? 'desc' : 'asc'
              }`}
            >
              Total <SortIcon />
            </Link>
          </h3>
          <h3 id="invoice-status" className="text-end">
            <Link
              className="inline-flex gap-1 text-end"
              to={`?filter=${filter}&sort=status&order=${
                order === 'asc' ? 'desc' : 'asc'
              }`}
            >
              Status <SortIcon />
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
          {invoices?.map((inv) => (
            <li key={inv.id}>
              <Link
                to={inv.id}
                className="w-full bg-zinc-100 hover:bg-white px-6 py-4 grid grid-cols-5 gap-4"
              >
                <span aria-describedby="invoice-number">
                  <span className="text-zinc-400">#</span>{' '}
                  {formatInvoiceNumber(inv.invoiceNumber)}
                </span>
                <span aria-describedby="invoice-date">
                  {formatDate(inv.date)}
                </span>
                <span
                  aria-describedby="invoice-customer"
                  className="text-zinc-400"
                >
                  {inv.customer?.name}
                </span>
                <span aria-describedby="invoice-total" className="text-end">
                  {formatCurrency(inv.total)}
                </span>
                <span aria-describedby="invoice-status" className="text-end">
                  <StatusPill status={inv.status} />
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

