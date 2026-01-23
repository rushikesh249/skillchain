import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.schema';
import { NotFoundError } from '../../shared/errors/AppError';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input = req.body as RegisterInput;
            // Get user and token from service
            const { user, token } = await authService.register(input);

            // Return explicit JSON structure to guarantee contract
            // Status 201 Created
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    token,
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input = req.body as LoginInput;
            // Get user and token from service
            const { user, token } = await authService.login(input);

            // Return explicit JSON structure to guarantee contract
            // Status 200 OK
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const user = await authService.getCurrentUser(userId);

            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Keep standard structure for other endpoints
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
