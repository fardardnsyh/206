import InvoiceForm from '../components/InvoiceForm';
import { InvoiceItem } from '../schemas/invoice.schema';

// TODO: find out why create invoice form handler doesn't always fire???

export default function NewInvoice() {
  return (
    <div className="max-w-5xl w-full">
      <div className="bg-white rounded-b-xl px-6 py-8 mb-6">
        <h1 className="text-3xl font-extrabold text-zinc-600">New Invoice</h1>
      </div>
      <InvoiceForm
        type="NewInvoice"
        defaultValues={{
          paymentTerms: 28,
          customer: 'null',
          status: 'pending',
          items: [{} as InvoiceItem],
        }}
      />
    </div>
  );
}

