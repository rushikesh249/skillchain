import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../shared/utils/response';

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
            const adminId = req.user!.id;
            const submission = await adminService.approveSubmission(id, adminId);
            sendSuccess(res, submission, 'Submission approved successfully');
        } catch (error) {
            next(error);
        }
    }

    async rejectSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const adminId = req.user!.id;
            const body = req.body as { reason?: string };
            const reason = body.reason || 'No reason provided';

            const submission = await adminService.rejectSubmission(id, adminId, reason);
            sendSuccess(res, submission, 'Submission rejected');
        } catch (error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();
