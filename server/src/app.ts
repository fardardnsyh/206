import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import config from './config';
import logger from './utils/logger';
import db from './utils/db';

import invoiceRouter from './routes/invoice.route';
import customerRouter from './routes/customer.route';
import userRouter from './routes/user.route';
import authRouter from './routes/auth.route';

import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';

const app = express();
app.use(cors(config.CORS_OPTIONS));
app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

// TODO: do I need this anymore?
// mongoose.set('strictQuery', false);

void db.connect();

// static frontend - no longer used
// app.use(express.static(config.FRONTEND_PATH));

// API healthcheck
app.get('/api/status', (_, res) => {
  logger.info('service status pinged');
  res.sendStatus(200);
});

// routes
app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/customers', customerRouter);

// TODO: do I want to barrel export/import middleware
// e.g. app.use( middleware.unknownEndpoint )
// unknown endpoint
// NOTE: can set to 500 etc. for testing purposes
app.use((_, res) => {
  res.status(404).send({ error: 'Unknown endpoint' });
});

app.use(errorHandler);

export default app;

