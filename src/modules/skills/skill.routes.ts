import { Router } from 'express';
import { skillController } from './skill.controller';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Get all available skills
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: List of skills retrieved successfully
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
 *                     $ref: '#/components/schemas/Skill'
 */
router.get('/', asyncHandler(skillController.getAllSkills.bind(skillController)));

export default router;
