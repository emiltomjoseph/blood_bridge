import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const syncUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    role: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Role must be DONOR, HOSPITAL, or ADMIN' }) }),
  }),
});
