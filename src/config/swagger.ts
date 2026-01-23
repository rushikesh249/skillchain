import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SkillChain API',
            version: '1.0.0',
            description:
                'Blockchain Verified Micro-Credentials for Skills-Based Hiring - Production API',
            contact: {
                name: 'SkillChain Team',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token',
                },
            },
            schemas: {
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
                ApiError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                details: { type: 'object' },
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['student', 'employer', 'admin'] },
                        walletAddress: { type: 'string' },
                        employerCredits: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Skill: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        description: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Submission: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        studentId: { type: 'string' },
                        skillId: { type: 'string' },
                        githubRepoUrl: { type: 'string', format: 'uri' },
                        demoUrl: { type: 'string', format: 'uri' },
                        leetcodeUsername: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
                        verificationReport: { type: 'object' },
                        confidenceScore: { type: 'number', minimum: 0, maximum: 100 },
                        flags: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Credential: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        studentId: { type: 'string' },
                        skillId: { type: 'string' },
                        score: { type: 'number' },
                        ipfsCid: { type: 'string' },
                        ipfsUrl: { type: 'string', format: 'uri' },
                        blockchainTxHash: { type: 'string' },
                        credentialId: { type: 'string', format: 'uuid' },
                        issuedAt: { type: 'string', format: 'date-time' },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        name: { type: 'string', minLength: 2 },
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 8 },
                        role: { type: 'string', enum: ['student', 'employer'] },
                        walletAddress: { type: 'string' },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                },
                CreateSubmissionRequest: {
                    type: 'object',
                    required: ['skillId', 'githubRepoUrl'],
                    properties: {
                        skillId: { type: 'string' },
                        githubRepoUrl: { type: 'string', format: 'uri' },
                        demoUrl: { type: 'string', format: 'uri' },
                        leetcodeUsername: { type: 'string' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/modules/**/**.routes.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
