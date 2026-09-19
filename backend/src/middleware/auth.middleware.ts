import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { UserRole } from '@prisma/client';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token missing or invalid format. Header format: Bearer <token>',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Development / Test / Demo token bypass for rapid portal login and integration testing
    if (token.startsWith('mock-token-')) {
      const mockRole = (req.headers['x-mock-role'] as UserRole) || (token.toLowerCase().includes('hosp') ? 'HOSPITAL' : 'DONOR');
      const mockUserId = token.replace('mock-token-', '');
      
      const dbUser = await prisma.user.findUnique({
        where: { id: mockUserId },
        include: { donor: true, hospital: true },
      });

      if (dbUser) {
        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          phone: dbUser.phone,
          role: dbUser.role,
          donorId: dbUser.donor?.id,
          hospitalId: dbUser.hospital?.id,
        };
      } else {
        req.user = {
          id: mockUserId,
          email: `${mockUserId}@bloodbridge.org`,
          name: 'BloodBridge User',
          role: mockRole,
        };
      }
      return next();
    }

    // Verify token via Supabase Auth
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        logger.warn('Supabase JWT token verification failed:', error?.message);
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired authentication token',
          },
        });
        return;
      }

      const supabaseUser = data.user;

      // Retrieve database user profile along with donor & hospital IDs
      const dbUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
        include: { donor: true, hospital: true },
      });

      if (dbUser) {
        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          phone: dbUser.phone,
          role: dbUser.role,
          donorId: dbUser.donor?.id,
          hospitalId: dbUser.hospital?.id,
        };
      } else {
        // Fallback for user created in Supabase but not yet synced to Prisma User table
        req.user = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: (supabaseUser.user_metadata?.name as string) || 'BloodBridge User',
          role: (supabaseUser.user_metadata?.role as UserRole) || 'DONOR',
        };
      }

      next();
    } catch (supabaseErr: any) {
      logger.warn('Supabase authentication client error:', supabaseErr?.message);
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token',
        },
      });
      return;
    }
  } catch (err: any) {
    logger.error('Authentication middleware exception:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while authenticating the request',
      },
    });
  }
};
