import axios from 'axios';
import { env } from '../../config/env';
import { CertificatePayload, IpfsUploadResult } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export class IpfsService {
    private isConfigured(): boolean {
        return !!env.IPFS_TOKEN;
    }

    async uploadCertificate(payload: CertificatePayload): Promise<IpfsUploadResult> {
        if (!this.isConfigured()) {
            // Return stub for hackathon/demo mode
            const stubCid = `bafybeistub${Date.now()}${Math.random().toString(36).substring(7)}`;
            logger.info({ credentialId: payload.credentialId }, 'IPFS not configured, returning stub CID');
            return {
                cid: stubCid,
                url: `${env.IPFS_GATEWAY}/${stubCid}`,
            };
        }

        try {
            // Using web3.storage API
            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json',
            });

            const formData = new FormData();
            formData.append('file', blob, `${payload.credentialId}.json`);

            const response = await axios.post<{ cid: string }>(
                'https://api.web3.storage/upload',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${env.IPFS_TOKEN}`,
                    },
                    timeout: 30000,
                }
            );

            const cid = response.data.cid;
            const url = `${env.IPFS_GATEWAY}/${cid}`;

            logger.info({ credentialId: payload.credentialId, cid }, 'Certificate uploaded to IPFS');

            return { cid, url };
        } catch (error) {
            logger.error({ error, credentialId: payload.credentialId }, 'Failed to upload to IPFS');

            // Fallback to stub if upload fails
            const stubCid = `bafybeistub${Date.now()}${Math.random().toString(36).substring(7)}`;
            return {
                cid: stubCid,
                url: `${env.IPFS_GATEWAY}/${stubCid}`,
            };
        }
    }

    async fetchCertificate(ipfsUrl: string): Promise<CertificatePayload | null> {
        try {
            const response = await axios.get<CertificatePayload>(ipfsUrl, { timeout: 10000 });
            return response.data;
        } catch (error) {
            logger.error({ error, ipfsUrl }, 'Failed to fetch from IPFS');
            return null;
        }
    }
}

export const ipfsService = new IpfsService();
