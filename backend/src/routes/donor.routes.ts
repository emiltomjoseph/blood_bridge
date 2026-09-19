import { Router } from 'express';
import {
  createDonorProfile,
  getMyDonorProfile,
  getDonorById,
  updateMyDonorProfile,
  updateMyAvailability,
} from '../controllers/donor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createDonorProfileSchema,
  updateDonorProfileSchema,
  updateAvailabilitySchema,
} from '../validators/donor.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('DONOR', 'ADMIN'),
  validateRequest(createDonorProfileSchema),
  createDonorProfile
);

router.get('/me', authenticate, getMyDonorProfile);
router.get('/:id', authenticate, getDonorById);

router.patch(
  '/me',
  authenticate,
  requireRole('DONOR', 'ADMIN'),
  validateRequest(updateDonorProfileSchema),
  updateMyDonorProfile
);

router.patch(
  '/me/availability',
  authenticate,
  requireRole('DONOR', 'ADMIN'),
  validateRequest(updateAvailabilitySchema),
  updateMyAvailability
);

export default router;
