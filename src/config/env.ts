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
        .default(process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'development' ? '*' : ''))
        .transform((val) => val.split(',').map((origin) => origin.trim())),
    GITHUB_TOKEN: z.string().optional(),
    // Pinata IPFS (REQUIRED for credential issuance)
    PINATA_API_KEY: z.string().min(1, 'PINATA_API_KEY is required for IPFS uploads'),
    PINATA_SECRET_API_KEY: z.string().min(1, 'PINATA_SECRET_API_KEY is required for IPFS uploads'),
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

    // Only exit in production or development, allow tests to handle errors gracefully
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
    }
}

const validatedEnv = parsedEnv.success
    ? parsedEnv.data
    : (process.env.NODE_ENV === 'test'
        ? (parsedEnv.data || ({} as Env)) // Fallback for tests
        : (() => {
            // This part should technically be unreachable due to process.exit(1) above,
            // but it's here for type safety and clarity.
            return {} as Env;
        })());

export const env = validatedEnv;

export type Env = z.infer<typeof envSchema>;
