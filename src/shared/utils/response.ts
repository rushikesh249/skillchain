import { Response } from 'express';

export interface SuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}

export interface ErrorResponse {
    success: false;
    message: string;
    error: {
        code: string;
        details?: unknown;
    };
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
): Response => {
    const response: SuccessResponse<T> = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message: string,
    code: string,
    statusCode: number = 500,
    details?: unknown
): Response => {
    const response: ErrorResponse = {
        success: false,
        message,
        error: {
            code,
            details,
        },
    };
    return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message: string = 'Created'): Response => {
    return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
    return res.status(204).send();
};
