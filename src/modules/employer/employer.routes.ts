import { Router } from 'express';
import { employerController } from './employer.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { searchCandidatesSchema, unlockStudentSchema } from './employer.schema';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/employer/search:
 *   get:
 *     summary: Search verified candidates (Employer only)
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skillSlug
 *         schema:
 *           type: string
 *         description: Filter by skill slug
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         description: Minimum confidence score
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Candidates retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           student:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           skill:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                           score:
 *                             type: number
 *                           credentialId:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an employer
 */
router.get(
    '/search',
    authMiddleware,
    requireRole('employer'),
    validateQuery(searchCandidatesSchema),
    asyncHandler(employerController.searchCandidates.bind(employerController))
);

/**
 * @swagger
 * /api/employer/unlock/{studentId}:
 *   post:
 *     summary: Unlock a student profile (Employer only, costs 1 credit)
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID to unlock
 *     responses:
 *       200:
 *         description: Profile unlocked successfully
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
 *                   type: object
 *                   properties:
 *                     student:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         walletAddress:
 *                           type: string
 *                     credentials:
 *                       type: array
 *                       items:
 *                         type: object
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       402:
 *         description: Insufficient credits
 *       403:
 *         description: Forbidden - not an employer
 *       404:
 *         description: Student not found
 */
router.post(
    '/unlock/:studentId',
    authMiddleware,
    requireRole('employer'),
    validateParams(unlockStudentSchema),
    asyncHandler(employerController.unlockStudent.bind(employerController))
);

/**
 * @swagger
 * /api/employer/unlocks:
 *   get:
 *     summary: Get all unlocked profiles (Employer only)
 *     tags: [Employer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unlocks retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       employerId:
 *                         type: string
 *                       studentId:
 *                         type: object
 *                       skillId:
 *                         type: object
 *                       unlockedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not an employer
 */
router.get(
    '/unlocks',
    authMiddleware,
    requireRole('employer'),
    asyncHandler(employerController.getUnlocks.bind(employerController))
);

export default router;
