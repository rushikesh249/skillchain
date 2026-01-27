import { Request, Response, NextFunction } from 'express';
import { employerService } from './employer.service';
import { sendSuccess } from '../../shared/utils/response';
import { SearchCandidatesInput } from './employer.schema';

export class EmployerController {
    async searchCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const employerId = req.user!.id;
            const input = req.query as unknown as SearchCandidatesInput;
            const result = await employerService.searchCandidates(input, employerId);
            sendSuccess(res, result, 'Candidates retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async unlockStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const employerId = req.user!.id;
            const { studentId } = req.params;
            const profile = await employerService.unlockStudent(employerId, studentId);
            sendSuccess(res, profile, 'Profile unlocked successfully');
        } catch (error) {
            next(error);
        }
    }

    async getUnlocks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const employerId = req.user!.id;
            const unlocks = await employerService.getUnlocks(employerId);
            sendSuccess(res, unlocks, 'Unlocks retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export const employerController = new EmployerController();
