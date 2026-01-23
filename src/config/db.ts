import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../shared/utils/logger';

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info({ host: conn.connection.host }, 'MongoDB connected successfully');
    } catch (error) {
        if (error instanceof Error) {
            logger.error({ error: error.message, stack: error.stack }, 'MongoDB connection failed');
        } else {
            logger.error({ error }, 'MongoDB connection failed with unknown error');
        }
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error({ error: err }, 'MongoDB error');
});

export const disconnectDB = async (): Promise<void> => {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
};
