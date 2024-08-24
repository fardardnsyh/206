import axios from './axios';
import { SignupInput } from '../schemas/signup.schema';
import { User } from '../types/User';

export async function createUser(data: SignupInput) {
  const res = await axios.post<User>('/api/users', data);

  return res.data;
}

