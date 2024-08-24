import axios from './axios';
import type { Customer } from '../types/Customer';
import type { QueryFunctionContext } from '@tanstack/react-query';
// import { CustomerInput } from '../schemas/customer.schema';

export async function getCustomers({
  queryKey,
}: QueryFunctionContext<[string, string]>) {
  const customerId = queryKey[1];

  const res =
    customerId === 'all'
      ? await axios.get<Customer[]>('/api/customers')
      : await axios.get<Customer>(`/api/customers/${customerId}`);

  return res.data;
}

export async function createCustomer(data: Omit<Customer, 'id'>) {
  const res = await axios.post<Customer>('/api/customers', data);
  return res.data;
}

export async function editCustomer({
  customerId,
  data,
}: {
  customerId: string;
  data: Customer;
}) {
  console.log('editCustomer sending data:', customerId, data);
  const res = await axios.put<Customer>(`/api/customers/${customerId}`, data);
  console.log('editCustomer returning data:', res);
  return res.data;
}

export async function deleteCustomer(customerId: string | undefined) {
  const res = await axios.delete<Customer>(`/api/customers/${customerId}`);
  return res.data;
}

