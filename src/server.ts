import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './shared/utils/logger';

const startServer = async (): Promise<void> => {
    try {
        // Connect to database
        await connectDB();

        // Create Express app
        const app = createApp();

        // Start server
        const server = app.listen(env.PORT, () => {
            logger.info(
                {
                    port: env.PORT,
                    env: env.NODE_ENV,
                    swagger: `http://localhost:${env.PORT}/api-docs`,
                },
                'Server started successfully'
            );
        });

        // Graceful shutdown
        const gracefulShutdown = (signal: string) => {
            logger.info({ signal }, 'Received shutdown signal');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });

            // Force close after 30 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
};

startServer().catch((error) => {
    logger.error({ error }, 'Unhandled error during startup');
    process.exit(1);
});
