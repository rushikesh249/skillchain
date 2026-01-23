import { submissionRepository } from './submission.repository';
import { skillRepository } from '../skills/skill.repository';
import { githubService } from '../../services/github/github.service';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import { CreateSubmissionInput } from './submission.schema';
import { ISubmission } from './submission.model';

export class SubmissionService {
    async createSubmission(
        studentId: string,
        input: CreateSubmissionInput
    ): Promise<ISubmission> {
        // Validate skill exists
        const skill = await skillRepository.findById(input.skillId);
        if (!skill) {
            throw new NotFoundError('Skill not found');
        }

        // Check for existing submission
        const exists = await submissionRepository.existsForStudentAndSkill(studentId, input.skillId);
        if (exists) {
            throw new ConflictError('You already have a pending or verified submission for this skill');
        }

        // Run verification
        const verificationResult = await githubService.verifyRepository(
            input.githubRepoUrl,
            !!input.demoUrl
        );

        // Create submission
        const submission = await submissionRepository.create({
            studentId,
            skillId: input.skillId,
            githubRepoUrl: input.githubRepoUrl,
            demoUrl: input.demoUrl || undefined,
            leetcodeUsername: input.leetcodeUsername,
            verificationReport: verificationResult.verificationReport,
            confidenceScore: verificationResult.confidenceScore,
            flags: verificationResult.flags,
        });

        return submission;
    }

    async getMySubmissions(studentId: string): Promise<ISubmission[]> {
        return submissionRepository.findByStudentId(studentId);
    }

    async getPendingSubmissions(): Promise<ISubmission[]> {
        return submissionRepository.findPending();
    }

    async getSubmissionById(id: string): Promise<ISubmission | null> {
        return submissionRepository.findById(id);
    }
}

export const submissionService = new SubmissionService();
