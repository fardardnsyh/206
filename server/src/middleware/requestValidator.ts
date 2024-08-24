import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validate =
  (schema: AnyZodObject) =>
  (
    req: Request<object, object, object>,
    _res: Response,
    next: NextFunction
  ) => {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  };

export default validate;

