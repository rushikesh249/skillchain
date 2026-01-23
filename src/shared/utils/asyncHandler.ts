import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler =
    (fn: AsyncFunction) =>
        (req: Request, res: Response, next: NextFunction): void => {
            void fn(req, res, next).catch(next);
        };
