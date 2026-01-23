import { Request, Response, NextFunction } from 'express';
import { credentialService } from './credential.service';
import { sendSuccess } from '../../shared/utils/response';

export class CredentialController {
    async getMyCredentials(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const studentId = req.user!.id;
            const credentials = await credentialService.getMyCredentials(studentId);
            sendSuccess(res, credentials, 'Credentials retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export const credentialController = new CredentialController();
