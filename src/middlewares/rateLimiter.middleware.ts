import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Create raw limiters
const _authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    },
});

const _generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ✅ Wrap them to disable during test runs
export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === 'test') return next();
    return _authLimiter(req, res, next);
};

export const generalRateLimiter = (req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === 'test') return next();
    return _generalLimiter(req, res, next);
};
