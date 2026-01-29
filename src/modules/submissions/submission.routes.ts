import { Router } from 'express';
import { submissionController } from './submission.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { createSubmissionSchema } from './submission.schema';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Create a new submission (Student only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubmissionRequest'
 *     responses:
 *       201:
 *         description: Submission created successfully
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
 *                   $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a student
 *       409:
 *         description: Already submitted for this skill
 */
router.post(
    '/',
    authMiddleware,
    requireRole('student'),
    validateBody(createSubmissionSchema),
    asyncHandler(submissionController.createSubmission.bind(submissionController))
);

/**
 * @swagger
 * /api/submissions/my:
 *   get:
 *     summary: Get my submissions (Student only)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
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
 *                     $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a student
 */
router.get(
    '/my',
    authMiddleware,
    requireRole('student'),
    asyncHandler(submissionController.getMySubmissions.bind(submissionController))
);

export default router;
