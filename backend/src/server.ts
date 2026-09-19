import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/prisma';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 BloodBridge API Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down HTTP server and Prisma client...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTP server closed and Prisma client disconnected.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
