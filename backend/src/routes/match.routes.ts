import { Router } from 'express';
import { acceptMatch, rejectMatch } from '../controllers/matching.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/:id/accept', authenticate, requireRole('DONOR', 'ADMIN'), acceptMatch);
router.post('/:id/reject', authenticate, requireRole('DONOR', 'ADMIN'), rejectMatch);

export default router;
