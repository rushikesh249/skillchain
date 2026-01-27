import { credentialRepository } from '../credentials/credential.repository';
import { ipfsService, CredentialNFTMetadata } from '../../services/ipfs/ipfs.service';
import { NotFoundError } from '../../shared/errors/AppError';

interface VerifyResult {
    valid: boolean;
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
}

export class VerifyService {
    async verifyCredential(credentialId: string): Promise<VerifyResult> {
        const credential = await credentialRepository.findByCredentialId(credentialId);

        if (!credential) {
            throw new NotFoundError('Credential not found');
        }

        console.log('[DEBUG] VerifyService fetched credential:', JSON.stringify(credential, null, 2));

        const student = credential.studentId as unknown as { name: string; email: string };
        const skill = credential.skillId as unknown as {
            name: string;
            slug: string;
            description?: string;
        };

        // Try to fetch NFT metadata from IPFS
        let metadata: CredentialNFTMetadata | null = null;
        try {
            metadata = await ipfsService.fetchMetadata(credential.ipfsUrl);
        } catch {
            // IPFS fetch failed, metadata will be null
        }

        return {
            valid: true,
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
        };
    }
}

export const verifyService = new VerifyService();
