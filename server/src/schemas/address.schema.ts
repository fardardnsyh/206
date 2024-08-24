import { z } from 'zod';

// simple postcode regex from: https://ideal-postcodes.co.uk/guides/postcode-validation
const postcodeRegex = new RegExp(/^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i);

export const addressSchema = z.object(
  {
    line1: z
      .string({
        required_error:
          'Enter address line 1, typically the building and street',
      })
      .min(2),
    line2: z.string().optional(),
    city: z.string({ required_error: 'Enter town or city' }).min(2),
    county: z.string().optional(),
    postcode: z
      .string({ required_error: 'Enter postcode' })
      .regex(postcodeRegex, 'Enter a valid postcode'),
  },
  { required_error: 'Enter address' }
);

