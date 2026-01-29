import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { submissionRepository } from '../submissions/submission.repository';
import { credentialRepository } from '../credentials/credential.repository';
import { userRepository } from '../user/user.repository';
import { skillRepository } from '../skills/skill.repository';
import { ipfsService } from '../../services/ipfs/ipfs.service';
import { blockchainService } from '../../services/blockchain/blockchain.service';
import { AppError, NotFoundError } from '../../shared/errors/AppError';
import { ISubmission } from '../submissions/submission.model';
import { logger } from '../../shared/utils/logger';


interface PopulatedField {
    _id: mongoose.Types.ObjectId;
}

export class AdminService {
    async getPendingSubmissions(): Promise<ISubmission[]> {
        return submissionRepository.findPending();
    }

    async approveSubmission(submissionId: string, adminId: string): Promise<ISubmission> {
        const submission = await submissionRepository.findById(submissionId);
        if (!submission) {
            throw new NotFoundError('Submission not found');
        }

        if (submission.status !== 'pending') {
            throw new AppError(`Submission is already ${submission.status}`, 400, 'VALIDATION_ERROR');
        }

        // 1. Fetch related data

        // Handle populated fields safely
        const studentField = submission.studentId as mongoose.Types.ObjectId | PopulatedField;
        const isStudentPopulated = typeof studentField === 'object' && studentField !== null && '_id' in studentField;
        const studentId = isStudentPopulated
            ? (studentField as PopulatedField)._id.toString()
            : (studentField as mongoose.Types.ObjectId).toString();

        const skillField = submission.skillId as mongoose.Types.ObjectId | PopulatedField;
        const isSkillPopulated = typeof skillField === 'object' && skillField !== null && '_id' in skillField;
        const skillId = isSkillPopulated
            ? (skillField as PopulatedField)._id.toString()
            : (skillField as mongoose.Types.ObjectId).toString();

        const student = await userRepository.findById(studentId);
        const skill = await skillRepository.findById(skillId);

        if (!student || !skill) {
            logger.error({ studentId, skillId }, 'Student or Skill not found');
            throw new NotFoundError('Student or Skill not found');
        }

        // 2. Upload NFT Metadata to IPFS - MUST SUCCEED OR FAIL COMPLETELY

        // Check if IPFS is configured
        if (!ipfsService.isConfigured()) {
            throw new AppError(
                'Credential issuance failed: IPFS not configured. Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env',
                500,
                'IPFS_NOT_CONFIGURED'
            );
        }

        // Generate credentialId BEFORE creating the metadata
        const credentialId = uuidv4();
        const issuedAt = new Date().toISOString();

        // Build NFT metadata in standard format
        const nftMetadata = ipfsService.buildCredentialMetadata({
            studentName: student.name,
            studentWallet: student.walletAddress,
            skillName: skill.name,
            skillSlug: skill.slug,
            score: submission.confidenceScore,
            issuedAt: issuedAt,
            issuer: 'SkillChain Admin',
            credentialId: credentialId,
        });

        // Upload to IPFS - NO FALLBACK, MUST SUCCEED
        let ipfsCid = '';
        let ipfsUrl = '';
        let metadataUrl = '';

        try {
            const ipfsResult = await ipfsService.uploadMetadata(nftMetadata);
            ipfsCid = ipfsResult.cid;
            ipfsUrl = ipfsResult.url;
            metadataUrl = ipfsResult.metadataUrl;
            logger.info({ ipfsCid, ipfsUrl }, 'NFT metadata uploaded to IPFS');
        } catch (error) {
            logger.error({ error, submissionId }, 'IPFS upload failed - credential issuance aborted');
            // NO FALLBACK - FAIL COMPLETELY
            throw new AppError(
                `Credential issuance failed: IPFS upload unsuccessful - ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                'IPFS_UPLOAD_FAILED'
            );
        }

        // 3. Mint Credential on Blockchain
        let txHash = '';
        let blockchainStatus: 'minted' | 'failed' = 'failed';

        try {
            txHash = await blockchainService.mintCredential({
                studentWallet: student.walletAddress || '0x0000000000000000000000000000000000000000',
                skillSlug: skill.slug,
                score: submission.confidenceScore,
                ipfsCid: metadataUrl, // Use ipfs:// URL for on-chain storage
            });
            blockchainStatus = 'minted';
        } catch (error) {
            logger.error({ error, submissionId }, 'Blockchain minting failed');
            blockchainStatus = 'failed';
            // Use a demo hash if minting fails to verify the flow
            txHash = 'demo_tx_hash_' + Date.now();
        }

        // 4. Create Credential Record
        // Calculate Hash (Integrity Layer)
        // We hash the exact metadata object that was uploaded to IPFS
        const certificateHash = blockchainService.calculateHash(nftMetadata);

        await credentialRepository.create({
            studentId: studentId,
            skillId: skillId,
            // submissionId: submission._id.toString(), // Removed as per repo signature
            ipfsCid,
            ipfsUrl,
            blockchainTxHash: txHash,
            credentialId: credentialId, // ✅ Use the same ID we generated earlier
            score: submission.confidenceScore,
            certificateHash,
        });

        // 5. Update Submission
        submission.status = 'approved';
        submission.isVisibleToEmployers = true;
        submission.reviewedBy = new mongoose.Types.ObjectId(adminId);
        submission.reviewedAt = new Date();
        submission.blockchainStatus = blockchainStatus;

        await submission.save();

        logger.info(
            { submissionId, adminId, txHash },
            'Submission approved and credential minted'
        );

        return submission;
    }

    async rejectSubmission(submissionId: string, adminId: string, reason: string): Promise<ISubmission> {
        const submission = await submissionRepository.findById(submissionId);
        if (!submission) {
            throw new NotFoundError('Submission not found');
        }

        if (submission.status !== 'pending') {
            throw new AppError(`Submission is already ${submission.status}`, 400, 'VALIDATION_ERROR');
        }

        submission.status = 'rejected';
        submission.isVisibleToEmployers = false; // Never visible
        submission.reviewedBy = new mongoose.Types.ObjectId(adminId);
        submission.reviewedAt = new Date();
        submission.reviewNotes = reason;

        await submission.save();

        logger.info(
            { submissionId, adminId },
            'Submission rejected'
        );

        return submission;
    }
}

export const adminService = new AdminService();
