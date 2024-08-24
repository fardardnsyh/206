import { z } from 'zod';

// simple postcode regex from: https://ideal-postcodes.co.uk/guides/postcode-validation
const postcodeRegex = new RegExp(/^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i);

export const addressSchema = z.object({
  line1: z.string().trim().min(2, 'Enter address line 1'),
  line2: z.string().trim(),
  city: z.string().trim().min(2, 'Enter town or city'),
  county: z.string().trim(),
  postcode: z
    .string({ required_error: 'Enter postcode' })
    .regex(postcodeRegex, 'Enter a valid postcode'),
});

