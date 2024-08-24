import { z } from 'zod';

// 24 char hex string for mongoose.ObjectId
const objectIdRegex = /^[0-9a-f]{24}$/;

export const objectIdSchema = z
  .string()
  .regex(objectIdRegex, 'Malformatted ObjectId');

