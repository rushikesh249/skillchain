import pino from 'pino';
import { env } from '../../config/env';

export const logger = pino({
    level: env.NODE_ENV === 'test' ? 'silent' : 'info',
    transport:
        env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            }
            : undefined,
    base: {
        env: env.NODE_ENV,
    },
    formatters: {
        level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

export const createChildLogger = (requestId: string) => {
    return logger.child({ requestId });
};
