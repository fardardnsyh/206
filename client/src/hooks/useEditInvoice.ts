import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editInvoice } from '../api/invoices';

export function useEditInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editInvoice,
    onSuccess: (invoice) => {
      return queryClient.invalidateQueries({
        queryKey: ['invoices', invoice.id],
      });
    },
  });
}
