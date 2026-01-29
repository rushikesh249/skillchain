import { credentialRepository } from '../credentials/credential.repository';
import { ipfsService, CredentialNFTMetadata } from '../../services/ipfs/ipfs.service';
import { NotFoundError } from '../../shared/errors/AppError';

import { blockchainService } from '../../services/blockchain/blockchain.service';

interface VerifyResult {
    valid: boolean;
    hashMatch: boolean;
    certificateHash: string;
    ipfsCid: string;
    issuedAt: Date;
    credential: {
        credentialId: string;
        score: number;
        ipfsCid: string;
        ipfsUrl: string;
        blockchainTxHash: string | null;
        issuedAt: Date;
    };
    student: {
        name: string;
        email: string;
    };
    skill: {
        name: string;
        slug: string;
        description?: string;
    };
    metadata: CredentialNFTMetadata | null;
    certificate?: unknown;
}

export class VerifyService {
    async verifyCredential(credentialId: string): Promise<VerifyResult> {
        const credential = await credentialRepository.findByCredentialId(credentialId);

        if (!credential) {
            throw new NotFoundError('Credential not found');
        }



        const student = credential.studentId as unknown as { name: string; email: string };
        const skill = credential.skillId as unknown as {
            name: string;
            slug: string;
            description?: string;
        };

        // Try to fetch NFT metadata from IPFS
        let metadata: CredentialNFTMetadata | null = null;
        let certificate: unknown = null;
        let recalculateHash = '';
        let hashMatch = false;

        try {
            metadata = await ipfsService.fetchMetadata(credential.ipfsUrl);
            certificate = metadata; // Use the fetched metadata as the certificate payload

            // Recalculate Hash
            if (metadata) {
                recalculateHash = blockchainService.calculateHash(metadata);
            }

            // Compare Hash
            hashMatch = recalculateHash === credential.certificateHash;

        } catch (err) {
            // Verify continues even if IPFS fails, but hashMatch will be false
            if (err instanceof Error) {
                // Use logger here if needed or just silent
            }
        }

        return {
            valid: true,
            hashMatch,
            certificateHash: credential.certificateHash,
            ipfsCid: credential.ipfsCid,
            issuedAt: credential.issuedAt,
            credential: {
                credentialId: credential.credentialId,
                score: credential.score,
                ipfsCid: credential.ipfsCid,
                ipfsUrl: credential.ipfsUrl,
                blockchainTxHash: credential.blockchainTxHash,
                issuedAt: credential.issuedAt,
            },
            student: {
                name: student.name,
                email: student.email,
            },
            skill: {
                name: skill.name,
                slug: skill.slug,
                description: skill.description,
            },
            metadata,
            certificate
        };
    }
}

export const verifyService = new VerifyService();
