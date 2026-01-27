import { z } from 'zod';
import dotenv from 'dotenv';

// Load dotenv
dotenv.config();

const envSchema = z.object({
    PORT: z
        .string()
        .default('3000')
        .transform((val) => parseInt(val, 10)),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    CORS_ORIGINS: z
        .string()
        .default('http://localhost:3000')
        .transform((val) => val.split(',').map((origin) => origin.trim())),
    GITHUB_TOKEN: z.string().optional(),
    // Pinata IPFS (REQUIRED for credential issuance)
    PINATA_API_KEY: z.string().optional(),
    PINATA_SECRET_API_KEY: z.string().optional(),
    IPFS_GATEWAY: z.string().default('https://gateway.pinata.cloud/ipfs'),
    // Blockchain
    RPC_URL: z.string().optional(),
    ISSUER_PRIVATE_KEY: z.string().optional(),
    CONTRACT_ADDRESS: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:');
    // eslint-disable-next-line no-console
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
