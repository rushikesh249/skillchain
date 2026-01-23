import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

export interface RepoMetadata {
    name: string;
    full_name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    size: number;
    forks_count: number;
    stargazers_count: number;
    default_branch: string;
}

export interface CommitData {
    sha: string;
    commit: {
        author: {
            date: string;
        };
        message: string;
    };
}

export interface ContributorData {
    login: string;
    contributions: number;
}

export class GitHubClient {
    private client: AxiosInstance;

    constructor() {
        const headers: Record<string, string> = {
            Accept: 'application/vnd.github.v3+json',
        };

        if (env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
        }

        this.client = axios.create({
            baseURL: 'https://api.github.com',
            headers,
            timeout: 10000,
        });
    }

    parseRepoUrl(url: string): { owner: string; repo: string } | null {
        try {
            const urlObj = new URL(url);
            const parts = urlObj.pathname.split('/').filter(Boolean);
            if (parts.length >= 2) {
                return { owner: parts[0], repo: parts[1].replace('.git', '') };
            }
            return null;
        } catch {
            return null;
        }
    }

    async getRepoMetadata(owner: string, repo: string): Promise<RepoMetadata | null> {
        try {
            const response = await this.client.get<RepoMetadata>(`/repos/${owner}/${repo}`);
            return response.data;
        } catch (error) {
            logger.error({ error, owner, repo }, 'Failed to fetch repo metadata');
            return null;
        }
    }

    async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
        try {
            const response = await this.client.get<Record<string, number>>(
                `/repos/${owner}/${repo}/languages`
            );
            return response.data;
        } catch (error) {
            logger.error({ error, owner, repo }, 'Failed to fetch languages');
            return {};
        }
    }

    async checkReadmeExists(owner: string, repo: string): Promise<boolean> {
        try {
            await this.client.get(`/repos/${owner}/${repo}/readme`);
            return true;
        } catch {
            return false;
        }
    }

    async getCommits(owner: string, repo: string, perPage = 100): Promise<CommitData[]> {
        try {
            const response = await this.client.get<CommitData[]>(
                `/repos/${owner}/${repo}/commits`,
                { params: { per_page: perPage } }
            );
            return response.data;
        } catch (error) {
            logger.error({ error, owner, repo }, 'Failed to fetch commits');
            return [];
        }
    }

    async getContributors(owner: string, repo: string): Promise<ContributorData[]> {
        try {
            const response = await this.client.get<ContributorData[]>(
                `/repos/${owner}/${repo}/contributors`,
                { params: { per_page: 10 } }
            );
            return response.data;
        } catch (error) {
            logger.error({ error, owner, repo }, 'Failed to fetch contributors');
            return [];
        }
    }
}

export const githubClient = new GitHubClient();
