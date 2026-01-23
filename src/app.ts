import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { logger } from './shared/utils/logger';

import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { generalRateLimiter } from './middlewares/rateLimiter.middleware';

import authRoutes from './modules/auth/auth.routes';
import skillRoutes from './modules/skills/skill.routes';
import submissionRoutes from './modules/submissions/submission.routes';
import credentialRoutes from './modules/credentials/credential.routes';
import employerRoutes from './modules/employer/employer.routes';
import adminRoutes from './modules/admin/admin.routes';
import verifyRoutes from './modules/verify/verify.routes';

export const createApp = (): Application => {
    const app = express();

    // Trust proxy for rate limiting behind reverse proxy
    app.set('trust proxy', 1);

    // Request ID middleware (first)
    app.use(requestIdMiddleware);

    // Security middlewares
    app.use(helmet());
    app.use(
        cors({
            origin: env.CORS_ORIGINS,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
        })
    );

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    if (env.NODE_ENV !== 'test') {
        app.use(
            pinoHttp({
                logger,
                customProps: (req: Request) => ({
                    requestId: req.requestId,
                }),
                customLogLevel: (_req, res) => {
                    if (res.statusCode >= 500) return 'error';
                    if (res.statusCode >= 400) return 'warn';
                    return 'info';
                },
                customSuccessMessage: (req, res) => {
                    return `${req.method} ${req.url} ${res.statusCode}`;
                },
                customErrorMessage: (req, res) => {
                    return `${req.method} ${req.url} ${res.statusCode}`;
                },
            })
        );
    }

    // General rate limiting
    app.use(generalRateLimiter);

    /**
     * @swagger
     * /api/health:
     *   get:
     *     summary: Health check endpoint
     *     tags: [System]
     *     responses:
     *       200:
     *         description: Server is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: OK
     *                 data:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       example: healthy
     *                     uptime:
     *                       type: number
     *                     timestamp:
     *                       type: string
     *                       format: date-time
     */
    app.get('/api/health', (_req: Request, res: Response) => {
        res.json({
            success: true,
            message: 'OK',
            data: {
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    });

    // Swagger documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req: Request, res: Response) => {
        res.json(swaggerSpec);
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/skills', skillRoutes);
    app.use('/api/submissions', submissionRoutes);
    app.use('/api/credentials', credentialRoutes);
    app.use('/api/employer', employerRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/verify', verifyRoutes);

    // 404 handler
    app.use((_req: Request, res: Response) => {
        res.status(404).json({
            success: false,
            message: 'Route not found',
            error: {
                code: 'NOT_FOUND',
            },
        });
    });

    // Error handler (must be last)
    app.use(errorMiddleware);

    return app;
};
