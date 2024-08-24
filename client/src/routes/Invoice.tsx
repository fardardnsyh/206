import { useNavigate, useParams } from 'react-router-dom';
import useInvoices from '../hooks/useInvoices';
import Button from '../components/ui/Button';
import { useDeleteInvoice } from '../hooks/useDeleteInvoice';
import toast from 'react-hot-toast';
import { useEditInvoice } from '../hooks/useEditInvoice';
import { useState } from 'react';
import Modal from '../components/ui/DeleteModal';
// import BackButton from '../components/ui/BackButton';
import BackIcon from '../components/icons/BackIcon';
import formatCurrency from '../utils/formatCurrency';
import StatusPill from '../components/ui/StatusPill';

// TODO: table column widths

export default function Invoice() {
  const { invoiceId } = useParams() as { invoiceId: string };
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data, error, isLoading } = useInvoices(invoiceId);

  const { mutate: deleteInvoice, isPending } = useDeleteInvoice();
  const { mutate: updateInvoice } = useEditInvoice();

  const dateFormat = new Intl.DateTimeFormat('en-UK');

  const handleDelete = () => {
    deleteInvoice(invoiceId, {
      onSuccess: () => {
        toast.success('Invoice deleted');
        console.log('delete invoice');
        navigate('/invoices');
      },
      onError: (err) => {
        console.log('error deleting invoice:', err);
        toast.error('Error deleting invoice, try again');
      },
    });
  };

  const handleMarkAsPaid = () => {
    updateInvoice(
      {
        invoiceId,
        data: { ...data, customer: data?.customer.id, status: 'paid' },
      },
      {
        onSuccess: () => {
          toast.success('Invoice updated');
          console.log('marked as paid');
        },
        onError: (err) => {
          console.log('error marking invoice as paid', err);
          toast.error('Error updating invoice, try again');
        },
      }
    );
  };

  if (error) {
    return <h2 className="text-bold mt-8">Error, try again.</h2>;
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="sticky top-0 bg-gray-200">
        <div className="bg-white rounded-b-xl px-6 py-2 pt-7 mb-6">
          <Button
            as="link"
            to="/invoices"
            label="Back"
            iconLeft={<BackIcon />}
            variant="ghost"
          />

          {isLoading || data === undefined ? (
            <div className="h-20 mt-2"></div>
          ) : (
            <div className="flex items-center gap-4 my-4 mt-8">
              <div className="mr-auto">
                <StatusPill status={data.status} />
              </div>

              {data?.status === 'pending' ? (
                <Button label="Mark as paid" onClick={handleMarkAsPaid} />
              ) : null}
              <Button as="link" to="edit" label="Edit" variant="tertiary" />
              <Button
                label="Delete"
                variant="danger"
                onClick={() => setModalOpen(true)}
                disabled={isPending}
              />
              <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
              >
                <p>Are you sure you want to delete this invoice?</p>
              </Modal>
            </div>
          )}
        </div>
      </div>

      {isLoading || data === undefined ? (
        <article className="w-full bg-white px-8 py-10 rounded-xl mt-4 animate-pulse">
          <div className="bg-gray-200 h-10 w-32 my-2"></div>
          <div className="bg-gray-200 h-6 w-28 my-2"></div>
          <div className="bg-gray-200 h-6 w-full my-2 mt-40"></div>
          <div className="bg-gray-200 h-6 w-full my-2"></div>
          <div className="bg-gray-200 h-6 w-full my-2"></div>
          <div className="bg-gray-200 h-6 w-80 my-2"></div>
        </article>
      ) : (
        <article className="w-full bg-white px-8 py-10 rounded-xl mt-4">
          <h1 className="font-bold text-black text-4xl">Invoice</h1>
          <h2 className="font-extrabold text-slate-500 text-2xl">
            # {data?.invoiceNumber.toString().padStart(5, '0')}
          </h2>
          <div className="flex justify-end">
            <div className="text-end">
              <address className="text-right not-italic mt-4 text-slate-500">
                <span className="font-bold text-black">{data?.user?.name}</span>
                <br />
                {data?.user?.email}
                <br />
                {Object.entries(data?.user?.address).map((line) => {
                  return (
                    line[1] && (
                      <span key={line[0]}>
                        {line[1]}
                        <br />
                      </span>
                    )
                  );
                })}
              </address>
            </div>
          </div>
          <div className="flex gap-24 mt-12">
            <div>
              <h3>
                <div className="font-bold">Date:</div>
                <div className="text-zinc-500">
                  {dateFormat.format(Date.parse(data.date ?? ''))}
                </div>
              </h3>
              <h3 className="mt-4">
                <div className="font-bold">Due:</div>
                <div className="text-zinc-500">
                  {dateFormat.format(Date.parse(data.due ?? ''))}
                </div>
              </h3>
            </div>
            <div>
              <h3 className="font-bold">Billed to:</h3>
              <address className="not-italic mt-2 text-slate-500">
                {data?.customer?.name}
                <br />
                {data?.customer?.email}
                <br />
                {data?.customer?.address &&
                  Object.entries(data?.customer?.address).map((line) => {
                    return (
                      line[1] && (
                        <span key={line[0]}>
                          {line[1]}
                          <br />
                        </span>
                      )
                    );
                  })}
              </address>
            </div>
          </div>

          <table className="table-auto w-full bg-slate-200 rounded-md p-8 mt-16 mb-4">
            <caption className="sr-only">Item details</caption>
            <thead className="uppercase text-xs font-extrabold text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 text-start">
                  Item
                </th>
                <th scope="col" className="px-6 py-4 text-start">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-4 text-start">
                  Amount
                </th>
                <th scope="col" className="px-6 py-4 text-start">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="p-8">
              {data?.items.map((item) => (
                <tr key={item.id} className="odd:bg-slate-100">
                  <td className="px-6 py-2 text-start">{item.description}</td>
                  <td className=" px-6 py-2 text-start">{item.quantity}</td>
                  <td className="px-6 py-2 text-start">{item.amount}</td>
                  <td className="px-6 py-2 text-start">{item.total}</td>
                </tr>
              ))}
              <tr className="bg-slate-500">
                <th
                  scope="row"
                  colSpan={3}
                  className="text-end px-6 py-2 text-white uppercase font-medium"
                >
                  Total due:
                </th>
                <td className="px-6 py-4 text-4xl text-white">
                  {formatCurrency(data?.total ?? 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      )}
    </div>
  );
}

