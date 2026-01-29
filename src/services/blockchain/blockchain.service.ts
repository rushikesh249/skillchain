import { ethers } from 'ethers';
import { env } from '../../config/env';
import { BlockchainMintParams } from '../../shared/types';
import { logger } from '../../shared/utils/logger';
import contractAbi from './abi/SkillChainSBT.json';
import crypto from 'crypto';

export class BlockchainService {

    private isConfigured(): boolean {
        const configured = !!(env.RPC_URL && env.ISSUER_PRIVATE_KEY && env.CONTRACT_ADDRESS);
        if (!configured) {
            if (!env.RPC_URL) logger.warn('Blockchain: RPC_URL not configured');
            if (!env.ISSUER_PRIVATE_KEY) logger.warn('Blockchain: ISSUER_PRIVATE_KEY not configured');
            if (!env.CONTRACT_ADDRESS) logger.warn('Blockchain: CONTRACT_ADDRESS not configured');
        }
        return configured;
    }

    private stableStringify(obj: any): string {
        if (obj === null || typeof obj !== 'object') {
            return JSON.stringify(obj);
        }

        if (Array.isArray(obj)) {
            return `[${obj.map((i) => this.stableStringify(i)).join(',')}]`;
        }

        const keys = Object.keys(obj).sort();
        return `{${keys.map((k) => `"${k}":${this.stableStringify(obj[k])}`).join(',')}}`;
    }

    calculateHash(payload: any): string {
        const stableJson = this.stableStringify(payload);
        return crypto.createHash('sha256').update(stableJson).digest('hex');
    }

    async mintCredential(params: BlockchainMintParams): Promise<string> {
        if (!this.isConfigured()) {
            throw new Error('Blockchain not configured: check RPC_URL, ISSUER_PRIVATE_KEY, and CONTRACT_ADDRESS');
        }

        try {
            const provider = new ethers.JsonRpcProvider(env.RPC_URL);
            const wallet = new ethers.Wallet(env.ISSUER_PRIVATE_KEY!, provider);
            const contract = new ethers.Contract(env.CONTRACT_ADDRESS!, contractAbi.abi, wallet);

            // 1. Log setup details
            logger.info({
                signer: wallet.address,
                contract: env.CONTRACT_ADDRESS,
                function: 'mintCredential',
                params
            }, 'Preparing to mint credential');

            // 2. Check Balance
            const balance = await provider.getBalance(wallet.address);
            logger.info({ balance: ethers.formatEther(balance) }, 'Signer balance checked');

            if (balance === BigInt(0)) {
                throw new Error(`Signer ${wallet.address} has 0 ETH`);
            }

            // 3. Verify Ownership (if contract has owner() function)
            try {
                // Determine if owner() exists in ABI
                if (contract.owner) {
                    const owner = await contract.owner();
                    logger.info({ owner, signer: wallet.address }, 'Contract ownership check');
                    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
                        logger.warn('Signer is NOT the contract owner. Minting might fail if onlyOwner modifier is present.');
                    }
                }
            } catch (ownerErr) {
                logger.warn({ err: ownerErr }, 'Could not fetch contract owner (function might not exist)');
            }

            // 4. Estimate Gas
            try {
                logger.info('Estimating gas...');
                const gas = await contract.mintCredential.estimateGas(
                    params.studentWallet,
                    params.skillSlug,
                    params.score,
                    params.ipfsCid
                );
                logger.info({ gas: gas.toString() }, 'Gas estimation success');
            } catch (gasError: any) {
                logger.error({
                    error: gasError,
                    reason: gasError.reason,
                    code: gasError.code,
                    revert: gasError.revert
                }, 'Gas estimation FAILED');
                throw new Error(`Gas estimation failed: ${gasError.reason || gasError.message}`);
            }

            // 5. Send Transaction
            logger.info('Sending transaction...');
            const tx = await contract.mintCredential(
                params.studentWallet,
                params.skillSlug,
                params.score,
                params.ipfsCid
            );
            logger.info({ txHash: tx.hash }, 'Transaction sent');

            // 6. Wait for Receipt
            const receipt = await tx.wait();

            if (receipt.status === 0) {
                throw new Error('Transaction reverted on-chain after being included in block');
            }

            const txHash = receipt.hash as string;
            logger.info({ txHash, params }, 'Credential successfully minted on blockchain');

            return txHash;

        } catch (error: any) {
            logger.error({
                error: error.message,
                stack: error.stack,
                reason: error.reason
            }, 'CRITICAL: Failed to mint on blockchain');

            // NO FALLBACK - We must return the real error
            throw new Error(`Blockchain minting failed: ${error.message}`);
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
