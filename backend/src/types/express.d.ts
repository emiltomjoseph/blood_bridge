import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string; // Supabase Auth UID
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  donorId?: string;
  hospitalId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
