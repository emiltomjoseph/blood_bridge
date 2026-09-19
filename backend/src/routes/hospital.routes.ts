import { Router } from 'express';
import {
  createHospitalProfile,
  getMyHospitalProfile,
  getHospitalById,
  updateMyHospitalProfile,
} from '../controllers/hospital.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createHospitalProfileSchema,
  updateHospitalProfileSchema,
} from '../validators/hospital.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  validateRequest(createHospitalProfileSchema),
  createHospitalProfile
);

router.get('/me', authenticate, getMyHospitalProfile);
router.get('/:id', authenticate, getHospitalById);

router.patch(
  '/me',
  authenticate,
  requireRole('HOSPITAL', 'ADMIN'),
  validateRequest(updateHospitalProfileSchema),
  updateMyHospitalProfile
);

export default router;
