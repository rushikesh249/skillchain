import { v4 as uuidv4 } from 'uuid';
import { submissionRepository } from '../submissions/submission.repository';
import { credentialRepository } from '../credentials/credential.repository';
import { userRepository } from '../user/user.repository';
import { skillRepository } from '../skills/skill.repository';
import { ipfsService } from '../../services/ipfs/ipfs.service';
import { blockchainService } from '../../services/blockchain/blockchain.service';
import { AppError, NotFoundError } from '../../shared/errors/AppError';
import { CertificatePayload } from '../../shared/types';
import { ISubmission } from '../submissions/submission.model';
import { ICredential } from '../credentials/credential.model';
import { logger } from '../../shared/utils/logger';

const CONFIDENCE_THRESHOLD = 70;

interface PopulatedDocument {
    _id: string;
}

export class AdminService {
    async getPendingSubmissions(): Promise<ISubmission[]> {
        return submissionRepository.findPending();
    }

    async approveSubmission(submissionId: string): Promise<ICredential> {
        // Fetch submission with populated data
        const submission = await submissionRepository.findById(submissionId);
        if (!submission) {
            throw new NotFoundError('Submission not found');
        }

        if (submission.status !== 'pending') {
            throw new AppError(`Submission is already ${submission.status}`, 400, 'VALIDATION_ERROR');
        }

        if (submission.confidenceScore < CONFIDENCE_THRESHOLD) {
            throw new AppError(
                `Confidence score (${submission.confidenceScore}) is below threshold (${CONFIDENCE_THRESHOLD})`,
                400,
                'VALIDATION_ERROR'
            );
        }

        // Safely extract IDs (handle populated vs unpopulated fields)
        const studentId =
            (submission.studentId as unknown as PopulatedDocument)._id || submission.studentId;
        const skillId = (submission.skillId as unknown as PopulatedDocument)._id || submission.skillId;

        // Get student and skill details
        const student = await userRepository.findById(studentId.toString());
        const skill = await skillRepository.findById(skillId.toString());

        if (!student || !skill) {
            throw new NotFoundError('Student or Skill not found');
        }

        // Generate credential ID
        const credentialId = uuidv4();

        // Generate certificate payload
        const certificatePayload: CertificatePayload = {
            credentialId,
            studentName: student.name,
            studentEmail: student.email,
            skillName: skill.name,
            githubRepoUrl: submission.githubRepoUrl,
            demoUrl: submission.demoUrl,
            confidenceScore: submission.confidenceScore,
            flags: submission.flags,
            issuedAt: new Date().toISOString(),
            issuer: 'SkillChain',
        };

        logger.info({ credentialId, studentId: student._id }, 'Starting credential issuance pipeline');

        // Upload to IPFS
        const { cid, url } = await ipfsService.uploadCertificate(certificatePayload);

        logger.info({ credentialId, cid }, 'Certificate uploaded to IPFS');

        // Mint on blockchain
        let txHash: string | null = null;
        if (student.walletAddress) {
            txHash = await blockchainService.mintCredential({
                studentWallet: student.walletAddress,
                skillSlug: skill.slug,
                score: submission.confidenceScore,
                ipfsCid: cid,
            });
            logger.info({ credentialId, txHash }, 'Credential minted on blockchain');
        } else {
            txHash = `demo_tx_hash_${Date.now()}_no_wallet`;
            logger.info({ credentialId }, 'No wallet address, skipping blockchain mint');
        }

        // Update submission status
        await submissionRepository.updateStatus(submissionId, 'verified');

        // Create credential
        const credential = await credentialRepository.create({
            studentId: student._id.toString(),
            skillId: skill._id.toString(),
            score: submission.confidenceScore,
            ipfsCid: cid,
            ipfsUrl: url,
            blockchainTxHash: txHash,
            credentialId,
        });

        logger.info(
            { credentialId, studentId: student._id, skillId: skill._id },
            'Credential created successfully'
        );

        return credential;
    }

    async rejectSubmission(submissionId: string): Promise<ISubmission> {
        const submission = await submissionRepository.findById(submissionId);
        if (!submission) {
            throw new NotFoundError('Submission not found');
        }

        if (submission.status !== 'pending') {
            throw new AppError(`Submission is already ${submission.status}`, 400, 'VALIDATION_ERROR');
        }

        await submissionRepository.updateStatus(submissionId, 'rejected');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return (await submissionRepository.findById(submissionId))!;
    }
}

export const adminService = new AdminService();
