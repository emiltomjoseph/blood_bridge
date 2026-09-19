import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

export const getHealthStatus = async (_req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  
  try {
    // Perform lightweight DB connectivity ping
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      timestamp,
      database: 'connected',
    });
  } catch (error: any) {
    logger.error('Health check database connection test failed:', error?.message || error);

    res.status(503).json({
      status: 'error',
      timestamp,
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
};
