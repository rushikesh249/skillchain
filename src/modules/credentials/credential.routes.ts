import { Router } from 'express';
import { credentialController } from './credential.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();

/**
 * @swagger
 * /api/credentials/my:
 *   get:
 *     summary: Get my credentials (Student only)
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credentials retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Credential'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a student
 */
router.get(
    '/my',
    authMiddleware,
    requireRole('student'),
    credentialController.getMyCredentials.bind(credentialController)
);

export default router;
