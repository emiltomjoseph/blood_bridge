import { z } from 'zod';

export const createHospitalProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Hospital name is required'),
    address: z.string().min(5, 'Hospital address is required'),
    district: z.string().min(2, 'District is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    phone: z.string().optional(),
  }),
});

export const updateHospitalProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    district: z.string().min(2).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    phone: z.string().optional(),
  }),
});
