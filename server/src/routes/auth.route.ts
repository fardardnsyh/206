import { Router } from 'express';
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
} from '../controllers/auth.controller';
import { loginSchema } from '../schemas/auth.schema';
import validate from '../middleware/requestValidator';

const router = Router();

router.post('/login', validate(loginSchema), loginHandler);
router.get('/refresh', refreshHandler);
router.get('/logout', logoutHandler);

export default router;

