import { Router } from 'express';

import {
  deleteCustomerHandler,
  getCustomersHandler,
  getSingleCustomerHandler,
  createCustomerHandler,
  putCustomerByIdHandler,
} from '../controllers/customer.controller';
import validate from '../middleware/requestValidator';
import {
  createCustomerSchema,
  deleteCustomerSchema,
  editCustomerSchema,
  getSingleCustomerSchema,
} from '../schemas/customer.schema';
import { authUser } from '../middleware/authUser';

const router = Router();

router.get('/', authUser, getCustomersHandler);
router.get(
  '/:customerId',
  authUser,
  validate(getSingleCustomerSchema),
  getSingleCustomerHandler
);
router.post(
  '/',
  authUser,
  validate(createCustomerSchema),
  createCustomerHandler
);
router.delete(
  '/:customerId',
  authUser,
  validate(deleteCustomerSchema),
  deleteCustomerHandler
);
router.put(
  '/:customerId',
  authUser,
  validate(editCustomerSchema),
  putCustomerByIdHandler
);

export default router;

