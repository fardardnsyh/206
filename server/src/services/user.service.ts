import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { CreateUserInput } from '../schemas/user.schema';

export const createUser = async (input: CreateUserInput['body']) => {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(input.password, saltRounds);

  const user = await User.create({
    name: input.name,
    email: input.email,
    address: input.address,
    passwordHash,
  });

  return user;
};

// Note: have createUser only, no edit or delete to make things simpler
// just have user enter their address and bank details on the invoice

