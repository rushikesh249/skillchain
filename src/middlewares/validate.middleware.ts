import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors/AppError';

interface ValidateOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export const validate = (schemas: ValidateOptions) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (schemas.body) {
                const result = schemas.body.safeParse(req.body);
                if (!result.success) throw result.error;
                req.body = result.data;
            }

            if (schemas.query) {
                const result = schemas.query.safeParse(req.query);
                if (!result.success) throw result.error;
                req.query = result.data;
            }

            if (schemas.params) {
                const result = schemas.params.safeParse(req.params);
                if (!result.success) throw result.error;
                req.params = result.data;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new ValidationError('Validation failed', details));
            } else {
                next(error);
            }
        }
    };
};

export const validateBody = (schema: ZodSchema) => validate({ body: schema });
export const validateQuery = (schema: ZodSchema) => validate({ query: schema });
export const validateParams = (schema: ZodSchema) => validate({ params: schema });
