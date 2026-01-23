import { githubClient } from './github.client';
import { calculateConfidenceScore, detectSuspiciousPatterns } from './scoring';
import { VerificationReport, VerificationResult } from '../../shared/types';
import { ExternalServiceError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export class GitHubService {
    async verifyRepository(repoUrl: string, hasDemoUrl: boolean): Promise<VerificationResult> {
        const parsed = githubClient.parseRepoUrl(repoUrl);

        if (!parsed) {
            throw new ExternalServiceError('GitHub', 'Invalid repository URL');
        }

        const { owner, repo } = parsed;
        logger.info({ owner, repo }, 'Starting repository verification');

        // Fetch all data in parallel
        const [metadata, languages, hasReadme, commits, contributors] = await Promise.all([
            githubClient.getRepoMetadata(owner, repo),
            githubClient.getLanguages(owner, repo),
            githubClient.checkReadmeExists(owner, repo),
            githubClient.getCommits(owner, repo),
            githubClient.getContributors(owner, repo),
        ]);

        if (!metadata) {
            throw new ExternalServiceError('GitHub', 'Repository not found or inaccessible');
        }

        // Calculate days
        const createdAt = new Date(metadata.created_at);
        const pushedAt = new Date(metadata.pushed_at);
        const now = new Date();

        const repoAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const lastPushDaysAgo = Math.floor(
            (now.getTime() - pushedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Detect suspicious patterns
        const suspiciousPatterns = detectSuspiciousPatterns(commits);

        const verificationReport: VerificationReport = {
            repoValid: true,
            repoAgeDays,
            lastPushDaysAgo,
            commitCountEstimate: commits.length,
            languages,
            hasReadme,
            contributorsCountEstimate: contributors.length,
            suspiciousPatterns,
        };

        const { confidenceScore, flags } = calculateConfidenceScore(verificationReport, hasDemoUrl);

        logger.info(
            { owner, repo, confidenceScore, flags },
            'Repository verification completed'
        );

        return {
            verificationReport,
            confidenceScore,
            flags,
        };
    }
}

export const githubService = new GitHubService();
