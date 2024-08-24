import { type ErrorRequestHandler } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // TODO: error handling for 404 etc.
  // this error doesnt seem to do anything
  // sending a delete request to /api/invoices doesn't go to this error handler
  // instead a default express error HTML document is returned in the response
  // if (res.headersSent) {
  //   return _next(err);
  // }

  // TODO: handle missing / undefined values (zod errorMap ?)
  if (err instanceof z.ZodError) {
    logger.error(`Validation error.\n${err.toString()}`);

    return res.status(400).json({
      error: err,
      // error: err.flatten(),
    });
  } else if (
    err instanceof JsonWebTokenError ||
    err instanceof TokenExpiredError
  ) {
    const error = err as Error & { statusCode?: number };
    error.statusCode = 403;

    logger.error(`${error.statusCode} ${error.name} ${error.message}`);

    return res.status(403).json({ message: err.message });
  } else if (err instanceof Error) {
    // not sure how this line works
    const error = err as Error & { statusCode?: number };
    logger.error(`${error.statusCode} ${error.name} ${error.message}`);
    return res.status(error.statusCode ?? 400).json({ message: err.message });
  }

  // check for error names here
  // e.g. CastError, ValidationError, JsonWebTokenError, TokenExpiredError

  return res.status(500).json({ message: 'Internal server error' });
};

export default errorHandler;

// err.name === 'CastError' will detect if it's a Mongoose error

