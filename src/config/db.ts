import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../shared/utils/logger';

export const connectDB = async (retries = 3): Promise<void> => {
    while (retries > 0) {
        try {
            await mongoose.connect(env.MONGODB_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            logger.info('MongoDB connected successfully');
            return;
        } catch (error) {
            retries -= 1;
            logger.warn(`MongoDB connection failed. Retries left: ${retries}`);
            if (retries === 0) {
                if (error instanceof Error) {
                    logger.error({ error: error.message, stack: error.stack }, 'MongoDB connection failed after retries');
                } else {
                    logger.error({ error: String(error) }, 'MongoDB connection failed with unknown error');
                }
                process.exit(1);
            }
            // Wait 5 seconds before retrying
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
    logger.error({ error: err.message }, 'MongoDB error');
});

export const disconnectDB = async (): Promise<void> => {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
};
