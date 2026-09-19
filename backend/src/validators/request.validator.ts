import { z } from 'zod';
import { BloodGroup, UrgencyLevel, RequestStatus } from '@prisma/client';

export const createBloodRequestSchema = z.object({
  body: z.object({
    bloodGroup: z.nativeEnum(BloodGroup, { errorMap: () => ({ message: 'Valid blood group is required' }) }),
    unitsRequired: z.number().int().positive('Units required must be at least 1'),
    urgency: z.nativeEnum(UrgencyLevel).default(UrgencyLevel.URGENT),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    requiredBy: z.string().transform((val) => new Date(val)),
    notes: z.string().optional(),
  }),
});

export const updateBloodRequestSchema = z.object({
  body: z.object({
    bloodGroup: z.nativeEnum(BloodGroup).optional(),
    unitsRequired: z.number().int().positive().optional(),
    urgency: z.nativeEnum(UrgencyLevel).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    requiredBy: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    notes: z.string().optional(),
  }),
});

export const updateRequestStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(RequestStatus, { errorMap: () => ({ message: 'Valid RequestStatus is required' }) }),
  }),
});

export const queryBloodRequestsSchema = z.object({
  query: z.object({
    bloodGroup: z.nativeEnum(BloodGroup).optional(),
    urgency: z.nativeEnum(UrgencyLevel).optional(),
    status: z.nativeEnum(RequestStatus).optional(),
    district: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  }),
});
