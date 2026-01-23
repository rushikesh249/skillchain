import { Router } from 'express';
import { adminController } from './admin.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validateParams } from '../../middlewares/validate.middleware';
import { submissionIdSchema } from './admin.schema';

const router = Router();

/**
 * @swagger
 * /api/admin/submissions/pending:
 *   get:
 *     summary: Get all pending submissions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an admin
 */
router.get(
    '/submissions/pending',
    authMiddleware,
    requireRole('admin'),
    adminController.getPendingSubmissions.bind(adminController)
);

/**
 * @swagger
 * /api/admin/submissions/{id}/approve:
 *   post:
 *     summary: Approve a submission and issue credential (Admin only)
 *     description: |
 *       Approves the submission if confidence score >= 70.
 *       Pipeline:
 *       1. Generates certificate JSON
 *       2. Uploads to IPFS
 *       3. Mints SBT on blockchain (or stub)
 *       4. Creates Credential record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       201:
 *         description: Submission approved and credential issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Credential'
 *       400:
 *         description: Validation error (already processed or below threshold)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an admin
 *       404:
 *         description: Submission not found
 */
router.post(
    '/submissions/:id/approve',
    authMiddleware,
    requireRole('admin'),
    validateParams(submissionIdSchema),
    adminController.approveSubmission.bind(adminController)
);

/**
 * @swagger
 * /api/admin/submissions/{id}/reject:
 *   post:
 *     summary: Reject a submission (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Validation error (already processed)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an admin
 *       404:
 *         description: Submission not found
 */
router.post(
    '/submissions/:id/reject',
    authMiddleware,
    requireRole('admin'),
    validateParams(submissionIdSchema),
    adminController.rejectSubmission.bind(adminController)
);

export default router;
