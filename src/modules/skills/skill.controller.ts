import { Request, Response, NextFunction } from 'express';
import { skillService } from './skill.service';
import { sendSuccess } from '../../shared/utils/response';

export class SkillController {
    async getAllSkills(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const skills = await skillService.getAllSkills();
            sendSuccess(res, skills, 'Skills retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export const skillController = new SkillController();
