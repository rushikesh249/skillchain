import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/errors/AppError';
import { UserRole } from '../shared/types';

export const requireRole = (...allowedRoles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user) {
            next(new ForbiddenError('Access denied'));
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            next(new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
            return;
        }

        next();
    };
};
