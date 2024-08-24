// import { useQuery } from '@tanstack/react-query';
// import { getCustomer } from '../api/customers';
import { useParams } from 'react-router-dom';

import { useCustomers } from '../hooks/useCustomers';
import CustomerForm from '../components/CustomerForm';

export default function EditCustomer() {
  // TODO: find best way of aserting that customerId is not null
  // can use as { customerId: string}
  // { customerId = '' } = useParams
  // params = useParams(); const customerId = params.customerId ?? '';
  const { customerId } = useParams() as { customerId: string };

  const { data, error, isLoading } = useCustomers(customerId);

  console.log('the customer data is', data);

  if (error) {
    return <p>Something went wrong...</p>;
  }

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="bg-white rounded-b-xl px-6 py-8 mb-6">
        <h1 className="text-3xl font-extrabold text-zinc-600">Edit Customer</h1>
      </div>
      <CustomerForm type="EditCustomer" defaultValues={data} />
    </div>
  );
}

