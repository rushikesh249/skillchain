export type UserRole = 'student' | 'employer' | 'admin';

export type SubmissionStatus = 'pending' | 'verified' | 'rejected';

export interface JwtPayload {
    id: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface VerificationReport {
    repoValid: boolean;
    repoAgeDays: number;
    lastPushDaysAgo: number;
    commitCountEstimate: number;
    languages: Record<string, number>;
    hasReadme: boolean;
    contributorsCountEstimate: number;
    suspiciousPatterns: string[];
}

export interface VerificationResult {
    verificationReport: VerificationReport;
    confidenceScore: number;
    flags: string[];
}

export interface CertificatePayload {
    credentialId: string;
    studentName: string;
    studentEmail: string;
    skillName: string;
    githubRepoUrl: string;
    demoUrl?: string;
    confidenceScore: number;
    flags: string[];
    issuedAt: string;
    issuer: string;
}

export interface IpfsUploadResult {
    cid: string;
    url: string;
}

export interface BlockchainMintParams {
    studentWallet: string;
    skillSlug: string;
    score: number;
    ipfsCid: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface SearchCandidatesParams extends PaginationParams {
    skillSlug?: string;
    minScore?: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            requestId?: string;
        }
    }
}
