/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

    maxWorkers: 1, // ✅ ADD THIS LINE (runs tests sequentially)

    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
};
