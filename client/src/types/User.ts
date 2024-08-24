// this is actually the auth user type not user from invoice

import { Address } from './Address';

export type User = {
  name: string;
  email: string;
  address: Address;
  id: string;
};

