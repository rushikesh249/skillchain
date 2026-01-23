import { Router } from 'express';
import { verifyController } from './verify.controller';

const router = Router();

/**
 * @swagger
 * /api/verify/{credentialId}:
 *   get:
 *     summary: Verify a credential (Public)
 *     description: |
 *       Public endpoint to verify a credential by its unique ID.
 *       Returns full proof including student info, skill, IPFS data, and blockchain tx.
 *     tags: [Verify]
 *     parameters:
 *       - in: path
 *         name: credentialId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Credential public ID (UUID)
 *     responses:
 *       200:
 *         description: Credential verified successfully
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
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     credential:
 *                       type: object
 *                       properties:
 *                         credentialId:
 *                           type: string
 *                         score:
 *                           type: number
 *                         ipfsCid:
 *                           type: string
 *                         ipfsUrl:
 *                           type: string
 *                         blockchainTxHash:
 *                           type: string
 *                         issuedAt:
 *                           type: string
 *                           format: date-time
 *                     student:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     skill:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         slug:
 *                           type: string
 *                         description:
 *                           type: string
 *                     certificate:
 *                       type: object
 *                       nullable: true
 *                       description: Certificate payload from IPFS (if available)
 *       404:
 *         description: Credential not found
 */
router.get('/:credentialId', verifyController.verifyCredential.bind(verifyController));

export default router;
