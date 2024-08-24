import CustomerForm from '../components/CustomerForm';

export default function NewCustomer() {
  return (
    <div className="max-w-5xl w-full">
      <div className="bg-white rounded-b-xl px-6 py-8 mb-6">
        <h1 className="text-3xl font-extrabold text-zinc-600">New Customer</h1>
      </div>
      <CustomerForm
        type="NewCustomer"
        defaultValues={{
          name: '',
          email: '',
          address: {
            line1: '',
            line2: '',
            city: '',
            county: '',
            postcode: '',
          },
          id: '',
        }}
      />
    </div>
  );
}

