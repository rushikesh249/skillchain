import { Request, Response, NextFunction } from 'express';
import { verifyService } from './verify.service';
import { sendSuccess } from '../../shared/utils/response';

export class VerifyController {
    async verifyCredential(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { credentialId } = req.params;
            const result = await verifyService.verifyCredential(credentialId);
            sendSuccess(res, result, 'Credential verified successfully');
        } catch (error) {
            next(error);
        }
    }
}

export const verifyController = new VerifyController();
