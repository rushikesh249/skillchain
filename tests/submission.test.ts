import request from 'supertest';
import { createApp } from '../src/app';
import { Skill } from '../src/modules/skills/skill.model';

// Mock GitHub service
jest.mock('../src/services/github/github.service', () => ({
    githubService: {
        verifyRepository: jest.fn().mockResolvedValue({
            verificationReport: {
                repoValid: true,
                repoAgeDays: 30,
                lastPushDaysAgo: 2,
                commitCountEstimate: 50,
                languages: { TypeScript: 10000, JavaScript: 5000 },
                hasReadme: true,
                contributorsCountEstimate: 2,
                suspiciousPatterns: [],
            },
            confidenceScore: 85,
            flags: [],
        }),
    },
}));

const app = createApp();

describe('Submission Module', () => {
    let studentToken: string;
    let employerToken: string;
    let skillId: string;

    beforeEach(async () => {
        // Register student
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

        // Register employer
        const employerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Employer',
                email: 'employer@test.com',
                password: 'Password123',
                role: 'employer',
            });
        employerToken = employerRes.body.data.token;

        // Get skill
        const skill = await Skill.findOne({ slug: 'python' });
        skillId = skill!._id.toString();
    });

    describe('POST /api/submissions', () => {
        it('should create a submission as student', async () => {
            const response = await request(app)
                .post('/api/submissions')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    skillId,
                    githubRepoUrl: 'https://github.com/test/repo',
                    demoUrl: 'https://demo.example.com',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('pending');
            expect(response.body.data.confidenceScore).toBe(85);
            expect(response.body.data.verificationReport).toBeDefined();
        });

        it('should fail without authentication', async () => {
            const response = await request(app).post('/api/submissions').send({
                skillId,
                githubRepoUrl: 'https://github.com/test/repo',
            });

            expect(response.status).toBe(401);
        });

        it('should fail for employer role', async () => {
            const response = await request(app)
                .post('/api/submissions')
                .set('Authorization', `Bearer ${employerToken}`)
                .send({
                    skillId,
                    githubRepoUrl: 'https://github.com/test/repo',
                });

            expect(response.status).toBe(403);
        });

        it('should fail with invalid skill ID', async () => {
            const response = await request(app)
                .post('/api/submissions')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    skillId: '507f1f77bcf86cd799439011',
                    githubRepoUrl: 'https://github.com/test/repo',
                });

            expect(response.status).toBe(404);
        });

        it('should fail with invalid GitHub URL', async () => {
            const response = await request(app)
                .post('/api/submissions')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    skillId,
                    githubRepoUrl: 'https://gitlab.com/test/repo',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/submissions/my', () => {
        beforeEach(async () => {
            // Create a submission first
            await request(app)
                .post('/api/submissions')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    skillId,
                    githubRepoUrl: 'https://github.com/test/mysub',
                });
        });

        it('should get my submissions', async () => {
            const response = await request(app)
                .get('/api/submissions/my')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(1);
        });

        it('should fail without authentication', async () => {
            const response = await request(app).get('/api/submissions/my');

            expect(response.status).toBe(401);
        });
    });
});

describe('Skills Module', () => {
    describe('GET /api/skills', () => {
        it('should return all skills', async () => {
            const response = await request(app).get('/api/skills');

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(4);
            expect(response.body.data.map((s: { slug: string }) => s.slug)).toContain('python');
        });
    });
});
