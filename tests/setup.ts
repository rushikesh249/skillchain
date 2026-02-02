// ✅ ENV MUST BE SET BEFORE ANY IMPORTS THAT USE IT
jest.setTimeout(90000);
process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '1d';
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.PINATA_API_KEY = 'test-pinata-api-key';
process.env.PINATA_SECRET_API_KEY = 'test-pinata-secret-key';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Skill } from '../src/modules/skills/skill.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    // ⚡ SKIPPED FOR INTEGRITY CHECKS (Unit Tests Only)
    if (expect.getState().testPath?.includes('integrity.test.ts')) {
        return;
    }

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    if (expect.getState().testPath?.includes('integrity.test.ts')) {
        return;
    }

    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    if (expect.getState().testPath?.includes('integrity.test.ts')) {
        return;
    }

    // ✅ Always start clean
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }

    // ✅ Always seed skills fresh
    await Skill.create([
        { name: 'SQL', slug: 'sql', description: 'Database query language' },
        { name: 'Python', slug: 'python', description: 'General purpose programming language' },
        { name: 'React', slug: 'react', description: 'Frontend JavaScript library' },
        { name: 'Node.js', slug: 'nodejs', description: 'JavaScript runtime environment' },
    ]);
});
