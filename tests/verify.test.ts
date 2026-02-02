import request from 'supertest';
import { createApp } from '../src/app';
import { Skill } from '../src/modules/skills/skill.model';
import { User } from '../src/modules/user/user.model';
import { Credential } from '../src/modules/credentials/credential.model';
import { hashPassword } from '../src/shared/utils/password';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../src/services/ipfs/ipfs.service', () => ({
    ipfsService: {
        fetchMetadata: jest.fn().mockResolvedValue({
            name: 'Python Credential',
            description: 'Mocked description',
            issuer: 'SkillChain', // Added for test compatibility
            attributes: [
                { trait_type: 'Issuer', value: 'SkillChain' },
                { trait_type: 'Credential ID', value: 'test-cred-id' }
            ]
        }),
    },
}));

const app = createApp();

describe('Verify Module', () => {
    let credentialId: string;

    beforeEach(async () => {
        // Create student
        const studentPasswordHash = await hashPassword('Password123');
        const student = await User.create({
            name: 'Verify Student',
            email: 'verify.student@test.com',
            passwordHash: studentPasswordHash,
            role: 'student',
        });

        // Get skill
        const skill = await Skill.findOne({ slug: 'python' });

        // Create credential directly
        credentialId = uuidv4();
        await Credential.create({
            studentId: student._id,
            skillId: skill!._id,
            score: 85,
            ipfsCid: 'bafybeimockedcid',
            ipfsUrl: 'https://w3s.link/ipfs/bafybeimockedcid',
            blockchainTxHash: 'demo_tx_hash_verify',
            credentialId,
            certificateHash: 'mocked_certificate_hash',
        });
    });

    describe('GET /api/verify/:credentialId', () => {
        it('should verify a valid credential', async () => {
            const response = await request(app).get(`/api/verify/${credentialId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(true);
            expect(response.body.data.credential).toBeDefined();
            expect(response.body.data.credential.credentialId).toBe(credentialId);
            expect(response.body.data.student).toBeDefined();
            expect(response.body.data.skill).toBeDefined();
        });

        it('should return 404 for non-existent credential', async () => {
            const fakeId = uuidv4();
            const response = await request(app).get(`/api/verify/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should include IPFS certificate data if available', async () => {
            const response = await request(app).get(`/api/verify/${credentialId}`);

            expect(response.status).toBe(200);
            expect(response.body.data.certificate).toBeDefined();
            expect(response.body.data.certificate.issuer).toBe('SkillChain');
        });
    });
});

describe('Employer Module', () => {
    let employerToken: string;
    let studentId: string;
    let credentialId: string;

    beforeEach(async () => {
        // Create employer
        const employerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Employer',
                email: 'employer.verify@test.com',
                password: 'Password123',
                role: 'employer',
            });
        employerToken = employerRes.body.data.token;

        // Create student
        const studentPasswordHash = await hashPassword('Password123');
        const student = await User.create({
            name: 'Search Student',
            email: 'search.student@test.com',
            passwordHash: studentPasswordHash,
            role: 'student',
        });
        studentId = student._id.toString();

        // Get skill
        const skill = await Skill.findOne({ slug: 'nodejs' });

        // Create credential
        credentialId = uuidv4();
        await Credential.create({
            studentId: student._id,
            skillId: skill!._id,
            score: 90,
            ipfsCid: 'bafybeimockedcidsearch',
            ipfsUrl: 'https://w3s.link/ipfs/bafybeimockedcidsearch',
            blockchainTxHash: 'demo_tx_hash_search',
            credentialId,
            certificateHash: 'mocked_certificate_hash_search',
        });
    });

    describe('GET /api/employer/search', () => {
        it('should search candidates by skill', async () => {
            const response = await request(app)
                .get('/api/employer/search?skillSlug=nodejs')
                .set('Authorization', `Bearer ${employerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.data).toBeInstanceOf(Array);
            expect(response.body.data.pagination).toBeDefined();
        });

        it('should filter by minimum score', async () => {
            const response = await request(app)
                .get('/api/employer/search?skillSlug=nodejs&minScore=80')
                .set('Authorization', `Bearer ${employerToken}`);

            expect(response.status).toBe(200);
            response.body.data.data.forEach((c: { score: number }) => {
                expect(c.score).toBeGreaterThanOrEqual(80);
            });
        });
    });

    describe('POST /api/employer/unlock/:studentId', () => {
        it('should unlock a student profile', async () => {
            const response = await request(app)
                .post(`/api/employer/unlock/${studentId}`)
                .set('Authorization', `Bearer ${employerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.student).toBeDefined();
            expect(response.body.data.student.email).toBe('search.student@test.com');
            expect(response.body.data.credentials).toBeInstanceOf(Array);
        });

        it('should not charge credits for already unlocked profile', async () => {
            // First unlock
            await request(app)
                .post(`/api/employer/unlock/${studentId}`)
                .set('Authorization', `Bearer ${employerToken}`);

            // Get credits after first unlock
            const meRes1 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${employerToken}`);
            const creditsAfterFirst = meRes1.body.data.employerCredits;

            // Second unlock
            await request(app)
                .post(`/api/employer/unlock/${studentId}`)
                .set('Authorization', `Bearer ${employerToken}`);

            // Get credits after second unlock
            const meRes2 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${employerToken}`);
            const creditsAfterSecond = meRes2.body.data.employerCredits;

            // Credits should be same
            expect(creditsAfterSecond).toBe(creditsAfterFirst);
        });
    });

    describe('GET /api/employer/unlocks', () => {
        it('should get all unlocks', async () => {
            // First unlock a student
            await request(app)
                .post(`/api/employer/unlock/${studentId}`)
                .set('Authorization', `Bearer ${employerToken}`);

            const response = await request(app)
                .get('/api/employer/unlocks')
                .set('Authorization', `Bearer ${employerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });
});

describe('Health Endpoint', () => {
    it('should return health status', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('healthy');
        expect(response.body.data.uptime).toBeDefined();
    });
});
