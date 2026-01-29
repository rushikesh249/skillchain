import { blockchainService } from '../src/services/blockchain/blockchain.service';
import { verifyService } from '../src/modules/verify/verify.service';
import { credentialRepository } from '../src/modules/credentials/credential.repository';
import { ipfsService } from '../src/services/ipfs/ipfs.service';

// Mock dependencies
jest.mock('../src/modules/credentials/credential.repository');
jest.mock('../src/services/ipfs/ipfs.service');

describe('Integrity Layer', () => {
    describe('BlockchainService.calculateHash', () => {
        it('should produce deterministic hashes for unordered keys', () => {
            const obj1 = { a: 1, b: 2, c: { d: 3, e: 4 } };
            const obj2 = { b: 2, a: 1, c: { e: 4, d: 3 } };

            const hash1 = blockchainService.calculateHash(obj1);
            const hash2 = blockchainService.calculateHash(obj2);

            expect(hash1).toBe(hash2);
        });

        it('should satisfy specific hash test case', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: 2, a: 1 };
            const hash1 = blockchainService.calculateHash(obj1);
            const hash2 = blockchainService.calculateHash(obj2);
            expect(hash1).toBe(hash2);
        });
    });

    describe('VerifyService.verifyCredential', () => {
        it('should return valid=true and hashMatch=true when data is intact', async () => {
            const mockDate = new Date();
            const mockPayload = { foo: 'bar' };
            const mockHash = blockchainService.calculateHash(mockPayload);

            const mockCredential = {
                credentialId: 'cred-123',
                studentId: { name: 'Alice', email: 'alice@test.com' },
                skillId: { name: 'React', slug: 'react', description: 'React Skill' },
                score: 95,
                ipfsCid: 'cid-123',
                ipfsUrl: 'https://ipfs.io/ipfs/cid-123',
                certificateHash: mockHash,
                blockchainTxHash: 'tx-123',
                issuedAt: mockDate,
            };

            // Setup mocks
            (credentialRepository.findByCredentialId as jest.Mock).mockResolvedValue(mockCredential);
            (ipfsService.fetchMetadata as jest.Mock).mockResolvedValue(mockPayload);

            const result = await verifyService.verifyCredential('cred-123');

            expect(result.valid).toBe(true);
            expect(result.hashMatch).toBe(true);
            expect(result.certificateHash).toBe(mockHash);
        });

        it('should return hashMatch=false when data is tampered', async () => {
            const mockDate = new Date();
            const originalPayload = { foo: 'bar' };
            const originalHash = blockchainService.calculateHash(originalPayload);
            const tamperedPayload = { foo: 'baz' }; // Tampered data

            const mockCredential = {
                credentialId: 'cred-123',
                studentId: { name: 'Alice', email: 'alice@test.com' },
                skillId: { name: 'React', slug: 'react' },
                score: 95,
                ipfsCid: 'cid-123',
                ipfsUrl: 'https://ipfs.io/ipfs/cid-123',
                certificateHash: originalHash, // Stored hash matches original
                blockchainTxHash: 'tx-123',
                issuedAt: mockDate,
            };

            // Setup mocks
            (credentialRepository.findByCredentialId as jest.Mock).mockResolvedValue(mockCredential);
            (ipfsService.fetchMetadata as jest.Mock).mockResolvedValue(tamperedPayload); // IPFS returns tampered (or different) data

            const result = await verifyService.verifyCredential('cred-123');

            expect(result.valid).toBe(true); // Still valid format
            expect(result.hashMatch).toBe(false); // But hash mismatch
        });
    });
});
