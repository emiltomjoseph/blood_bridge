import { z } from 'zod';
import { BloodGroup, AvailabilityStatus } from '@prisma/client';

export const createDonorProfileSchema = z.object({
  body: z.object({
    bloodGroup: z.nativeEnum(BloodGroup, { errorMap: () => ({ message: 'Invalid blood group enum' }) }),
    dateOfBirth: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    lastDonationDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  }),
});

export const updateDonorProfileSchema = z.object({
  body: z.object({
    bloodGroup: z.nativeEnum(BloodGroup).optional(),
    dateOfBirth: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    lastDonationDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    availabilityStatus: z.nativeEnum(AvailabilityStatus, {
      errorMap: () => ({ message: 'availabilityStatus must be AVAILABLE, UNAVAILABLE, or PAUSED' }),
    }),
  }),
});
