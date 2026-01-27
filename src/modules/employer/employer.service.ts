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
    async searchCandidates(input: SearchCandidatesInput, employerId: string): Promise<PaginatedResult<CandidateResult & { isUnlocked: boolean }>> {
        const pagination = parsePaginationParams(input.page, input.limit);
        const minScore = input.minScore || 0;

        // Build aggregation pipeline
        const matchStage: Record<string, unknown> = {
            confidenceScore: { $gte: minScore }, // Note: using confidenceScore from Submission
            status: { $in: ['approved', 'verified'] },
            isVisibleToEmployers: true,
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
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skillId',
                    foreignField: '_id',
                    as: 'skill',
                },
            },
            { $unwind: { path: '$skill', preserveNullAndEmptyArrays: true } },
            // Sort by score (descending) and then newest first
            { $sort: { confidenceScore: -1 as const, reviewedAt: -1 as const } },
            {
                $facet: {
                    data: [{ $skip: getSkipValue(pagination) }, { $limit: pagination.limit }],
                    total: [{ $count: 'count' }],
                },
            },
        ];

        // Log the pipeline execution
        console.log('Search Match Stage:', JSON.stringify(matchStage));
        const result = await Submission.aggregate(pipeline);
        console.log('Raw Aggregation Result length:', result[0]?.data?.length || 0);

        const data = result[0]?.data || [];
        const total = result[0]?.total[0]?.count || 0;

        // Fetch unlocked students for this employer
        const unlocks = await employerUnlockLogRepository.findByEmployerId(employerId);
        const unlockedStudentIds = new Set(unlocks.map(u => u.studentId.toString()));

        // Filter out students that are already unlocked
        const filteredData = data.filter((item: any) => {
            const studentId = item.student?._id?.toString();
            return studentId && !unlockedStudentIds.has(studentId);
        });

        const candidates = filteredData.map(
            (item: {
                student?: { _id: mongoose.Types.ObjectId; name: string };
                skill?: { _id: mongoose.Types.ObjectId; name: string; slug: string };
                confidenceScore: number;
                _id: string; // Submission ID
                reviewedAt: Date;
            }) => ({
                student: {
                    _id: item.student?._id.toString() || 'unknown',
                    name: item.student?.name || 'Unknown Student',
                },
                skill: {
                    _id: item.skill?._id.toString() || 'unknown',
                    name: item.skill?.name || 'Unknown Skill',
                    slug: item.skill?.slug || 'unknown-skill',
                },
                score: item.confidenceScore,
                credentialId: 'pending_mint', // Placeholder until minted
                issuedAt: item.reviewedAt || new Date(), // Use review date as issue date
                isUnlocked: item.student?._id ? unlockedStudentIds.has(item.student._id.toString()) : false
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

        // Also check for approved submissions (for new no-blockchain flow)
        const approvedSubmissions = await Submission.find({
            studentId,
            status: 'approved'
        });

        if (credentials.length === 0 && approvedSubmissions.length === 0) {
            throw new ConflictError('Student has no verified credentials or approved submissions');
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
            status: { $in: ['verified', 'approved'] },
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
