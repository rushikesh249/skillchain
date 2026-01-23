import { Request, Response, NextFunction } from 'express';
import { submissionService } from './submission.service';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { CreateSubmissionInput } from './submission.schema';

export class SubmissionController {
    async createSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const studentId = req.user!.id;
            const input = req.body as CreateSubmissionInput;

            const submission = await submissionService.createSubmission(studentId, input);
            sendCreated(res, submission, 'Submission created successfully');
        } catch (error) {
            next(error);
        }
    }

    async getMySubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const studentId = req.user!.id;
            const submissions = await submissionService.getMySubmissions(studentId);
            sendSuccess(res, submissions, 'Submissions retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export const submissionController = new SubmissionController();
