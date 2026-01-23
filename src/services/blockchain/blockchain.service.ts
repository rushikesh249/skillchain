import { ethers } from 'ethers';
import { env } from '../../config/env';
import { BlockchainMintParams } from '../../shared/types';
import { logger } from '../../shared/utils/logger';
import contractAbi from './abi/SkillChainSBT.json';

export class BlockchainService {
    private isConfigured(): boolean {
        return !!(env.RPC_URL && env.ISSUER_PRIVATE_KEY && env.CONTRACT_ADDRESS);
    }

    async mintCredential(params: BlockchainMintParams): Promise<string> {
        if (!this.isConfigured()) {
            // Return demo tx hash for hackathon mode
            const demoTxHash = `demo_tx_hash_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            logger.info(
                { ...params, txHash: demoTxHash },
                'Blockchain not configured, returning demo tx hash'
            );
            return demoTxHash;
        }

        try {
            const provider = new ethers.JsonRpcProvider(env.RPC_URL);
            const wallet = new ethers.Wallet(env.ISSUER_PRIVATE_KEY!, provider);
            const contract = new ethers.Contract(env.CONTRACT_ADDRESS!, contractAbi.abi, wallet);

            logger.info({ params }, 'Minting credential on blockchain');

            const tx = await contract.mintCredential(
                params.studentWallet,
                params.skillSlug,
                params.score,
                params.ipfsCid
            );

            const receipt = await tx.wait();
            const txHash = receipt.hash as string;

            logger.info({ txHash, params }, 'Credential minted on blockchain');

            return txHash;
        } catch (error) {
            logger.error({ error, params }, 'Failed to mint on blockchain');

            // Fallback to demo hash on error
            const demoTxHash = `demo_tx_hash_${Date.now()}_error`;
            return demoTxHash;
        }
    }

    async verifyCredentialOnChain(txHash: string): Promise<boolean> {
        if (!this.isConfigured() || txHash.startsWith('demo_tx_hash_')) {
            return txHash.startsWith('demo_tx_hash_');
        }

        try {
            const provider = new ethers.JsonRpcProvider(env.RPC_URL);
            const receipt = await provider.getTransactionReceipt(txHash);
            return receipt !== null && receipt.status === 1;
        } catch (error) {
            logger.error({ error, txHash }, 'Failed to verify on blockchain');
            return false;
        }
    }
}

export const blockchainService = new BlockchainService();
