import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { logger } from '../shared/utils/logger';
import { env } from '../config/env';

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const requestId = req.requestId || 'unknown';

    if (err instanceof AppError) {
        logger.error(
            {
                requestId,
                error: err.message,
                code: err.code,
                statusCode: err.statusCode,
                stack: env.NODE_ENV === 'development' ? err.stack : undefined,
            },
            'Application error'
        );

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                code: err.code,
                details: err.details,
                ...(env.NODE_ENV === 'development' && { stack: err.stack }),
            },
        });
        return;
    }

    // Unexpected errors
    logger.error(
        {
            requestId,
            error: err.message,
            stack: err.stack,
        },
        'Unexpected error'
    );

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: {
            code: 'INTERNAL_ERROR',
            ...(env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};
