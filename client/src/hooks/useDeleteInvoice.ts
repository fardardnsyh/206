import { useMutation } from '@tanstack/react-query';
import { deleteInvoice } from '../api/invoices';

export function useDeleteInvoice() {
  return useMutation({
    mutationFn: deleteInvoice,
  });
}
