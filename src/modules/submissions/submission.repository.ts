import { Submission, ISubmission } from './submission.model';
import mongoose from 'mongoose';
import { SubmissionStatus, VerificationReport } from '../../shared/types';

export class SubmissionRepository {
    async create(data: {
        studentId: string;
        skillId: string;
        githubRepoUrl: string;
        demoUrl?: string;
        leetcodeUsername?: string;
        verificationReport: VerificationReport;
        confidenceScore: number;
        flags: string[];
    }): Promise<ISubmission> {
        const submission = new Submission({
            studentId: new mongoose.Types.ObjectId(data.studentId),
            skillId: new mongoose.Types.ObjectId(data.skillId),
            githubRepoUrl: data.githubRepoUrl,
            demoUrl: data.demoUrl,
            leetcodeUsername: data.leetcodeUsername,
            verificationReport: data.verificationReport,
            confidenceScore: data.confidenceScore,
            flags: data.flags,
            status: 'pending',
        });
        return submission.save();
    }

    async findByStudentId(studentId: string): Promise<ISubmission[]> {
        return Submission.find({ studentId: new mongoose.Types.ObjectId(studentId) })
            .populate('skillId', 'name slug')
            .sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<ISubmission | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return Submission.findById(id)
            .populate('skillId', 'name slug')
            .populate('studentId', 'name email walletAddress');
    }

    async findPending(): Promise<ISubmission[]> {
        return Submission.find({ status: 'pending' })
            .populate('skillId', 'name slug')
            .populate('studentId', 'name email')
            .sort({ createdAt: 1 });
    }

    async updateStatus(id: string, status: SubmissionStatus): Promise<ISubmission | null> {
        return Submission.findByIdAndUpdate(id, { status }, { new: true });
    }

    async existsForStudentAndSkill(studentId: string, skillId: string): Promise<boolean> {
        const count = await Submission.countDocuments({
            studentId: new mongoose.Types.ObjectId(studentId),
            skillId: new mongoose.Types.ObjectId(skillId),
            status: { $in: ['pending', 'verified'] },
        });
        return count > 0;
    }
}

export const submissionRepository = new SubmissionRepository();
