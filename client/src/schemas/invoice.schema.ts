import { z } from 'zod';
// import { addressSchema } from './address.schema';

export const itemSchema = z.object({
  quantity: z
    .number()
    .or(z.string().trim().min(1, 'Enter a number'))
    .pipe(
      z.coerce
        .number({ invalid_type_error: 'Enter a number' })
        .min(1, 'Must be greater than zero')
        .int('Enter a whole number')
    ),
  description: z.string().trim().min(1, 'Enter item description'),
  amount: z
    .number()
    .or(z.string().trim().min(1, 'Enter a number'))
    .pipe(
      z.coerce
        .number({ invalid_type_error: 'Enter a number' })
        .nonnegative('Enter a positive value')
    ),
});

export type InvoiceItem = z.infer<typeof itemSchema>;

export const invoiceSchema = z.object({
  // name: z.string().trim().min(1, 'Enter name'),
  // email: z
  //   .string()
  //   .trim()
  //   .min(1, 'Enter email address')
  //   .email('Enter valid email address'),
  // address: addressSchema,
  date: z.coerce.date(),
  paymentTerms: z
    .number()
    .or(z.string().trim().min(1, 'Enter a number'))
    // .string()
    // .trim()
    // .min(1, 'Enter a number')
    .pipe(
      z.coerce
        .number({ invalid_type_error: 'Enter a number' })
        .nonnegative('Enter a positive number')
        .int('Enter a whole number')
    ),
  status: z.enum(['draft', 'pending', 'paid']).default('draft'),
  customer: z
    .string()
    .trim()
    .min(1, 'Select customer')
    .refine((value) => value !== 'new' && value !== 'null', {
      message: 'Enter Customer',
    }),
  items: z
    .array(itemSchema)
    .min(1, 'Enter an item')
    .nonempty('Add at least one item'),
  id: z.string().optional(),
});

// TODO: check if these area actually used anywhere, of if it is just InvoiceFormValues now

// export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceInput = {
  date: Date;
  paymentTerms: number;
  status: 'draft' | 'pending' | 'paid';
  customer: string;
  items: {
    quantity: number;
    description: string;
    amount: number;
  }[];
  id?: string;
};

export const draftInvoiceSchema = z.object({
  date: z.coerce.date(),
  paymentTerms: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .nonnegative('Enter a positive number')
    .int('Enter a whole number')
    .optional(),
  status: z.enum(['draft', 'pending', 'paid']).default('draft'),
  customer: z.string().trim(),
  items: z.array(
    z.object({
      quantity: z.coerce.number(),
      description: z.string().optional(),
      amount: z.coerce.number(),
    })
  ),
  id: z.string().optional(),
});

export type InvoiceDraft = z.infer<typeof draftInvoiceSchema>;

