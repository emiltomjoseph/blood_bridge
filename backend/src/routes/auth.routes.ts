import { Router } from 'express';
import { syncUser, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { syncUserSchema } from '../validators/auth.validator';

const router = Router();

router.post('/sync', authenticate, validateRequest(syncUserSchema), syncUser);
router.get('/me', authenticate, getMe);

export default router;
