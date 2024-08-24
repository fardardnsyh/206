import { Request, Response } from 'express';
import { createUser } from '../services/user.service';
import { CreateUserInput } from '../schemas/user.schema';

export const createUserHandler = async (
  req: Request<object, object, CreateUserInput['body']>,
  res: Response
) => {
  const user = await createUser(req.body);

  return res.status(201).json(user);
};

