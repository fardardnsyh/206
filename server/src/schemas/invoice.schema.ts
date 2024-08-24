import { z } from 'zod';
import { objectIdSchema } from './objectId.schema';
// import { customerSchema } from './customer.schema';

// TODO: discount?
// TODO: vat?
// TODO: totals (items and grand todal) - calculate and add on refine? or add on client and validate on refine?
// TODO: put z.trim().toUpperCase etc. in zod schema rather than mongoose schema?

export const itemSchema = z.object({
  // NOTE: quantity cannot coerce as it will convert true to a number!
  quantity: z
    .number({ required_error: 'Enter quantity' })
    .int('Enter a whole number')
    .min(1, 'Quantity cannot be less than 1'),
  description: z.string({ required_error: 'Enter description' }),
  // NOTE: amount connot coerce as it will convert true to a number!
  amount: z
    .number({ required_error: 'Enter amount' })
    .nonnegative('Amount cannot be a negative value'),
});

// TODO: use .pipe to enable coercion properly and give required error before the coercion ?
export const invoiceBody = {
  body: z.union([
    z.object({
      // invoice number
      date: z
        .string({ required_error: 'Enter invoice date' })
        .pipe(z.coerce.date()),
      // date: z.coerce.date({
      //   required_error: 'Enter invoice date',
      //   invalid_type_error: 'type Date is required',
      // }),
      paymentTerms: z
        .number({ required_error: 'Enter number of days' })
        .int('Enter a whole number')
        .positive('Value must be positive'),
      status: z.enum(['pending', 'paid'], {
        required_error: 'Enter invoice status',
      }),
      customer: objectIdSchema,
      items: z
        .array(itemSchema, { required_error: 'Enter an item' })
        .min(1, 'Enter at least one item'),
    }),
    z.object({
      date: z.string().optional(),
      paymentTerms: z.number().optional(),
      status: z.literal('draft'),
      customer: z.union([objectIdSchema, z.null()]).optional(),
      items: z
        .array(
          z.object({
            quantity: z.number().int().nonnegative().optional(),
            description: z.string().optional(),
            amount: z.number().nonnegative().optional(),
          })
        )
        .optional(),
    }),
  ]),
};

export const invoiceParams = {
  params: z.object({
    invoiceId: objectIdSchema,
  }),
};

export const createInvoiceSchema = z.object({
  ...invoiceBody,
});

export const deleteInvoiceSchema = z.object({
  ...invoiceParams,
});

export const getInvoiceByIdSchema = z.object({
  ...invoiceParams,
});

export const editInvoiceSchema = z.object({
  ...invoiceBody,
  ...invoiceParams,
});

// TODO: handle missing / undefined values (zod errorMap ?)
// but perhaps not needed as in customer schema it gives a required message ?
// FIX: it's because of z.coerce as it tries to coerce undefined to a date, so then it gives a type error not a required error
// NOTE: that removing z.coerce on the date fails the tests: cannot seem to just use { date: new Date() } in the test object
// const customErrorMap: z.ZodErrorMap = (error, ctx) => {
//   switch (error.code) {
//     case z.ZodIssueCode.invalid_date:
//       if (ctx.data == undefined) {
//         return { message: 'missing or undefined date' };
//       }
//       return { message: 'bad input' };
//       break;

//     case z.ZodIssueCode.custom:
//       return { message: 'bad input' };
//   }

//   return { message: ctx.defaultError };
// };

// z.setErrorMap(customErrorMap);

// export type InvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type DeleteInvoiceInput = z.infer<typeof deleteInvoiceSchema>;
export type GetInvoiceByIdInput = z.infer<typeof getInvoiceByIdSchema>;
export type EditInvoiceInput = z.infer<typeof editInvoiceSchema>;

// customer: z.string().regex(/^[0-9a-f]{24}$/)
// customer: z.custom<mongoose.Types.ObjectId>()
// customer: z.instanceof(ObjectId)

