import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editCustomer } from '../api/customers';

export function useEditCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCustomer,
    onSuccess: (customer) => {
      // TODO: use void or return?
      return queryClient.invalidateQueries({
        queryKey: ['customers', customer.id],
      });
    },
  });
}

