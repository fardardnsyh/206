import { Router } from 'express';

import {
  createInvoiceHandler,
  deleteInvoiceHandler,
  getInvoicesHandler,
  getSingleInvoiceHandler,
  putInvoiceByIdHandler,
} from '../controllers/invoice.controller';
import validate from '../middleware/requestValidator';
import {
  createInvoiceSchema,
  deleteInvoiceSchema,
  editInvoiceSchema,
  getInvoiceByIdSchema,
} from '../schemas/invoice.schema';
import { authUser } from '../middleware/authUser';

const router = Router();

router.get('/', authUser, getInvoicesHandler);
router.get(
  '/:invoiceId',
  authUser,
  validate(getInvoiceByIdSchema),
  getSingleInvoiceHandler
);
router.post('/', authUser, validate(createInvoiceSchema), createInvoiceHandler);
router.delete(
  '/:invoiceId',
  authUser,
  validate(deleteInvoiceSchema),
  deleteInvoiceHandler
);
// TODO: replace .deepPartial with a a different partial invoice Schema just for edits,
// also think about how to handle editing the item subdocuments - it may be that I have to replace the whole array,
// check how this is actually working in mongoose / returning json
router.put(
  '/:invoiceId',
  authUser,
  validate(editInvoiceSchema),
  putInvoiceByIdHandler
);

export default router;

