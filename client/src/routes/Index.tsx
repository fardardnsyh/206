import { useAuth } from '../hooks/useAuth';
import useInvoices from '../hooks/useInvoices';
import Button from '../components/ui/Button';
import ForwardIcon from '../components/icons/ForwardIcon';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Index() {
  const { user } = useAuth();
  const { data, error, isLoading } = useInvoices();

  const pendingInvoices = data?.filter((inv) => inv.status === 'pending');

  if (error) {
    return <h2 className="font-bold mt-8">Error, try again</h2>;
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="bg-gray-200">
        <div className="bg-white rounded-b-xl px-6 py-8 mb-6">
          <h1 className="text-3xl font-extrabold text-zinc-600">
            Welcome back, <span className="text-emerald-500">{user?.name}</span>
            &nbsp;!
          </h1>
          {isLoading ? (
            <div className="my-[30px]">
              <LoadingSpinner />
            </div>
          ) : (
            <h2 className="text-xl my-8">
              You have&nbsp;
              <span className="font-extrabold text-black">
                {pendingInvoices?.length}
              </span>
              &nbsp;pending invoice{pendingInvoices?.length === 1 ? '' : 's'}.
            </h2>
          )}
          <Button
            as="link"
            to="/invoices"
            label="View invoices"
            iconRight={<ForwardIcon />}
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
}

