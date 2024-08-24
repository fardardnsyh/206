import { Request, Response } from 'express';
import {
  createInvoice,
  deleteInvoiceById,
  editInvoiceById,
  getInvoices,
  getSingleInvoice,
} from '../services/invoice.service';
import {
  CreateInvoiceInput,
  DeleteInvoiceInput,
  EditInvoiceInput,
  GetInvoiceByIdInput,
} from '../schemas/invoice.schema';
import logger from '../utils/logger';

export const getInvoicesHandler = async (req: Request, res: Response) => {
  const { user } = req;

  const invoices = await getInvoices(user);

  return res.json(invoices);
};

export const getSingleInvoiceHandler = async (
  req: Request<GetInvoiceByIdInput['params'], object, object>,
  res: Response
) => {
  const { user } = req;
  const { invoiceId } = req.params;

  const invoice = await getSingleInvoice(user, invoiceId);

  if (!invoice) {
    return res.sendStatus(404);
  }

  logger.info(`RETURNING: ${JSON.stringify(invoice)}`);
  return res.json(invoice);
};

export const createInvoiceHandler = async (
  req: Request<object, object, CreateInvoiceInput['body']>,
  res: Response
) => {
  const { user, body } = req;

  if (!user) {
    return res.sendStatus(400);
  }

  logger.info(`try createInvoice with data: ${JSON.stringify(body)}`);

  const data = {
    ...body,
    // customer: new Types.ObjectId(body.customer),
    user: user.id,
  };
  const invoice = await createInvoice(user, data);
  return res.status(201).json(invoice);
};

export const deleteInvoiceHandler = async (
  req: Request<DeleteInvoiceInput['params'], object, object>,
  res: Response
) => {
  const { user } = req;
  const { invoiceId } = req.params;

  if (!user || !invoiceId) {
    return res.sendStatus(400);
  }

  const deleted = await deleteInvoiceById(user, invoiceId);
  if (!deleted) {
    return res.sendStatus(404);
  }

  return res.sendStatus(204);
};

export const putInvoiceByIdHandler = async (
  req: Request<EditInvoiceInput['params'], object, EditInvoiceInput['body']>,
  res: Response
) => {
  const { user, body } = req;
  const { invoiceId } = req.params;

  if (!user) {
    return res.sendStatus(400);
  }

  const data = {
    ...body,
    // customer: new Types.ObjectId(body.customer),
    user: user.id,
  };

  const edited = await editInvoiceById(user, invoiceId, data);

  if (!edited) {
    return res.sendStatus(404);
  }
  return res.json(edited);
};

