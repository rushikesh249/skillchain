import mongoose from 'mongoose';
import { Credential } from '../credentials/credential.model';
import { Submission } from '../submissions/submission.model';
import { skillRepository } from '../skills/skill.repository';
import { userRepository } from '../user/user.repository';
import { employerUnlockLogRepository } from './employerUnlockLog.repository';
import { credentialRepository } from '../credentials/credential.repository';
import {
    NotFoundError,
    InsufficientCreditsError,
    ConflictError,
} from '../../shared/errors/AppError';
import { SearchCandidatesInput } from './employer.schema';
import {
    parsePaginationParams,
    createPaginatedResult,
    getSkipValue,
} from '../../shared/utils/pagination';
import { PaginatedResult } from '../../shared/types';
import { IEmployerUnlockLog } from './employerUnlockLog.model';

interface CandidateResult {
    student: {
        _id: string;
        name: string;
    };
    skill: {
        _id: string;
        name: string;
        slug: string;
    };
    score: number;
    credentialId: string;
    issuedAt: Date;
}

interface UnlockedProfile {
    student: {
        _id: string;
        name: string;
        email: string;
        walletAddress?: string;
    };
    credentials: Array<{
        skillName: string;
        score: number;
        credentialId: string;
        ipfsUrl: string;
    }>;
    submissions: Array<{
        skillName: string;
        githubRepoUrl: string;
        demoUrl?: string;
        confidenceScore: number;
    }>;
}

export class EmployerService {
    async searchCandidates(input: SearchCandidatesInput): Promise<PaginatedResult<CandidateResult>> {
        const pagination = parsePaginationParams(input.page, input.limit);
        const minScore = input.minScore || 0;

        // Build aggregation pipeline
        const matchStage: Record<string, unknown> = {
            score: { $gte: minScore },
        };

        if (input.skillSlug) {
            const skill = await skillRepository.findBySlug(input.skillSlug);
            if (!skill) {
                throw new NotFoundError('Skill not found');
            }
            matchStage.skillId = skill._id;
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student',
                },
            },
            { $unwind: '$student' },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillId',
                    foreignField: '_id',
                    as: 'skill',
                },
            },
            { $unwind: '$skill' },
            { $sort: { score: -1 as const } },
            {
                $facet: {
                    data: [{ $skip: getSkipValue(pagination) }, { $limit: pagination.limit }],
                    total: [{ $count: 'count' }],
                },
            },
        ];

        const result = await Credential.aggregate(pipeline);
        const data = result[0]?.data || [];
        const total = result[0]?.total[0]?.count || 0;

        const candidates: CandidateResult[] = data.map(
            (item: {
                student: { _id: mongoose.Types.ObjectId; name: string };
                skill: { _id: mongoose.Types.ObjectId; name: string; slug: string };
                score: number;
                credentialId: string;
                issuedAt: Date;
            }) => ({
                student: {
                    _id: item.student._id.toString(),
                    name: item.student.name,
                },
                skill: {
                    _id: item.skill._id.toString(),
                    name: item.skill.name,
                    slug: item.skill.slug,
                },
                score: item.score,
                credentialId: item.credentialId,
                issuedAt: item.issuedAt,
            })
        );

        return createPaginatedResult(candidates, total, pagination);
    }

    async unlockStudent(employerId: string, studentId: string): Promise<UnlockedProfile> {
        // Check if already unlocked
        const isUnlocked = await employerUnlockLogRepository.isUnlocked(employerId, studentId);
        if (isUnlocked) {
            // Return existing unlock data without charging
            return this.getUnlockedProfile(studentId);
        }

        // Check credits
        const employer = await userRepository.findById(employerId);
        if (!employer) {
            throw new NotFoundError('Employer not found');
        }

        if (employer.employerCredits <= 0) {
            throw new InsufficientCreditsError('No credits remaining. Please purchase more credits.');
        }

        // Verify student exists and has credentials
        const student = await userRepository.findById(studentId);
        if (!student || student.role !== 'student') {
            throw new NotFoundError('Student not found');
        }

        const credentials = await credentialRepository.findByStudentId(studentId);
        if (credentials.length === 0) {
            throw new ConflictError('Student has no verified credentials');
        }

        // Atomically decrement credits
        const updated = await userRepository.decrementCredits(employerId);
        if (!updated) {
            throw new InsufficientCreditsError('Failed to process unlock. Credits may have been exhausted.');
        }

        // Log unlock
        await employerUnlockLogRepository.create({
            employerId,
            studentId,
        });

        return this.getUnlockedProfile(studentId);
    }

    private async getUnlockedProfile(studentId: string): Promise<UnlockedProfile> {
        const student = await userRepository.findById(studentId);
        if (!student) {
            throw new NotFoundError('Student not found');
        }

        const credentials = await credentialRepository.findByStudentId(studentId);
        const submissions = await Submission.find({
            studentId: new mongoose.Types.ObjectId(studentId),
            status: 'verified',
        }).populate('skillId', 'name');

        return {
            student: {
                _id: student._id.toString(),
                name: student.name,
                email: student.email,
                walletAddress: student.walletAddress,
            },
            credentials: credentials.map((c) => ({
                skillName: (c.skillId as unknown as { name: string }).name,
                score: c.score,
                credentialId: c.credentialId,
                ipfsUrl: c.ipfsUrl,
            })),
            submissions: submissions.map((s) => ({
                skillName: (s.skillId as unknown as { name: string }).name,
                githubRepoUrl: s.githubRepoUrl,
                demoUrl: s.demoUrl,
                confidenceScore: s.confidenceScore,
            })),
        };
    }

    async getUnlocks(employerId: string): Promise<IEmployerUnlockLog[]> {
        return employerUnlockLogRepository.findByEmployerId(employerId);
    }
}

export const employerService = new EmployerService();
