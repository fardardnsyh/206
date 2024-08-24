import { z } from 'zod';

// TODO: should this file be called login.schema.ts ?
// NOTE: email and password do not have validations that create user have

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

