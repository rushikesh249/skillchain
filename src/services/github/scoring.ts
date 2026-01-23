import { CommitData } from './github.client';
import { VerificationReport } from '../../shared/types';

// Scoring weights
const WEIGHTS = {
    COMMIT_COUNT: 30,
    REPO_AGE: 20,
    RECENT_ACTIVITY: 20,
    LANGUAGE_COMPLEXITY: 15,
    README_BONUS: 10,
    DEMO_URL_BONUS: 5,
};

export interface ScoringResult {
    confidenceScore: number;
    flags: string[];
}

export function calculateConfidenceScore(
    report: VerificationReport,
    hasDemoUrl: boolean
): ScoringResult {
    const flags: string[] = [];
    let score = 0;

    // 1. Commit count score (0-30)
    if (report.commitCountEstimate >= 50) {
        score += WEIGHTS.COMMIT_COUNT;
    } else if (report.commitCountEstimate >= 20) {
        score += WEIGHTS.COMMIT_COUNT * 0.8;
    } else if (report.commitCountEstimate >= 10) {
        score += WEIGHTS.COMMIT_COUNT * 0.5;
    } else {
        score += WEIGHTS.COMMIT_COUNT * 0.2;
        flags.push('LOW_COMMITS');
    }

    // 2. Repo age score (0-20)
    if (report.repoAgeDays >= 30) {
        score += WEIGHTS.REPO_AGE;
    } else if (report.repoAgeDays >= 14) {
        score += WEIGHTS.REPO_AGE * 0.7;
    } else if (report.repoAgeDays >= 7) {
        score += WEIGHTS.REPO_AGE * 0.4;
    } else {
        score += WEIGHTS.REPO_AGE * 0.1;
        flags.push('VERY_NEW_REPO');
    }

    // 3. Recent activity score (0-20)
    if (report.lastPushDaysAgo <= 7) {
        score += WEIGHTS.RECENT_ACTIVITY;
    } else if (report.lastPushDaysAgo <= 14) {
        score += WEIGHTS.RECENT_ACTIVITY * 0.8;
    } else if (report.lastPushDaysAgo <= 30) {
        score += WEIGHTS.RECENT_ACTIVITY * 0.5;
    } else {
        score += WEIGHTS.RECENT_ACTIVITY * 0.2;
        flags.push('INACTIVE_REPO');
    }

    // 4. Language complexity score (0-15)
    const languageCount = Object.keys(report.languages).length;
    if (languageCount >= 4) {
        score += WEIGHTS.LANGUAGE_COMPLEXITY;
    } else if (languageCount >= 3) {
        score += WEIGHTS.LANGUAGE_COMPLEXITY * 0.8;
    } else if (languageCount >= 2) {
        score += WEIGHTS.LANGUAGE_COMPLEXITY * 0.5;
    } else {
        score += WEIGHTS.LANGUAGE_COMPLEXITY * 0.2;
        flags.push('LOW_LANGUAGE_DIVERSITY');
    }

    // 5. README bonus (0-10)
    if (report.hasReadme) {
        score += WEIGHTS.README_BONUS;
    } else {
        flags.push('NO_README');
    }

    // 6. Demo URL bonus (0-5)
    if (hasDemoUrl) {
        score += WEIGHTS.DEMO_URL_BONUS;
    }

    // Check for suspicious patterns
    flags.push(...report.suspiciousPatterns);

    return {
        confidenceScore: Math.round(Math.min(100, Math.max(0, score))),
        flags: [...new Set(flags)], // Remove duplicates
    };
}

export function detectSuspiciousPatterns(commits: CommitData[]): string[] {
    const patterns: string[] = [];

    if (commits.length === 0) {
        return patterns;
    }

    // Check if 80% of commits are on the same day
    const commitDates = commits.map((c) => {
        const date = new Date(c.commit.author.date);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    });

    const dateCounts: Record<string, number> = {};
    for (const date of commitDates) {
        dateCounts[date] = (dateCounts[date] || 0) + 1;
    }

    const maxCommitsOnSingleDay = Math.max(...Object.values(dateCounts));
    if (maxCommitsOnSingleDay / commits.length >= 0.8) {
        patterns.push('SINGLE_DAY_COMMITS');
    }

    return patterns;
}
