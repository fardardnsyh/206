import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter email address')
    .email('Enter valid email address'),
  password: z.string().min(1, 'Enter password'),
});

export type LoginInput = z.infer<typeof loginSchema>;

