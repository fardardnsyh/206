import { Router } from 'express';
import { createUserHandler } from '../controllers/user.controller';
import { createUserSchema } from '../schemas/user.schema';
import validate from '../middleware/requestValidator';

const router = Router();

router.post('/', validate(createUserSchema), createUserHandler);

export default router;
