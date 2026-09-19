import { Router } from 'express';
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  updateRequestStatus,
  deleteBloodRequest,
} from '../controllers/request.controller';
import { runMatchingForRequest, getMatchesForRequest } from '../controllers/matching.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createBloodRequestSchema,
  updateBloodRequestSchema,
  updateRequestStatusSchema,
  queryBloodRequestsSchema,
} from '../validators/request.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  validateRequest(createBloodRequestSchema),
  createBloodRequest
);

router.get('/', validateRequest(queryBloodRequestsSchema), getBloodRequests);
router.get('/:id', getBloodRequestById);

router.patch(
  '/:id',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  validateRequest(updateBloodRequestSchema),
  updateBloodRequest
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  validateRequest(updateRequestStatusSchema),
  updateRequestStatus
);

router.delete(
  '/:id',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  deleteBloodRequest
);

// Matching endpoints
router.post(
  '/:id/match',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  runMatchingForRequest
);

router.get(
  '/:id/matches',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  getMatchesForRequest
);

export default router;
