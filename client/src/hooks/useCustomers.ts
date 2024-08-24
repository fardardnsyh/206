import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { getCustomers } from '../api/customers';
import { Customer } from '../types/Customer';

// TODO: what about undefined if the customerId doesn't match a customer / 404 route?

// function overloads to explicitly define return types:
// when no argument is present it returns an array of customers
export function useCustomers(): UseQueryResult<Customer[]>;
// when customerId argument is present, it returns a single customer
export function useCustomers(customerId: string): UseQueryResult<Customer>;

// wraps useQuery hook - using QueryFunctionContext to pass the state into getCustomers
export function useCustomers(customerId?: string) {
  const state = customerId ?? 'all';

  return useQuery({
    queryKey: ['customers', state],
    queryFn: getCustomers,
  });
}

