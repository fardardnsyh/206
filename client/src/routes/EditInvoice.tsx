import { useParams } from 'react-router-dom';
import useInvoices from '../hooks/useInvoices';
import InvoiceForm from '../components/InvoiceForm';

// TODO: work out why selected customer not showing when editing an invoice

export default function EditInvoice() {
  const { invoiceId } = useParams() as { invoiceId: string };

  const { data, error, isLoading } = useInvoices(invoiceId);

  const invoice = {
    ...data,
    // TODO: solve input / output types, make date an ISODate object?
    // may need to turn off { valueAsDate: true } in the date input
    // date: data?.date.substring(0, 10),

    // customer is returned as customer object, pass to id string
    customer: data?.customer?.id ?? 'null',
    // date is returned as ISOString - trim off time
    date: data?.date.substring(0, 10),
  };
  console.log('the invoice is', invoice);

  if (error) {
    return <p>Something went wrong...</p>;
  }

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="bg-white rounded-b-xl px-6 py-8 mb-6">
        <h1 className="text-3xl font-extrabold text-zinc-600">Edit Invoice</h1>
      </div>
      <InvoiceForm type="EditInvoice" defaultValues={invoice} />
    </div>
  );
}

