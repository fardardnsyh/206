import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { getInvoices } from '../api/invoices';
import { Invoice } from '../types/Invoice';

export default function useInvoices(): UseQueryResult<Invoice[]>;

export default function useInvoices(invoiceId: string): UseQueryResult<Invoice>;

export default function useInvoices(invoiceId?: string) {
  const key = invoiceId ?? 'all';
  return useQuery({
    queryKey: ['invoices', key],
    queryFn: getInvoices,
  });
}

