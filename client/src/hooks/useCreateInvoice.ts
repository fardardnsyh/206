import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInvoice } from '../api/invoices';

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (newInvoice) => {
      console.log('mutation: onSuccess:', newInvoice);
      return queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

