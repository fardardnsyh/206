import { useNavigate, useParams } from 'react-router-dom';
import CustomerDetail from '../components/CustomerDetail';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer } from '../types/Customer';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Modal from '../components/ui/DeleteModal';
import BackIcon from '../components/icons/BackIcon';
import Button from '../components/ui/Button';

export default function Customer() {
  const { customerId } = useParams() as { customerId: string };
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data, error, isLoading } = useCustomers(customerId);
  const customer = data as Customer;
  const { mutate: deleteCustomer, isPending } = useDeleteCustomer();

  const handleDelete = () => {
    setModalOpen(false);
    deleteCustomer(customerId, {
      onSettled: () => {
        navigate('/customers');
      },
      onSuccess: () => {
        toast.success('Customer deleted');
        console.log('delete customer');
        navigate('/customers');
      },
    });
  };

  if (error) {
    return <h2 className="text-bold mt-8">Error, try again</h2>;
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="sticky top-0 bg-gray-200">
        <div className="bg-white rounded-b-xl px-6 py-2 pt-7 mb-6">
          <Button
            as="link"
            to="/customers"
            label="Back"
            iconLeft={<BackIcon />}
            variant="ghost"
          />
          {isLoading || data === undefined ? (
            <div className="h-20 mt-2"></div>
          ) : (
            <div className="flex items-center justify-end gap-4 my-4 mt-8">
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
                <p>Are you sure you want to delete this customer?</p>
              </Modal>
            </div>
          )}
        </div>
      </div>
      {isLoading || data === undefined ? (
        <article className="w-full bg-white px-8 py-10 rounded-xl mt-4 animate-pulse">
          <div className="bg-gray-200 h-6 w-40 my-2"></div>
          <div className="bg-gray-200 h-6 w-40 my-2"></div>
          <div className="bg-gray-200 h-6 w-40 my-2"></div>
          <div className="bg-gray-200 h-6 w-20 my-2"></div>
        </article>
      ) : (
        <article className="w-full bg-white px-8 py-10 rounded-xl mt-4">
          <CustomerDetail customer={customer} />
        </article>
      )}
    </div>
  );
}

