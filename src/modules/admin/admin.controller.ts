import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendCreated } from '../../shared/utils/response';

export class AdminController {
    async getPendingSubmissions(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const submissions = await adminService.getPendingSubmissions();
            sendSuccess(res, submissions, 'Pending submissions retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async approveSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const credential = await adminService.approveSubmission(id);
            sendCreated(res, credential, 'Submission approved and credential issued');
        } catch (error) {
            next(error);
        }
    }

    async rejectSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const submission = await adminService.rejectSubmission(id);
            sendSuccess(res, submission, 'Submission rejected');
        } catch (error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();
