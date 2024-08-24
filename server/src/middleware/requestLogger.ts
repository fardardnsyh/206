import { RequestHandler } from 'express';
import logger from '../utils/logger';

const requestLogger: RequestHandler = (req, _res, next) => {
  logger.request(req);
  next();
};

export default requestLogger;
