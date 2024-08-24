import { TypeOf, z } from 'zod';
import { addressSchema } from './address.schema';

// TODO: fix user schemas for the controller inputs - check how specifically it's done in the tomdoes rest api tutorial

export const createUserSchema = z.object({
  body: z
    .object({
      // TODO: should strings be .trim() trimmed?
      name: z.string().trim().min(1, 'Name is required'),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Enter a valid email address'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8)
        .max(32)
        .regex(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* ).{8,32}$/,
          'Password must contain at least one number, one uppercase letter, one lowercase letter, and no spaces'
        ),
      // TODO: single regex for password complexity - can always do incrementally in front end

      // TODO: add password validations, 1 char, number etc. and also confirm password
      // Auth token?
      passwordConfirmation: z.string({
        required_error: 'Password confirmation is required',
      }),
      address: addressSchema,
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match',
      path: ['passwordConfirmation'],
    }),
});

export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  'body.passwordConfirmation'
>;

