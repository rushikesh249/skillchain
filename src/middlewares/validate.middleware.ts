import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidateOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export const validate = (schemas: ValidateOptions) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const targets: ValidationTarget[] = ['body', 'query', 'params'];

            for (const target of targets) {
                const schema = schemas[target];
                if (schema) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const result = schema.safeParse((req as any)[target]);
                    if (!result.success) {
                        throw result.error;
                    }
                    // Safe assignment
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (req as any)[target] = result.data;
                }
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
