import type { Customer } from '../types/Customer';

export default function CustomerDetail({ customer }: { customer: Customer }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-zinc-600 mb-8">Customer</h1>
      <h2 className="font-bold">{customer.name}</h2>
      <p>{customer.email}</p>
      <address className="not-italic">
        {Object.values(customer.address).map((line) => {
          return (
            line && (
              <>
                {line}
                <br />
              </>
            )
          );
        })}
      </address>
    </div>
  );
}

