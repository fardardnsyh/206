import axios from './axios';
import type { QueryFunctionContext } from '@tanstack/react-query';
import type { Invoice, InvoiceFormValues } from '../types/Invoice';

// export async function getInvoice(invoiceId: string | undefined) {
//   const res = await axios.get<object>(`/api/invoice/${invoiceId}`);
//   return res.data;
// }

export async function getInvoices({
  queryKey,
}: QueryFunctionContext<[string, string]>) {
  const invoiceId = queryKey[1];
  console.log('getInvoices:', invoiceId);
  const res =
    invoiceId === 'all'
      ? await axios.get<Invoice[]>('/api/invoices')
      : await axios.get<Invoice>(`/api/invoices/${invoiceId}`);

  return res.data;
}

export async function createInvoice(data: InvoiceFormValues) {
  const res = await axios.post<Invoice>('/api/invoices', data);
  return res.data;
}

export async function editInvoice({
  invoiceId,
  data,
}: {
  invoiceId: string;
  data: InvoiceFormValues;
}) {
  const res = await axios.put<Invoice>(`/api/invoices/${invoiceId}`, data);
  return res.data;
}

export async function deleteInvoice(invoiceId: string) {
  const res = await axios.delete<Invoice>(`/api/invoices/${invoiceId}`);
  return res.data;
}

