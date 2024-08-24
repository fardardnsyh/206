import { Request, Response } from 'express';

import {
  createCustomer,
  deleteCustomerById,
  editCustomerById,
  getCustomers,
  getSingleCustomer,
} from '../services/customer.service';

import {
  CreateCustomerInput,
  DeleteCustomerInput,
  EditCustomerInput,
  GetSingleCustomerInput,
} from '../schemas/customer.schema';
import logger from '../utils/logger';

// import logger from '../utils/logger';

// TODO: remove ['body'] from CustomerInput as I don't think I will need to pass params also.
// TODO: refactor to bea separate function rather in the route e.g. routes will just have router.post('/', validate(customerSchea), handleCustomer)
// then define the handleCustomer RequestHandler in the contoller (not the api .get, .post etc.)
// TODO: custom error so I can handle sending the responses from the controller? e.g. for when there are no customers, or invoices (althogh maybe that is not an error)
// TODO: handle formatting error responses universally so they are uniform in shape. e.g. for mongoose errors when zod schema is parsed but mongoose schema fails (test by not requiring customer address in zod schema)

export const getCustomersHandler = async (req: Request, res: Response) => {
  const { user } = req;

  // if current user does not own the requested resource then return unauthorized
  // think I have put this in the auth middleware
  // if (user?.toString() !== req.params.userId) {
  //   return res.sendStatus(401);
  // }

  const customers = await getCustomers(user);

  return res.json(customers);
};

export const getSingleCustomerHandler = async (
  req: Request<GetSingleCustomerInput['params'], object, object>,
  res: Response
) => {
  const { user } = req;
  const { customerId } = req.params;

  // if current user does not own the requested resource then return unauthorized
  // think I have put this in the auth middleware
  // if (user?.toString() !== req.params.userId) {
  //   return res.sendStatus(401);
  // }

  const customer = await getSingleCustomer(user, customerId);
  logger.info(`getting singleCustomer ${JSON.stringify(customer)}`);

  if (!customer) {
    return res.sendStatus(404);
  }

  return res.json(customer);
};

// TODO: createCustomerHandler
export const createCustomerHandler = async (
  req: Request<object, object, CreateCustomerInput['body']>,
  res: Response
) => {
  const { user } = req;

  if (!user) {
    return res.sendStatus(400);
  }

  const data = {
    ...req.body,
    user: user._id,
  };
  const customer = await createCustomer(user, data);
  return res.status(201).json(customer);
};

export const deleteCustomerHandler = async (
  req: Request<DeleteCustomerInput['params'], object, object>,
  res: Response
) => {
  const { user } = req;
  const { customerId } = req.params;

  if (!user || !customerId) {
    return res.sendStatus(400);
  }
  const deleted = await deleteCustomerById(user, customerId);
  if (!deleted) {
    return res.sendStatus(404);
  }

  // Note: cannot send with status 204 (no content) AND the deleted json document
  return res.sendStatus(204);
};

export const putCustomerByIdHandler = async (
  req: Request<EditCustomerInput['params'], object, EditCustomerInput['body']>,
  res: Response
) => {
  const { user } = req;
  const { body } = req;
  const { customerId } = req.params;

  if (!user) {
    logger.info('putCustomer, User not found');
    return res.sendStatus(400);
  }

  const data = {
    ...body,
    user: user._id,
  };

  const edited = await editCustomerById(user, customerId, data);

  if (!edited) {
    return res.sendStatus(404);
  }

  return res.json(edited);
};

