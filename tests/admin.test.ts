import request from 'supertest';
import { createApp } from '../src/app';
import { Skill } from '../src/modules/skills/skill.model';
import { User } from '../src/modules/user/user.model';
import { Submission } from '../src/modules/submissions/submission.model';
import { hashPassword } from '../src/shared/utils/password';
import mongoose from 'mongoose';

// Mock external services
jest.mock('../src/services/github/github.service', () => ({
    githubService: {
        verifyRepository: jest.fn().mockResolvedValue({
            verificationReport: {
                repoValid: true,
                repoAgeDays: 30,
                lastPushDaysAgo: 2,
                commitCountEstimate: 50,
                languages: { TypeScript: 10000 },
                hasReadme: true,
                contributorsCountEstimate: 2,
                suspiciousPatterns: [],
            },
            confidenceScore: 85,
            flags: [],
        }),
    },
}));

jest.mock('../src/services/ipfs/ipfs.service', () => ({
    ipfsService: {
        uploadCertificate: jest.fn().mockResolvedValue({
            cid: 'bafybeimockedcid123',
            url: 'https://w3s.link/ipfs/bafybeimockedcid123',
        }),
    },
}));

jest.mock('../src/services/blockchain/blockchain.service', () => ({
    blockchainService: {
        mintCredential: jest.fn().mockResolvedValue('demo_tx_hash_mock_123'),
    },
}));

const app = createApp();

describe('Admin Module', () => {
    let adminToken: string;
    let studentToken: string;
    let submissionId: string;
    let skillId: string;

    beforeEach(async () => {
        // Create admin
        const adminPasswordHash = await hashPassword('AdminPass123');
        await User.create({
            name: 'Admin User',
            email: 'admin@skillchain.io',
            passwordHash: adminPasswordHash,
            role: 'admin',
        });

        const adminLogin = await request(app).post('/api/auth/login').send({
            email: 'admin@skillchain.io',
            password: 'AdminPass123',
        });
        adminToken = adminLogin.body.data.token;

        // Create student
        const studentRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Student',
                email: 'student@test.com',
                password: 'Password123',
                role: 'student',
                walletAddress: '0x1234567890123456789012345678901234567890',
            });
        studentToken = studentRes.body.data.token;

        // Get skill
        const skill = await Skill.findOne({ slug: 'react' });
        skillId = skill!._id.toString();

        // Create submission
        const submissionRes = await request(app)
            .post('/api/submissions')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                skillId,
                githubRepoUrl: 'https://github.com/test/react-app',
                demoUrl: 'https://react-app.demo.com',
            });

        submissionId = submissionRes.body.data._id;
    });

    describe('GET /api/admin/submissions/pending', () => {
        it('should get pending submissions as admin', async () => {
            const response = await request(app)
                .get('/api/admin/submissions/pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should fail without admin role', async () => {
            const response = await request(app)
                .get('/api/admin/submissions/pending')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('POST /api/admin/submissions/:id/approve', () => {
        it('should approve submission and create credential', async () => {
            const response = await request(app)
                .post(`/api/admin/submissions/${submissionId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.credentialId).toBeDefined();
            expect(response.body.data.ipfsCid).toBe('bafybeimockedcid123');
            expect(response.body.data.blockchainTxHash).toBe('demo_tx_hash_mock_123');

            // Verify submission status updated
            const submission = await Submission.findById(submissionId);
            expect(submission!.status).toBe('verified');
        });

        it('should fail for non-existent submission', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const response = await request(app)
                .post(`/api/admin/submissions/${fakeId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
        });

        it('should fail to approve already verified submission', async () => {
            // First approval
            await request(app)
                .post(`/api/admin/submissions/${submissionId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Second attempt
            const response = await request(app)
                .post(`/api/admin/submissions/${submissionId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/admin/submissions/:id/reject', () => {
        it('should reject submission', async () => {
            const response = await request(app)
                .post(`/api/admin/submissions/${submissionId}/reject`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('rejected');
        });
    });
});
