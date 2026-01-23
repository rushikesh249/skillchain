import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/modules/user/user.model';
import { hashPassword } from '../src/shared/utils/password';

const app = createApp();

describe('Auth Module', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new student', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password123',
                    role: 'student',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('john@example.com');
            expect(response.body.data.user.role).toBe('student');
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.passwordHash).toBeUndefined();
        });

        it('should register a new employer with default credits', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Jane Corp',
                    email: 'jane@corp.com',
                    password: 'Password123',
                    role: 'employer',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.user.role).toBe('employer');
            expect(response.body.data.user.employerCredits).toBe(5);
        });

        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test',
                    email: 'invalid',
                    password: 'Password123',
                    role: 'student',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test',
                    email: 'test@test.com',
                    password: 'short',
                    role: 'student',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with password without number', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test',
                    email: 'test@test.com',
                    password: 'PasswordOnly',
                    role: 'student',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with duplicate email', async () => {
            await request(app).post('/api/auth/register').send({
                name: 'First',
                email: 'duplicate@test.com',
                password: 'Password123',
                role: 'student',
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Second',
                    email: 'duplicate@test.com',
                    password: 'Password123',
                    role: 'student',
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const passwordHash = await hashPassword('Password123');
            await User.create({
                name: 'Login Test',
                email: 'login@test.com',
                passwordHash,
                role: 'student',
            });
        });

        it('should login successfully', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'login@test.com',
                password: 'Password123',
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.email).toBe('login@test.com');
        });

        it('should fail with wrong password', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'login@test.com',
                password: 'WrongPassword123',
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'nonexistent@test.com',
                password: 'Password123',
            });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user', async () => {
            // Register
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Me Test',
                    email: 'me@test.com',
                    password: 'Password123',
                    role: 'student',
                });

            const token = registerResponse.body.data.token;

            // Get me
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe('me@test.com');
        });

        it('should fail without token', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });
});
