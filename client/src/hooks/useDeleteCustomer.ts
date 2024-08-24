import { useMutation } from '@tanstack/react-query';
import { deleteCustomer } from '../api/customers';
// import { useNavigate } from 'react-router-dom';

export function useDeleteCustomer() {
  // const queryClient = useQueryClient();
  // const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteCustomer,
  });
}

