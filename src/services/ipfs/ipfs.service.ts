import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

/**
 * NFT Metadata format for credential
 */
export interface CredentialNFTMetadata {
    name: string;
    description: string;
    image?: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

/**
 * Result of IPFS upload
 */
export interface IpfsUploadResult {
    cid: string;
    url: string;
    metadataUrl: string;
}

/**
 * IPFS Service using Pinata for REAL uploads
 * NO STUB/FAKE CIDs - fails if upload fails
 */

interface PinataUploadResponse {
    IpfsHash: string;
}

export class IpfsService {
    private apiKey: string | undefined;
    private secretApiKey: string | undefined;
    private gateway: string;

    constructor() {
        this.apiKey = env.PINATA_API_KEY;
        this.secretApiKey = env.PINATA_SECRET_API_KEY;
        this.gateway = env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

        if (this.apiKey && this.secretApiKey) {
            logger.info('Pinata IPFS client initialized');
        } else {
            logger.warn('Pinata API keys not configured - IPFS uploads will fail');
        }
    }

    /**
     * Check if IPFS (Pinata) is properly configured
     */
    isConfigured(): boolean {
        return !!(this.apiKey && this.secretApiKey);
    }

    /**
     * Upload credential metadata to IPFS via Pinata
     * @throws Error if upload fails - NO FALLBACK
     */
    async uploadMetadata(metadata: CredentialNFTMetadata): Promise<IpfsUploadResult> {

        if (!this.apiKey || !this.secretApiKey) {
            throw new Error('Pinata API keys are not configured. Check PINATA_API_KEY and PINATA_SECRET_API_KEY in .env');
        }

        try {
            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                metadata,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretApiKey,
                    },
                    timeout: 30000,
                }
            );

            const responseData = response.data as PinataUploadResponse;

            if (!responseData || !responseData.IpfsHash) {
                logger.error({ data: responseData }, '[IPFS] ERROR: No IpfsHash in response');
                throw new Error('IPFS upload failed: No CID returned from Pinata');
            }

            const cid = responseData.IpfsHash;

            // Validate CID format (Basic check)
            if (typeof cid !== 'string' || cid.length < 10) {
                throw new Error(`Invalid CID returned from Pinata: ${cid}`);
            }

            // Force the gateway URL format to ensure no protocol issues
            const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
            const metadataUrl = `ipfs://${cid}`;

            logger.info({ cid, url }, 'Metadata uploaded to IPFS via Pinata successfully');

            return {
                cid,
                url,
                metadataUrl,
            };
        } catch (error) {
            logger.error({ error }, 'Failed to upload metadata to Pinata IPFS');

            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data as { error?: string } | undefined;
                const message = errorData?.error || error.message;
                throw new Error(`Credential issuance failed: IPFS upload unsuccessful - ${message}`);
            }

            throw new Error(`Credential issuance failed: IPFS upload unsuccessful - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Build NFT metadata from credential data
     */
    buildCredentialMetadata(data: {
        studentName: string;
        studentWallet?: string;
        skillName: string;
        skillSlug: string;
        score: number;
        issuedAt: string;
        issuer: string;
        credentialId: string;
    }): CredentialNFTMetadata {
        const attributes = [
            { trait_type: 'Student', value: data.studentName },
            { trait_type: 'Skill', value: data.skillSlug },
            { trait_type: 'Score', value: data.score },
            { trait_type: 'Issued At', value: data.issuedAt },
            { trait_type: 'Issuer', value: data.issuer },
            { trait_type: 'Credential ID', value: data.credentialId },
        ];

        if (data.studentWallet) {
            attributes.push({ trait_type: 'Student Wallet', value: data.studentWallet });
        }

        return {
            name: `${data.skillName} Credential`,
            description: `This NFT certifies that ${data.studentName} has demonstrated proficiency in ${data.skillName}. Issued by ${data.issuer} on ${new Date(data.issuedAt).toLocaleDateString()}.`,
            attributes,
        };
    }

    /**
     * Fetch metadata from IPFS via Pinata gateway
     */
    async fetchMetadata(ipfsUrl: string): Promise<CredentialNFTMetadata | null> {
        try {
            // Convert ipfs:// URL to HTTP gateway URL if needed
            let httpUrl = ipfsUrl;
            if (ipfsUrl.startsWith('ipfs://')) {
                const cid = ipfsUrl.replace('ipfs://', '');
                httpUrl = `${this.gateway}/${cid}`;
            }

            const response = await axios.get<CredentialNFTMetadata>(httpUrl, {
                timeout: 15000
            });
            return response.data;
        } catch (error) {
            logger.error({ error, ipfsUrl }, 'Failed to fetch metadata from IPFS');
            return null;
        }
    }
}

export const ipfsService = new IpfsService();
