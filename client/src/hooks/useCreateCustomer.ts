import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCustomer } from '../api/customers';

// import { Customer } from '../types/Customer';

//TODO: check these mutations are written correctly in terms of optomistic updates

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (newCustomer) => {
      // TODO: use void or return?
      console.log('mutation: onSuccess:', newCustomer);
      // const customers = queryClient.getQueryData(['customers']) as Customer[];
      // queryClient.setQueryData(['customers'], [...customers, newCustomer]);
      return queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

