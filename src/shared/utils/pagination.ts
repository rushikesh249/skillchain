import { PaginationParams, PaginatedResult } from '../types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const parsePaginationParams = (
    page?: string | number,
    limit?: string | number
): PaginationParams => {
    const parsedPage = Math.max(1, parseInt(String(page || DEFAULT_PAGE), 10) || DEFAULT_PAGE);
    const parsedLimit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(String(limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );

    return {
        page: parsedPage,
        limit: parsedLimit,
    };
};

export const createPaginatedResult = <T>(
    data: T[],
    total: number,
    params: PaginationParams
): PaginatedResult<T> => {
    const totalPages = Math.ceil(total / params.limit);

    return {
        data,
        pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrev: params.page > 1,
        },
    };
};

export const getSkipValue = (params: PaginationParams): number => {
    return (params.page - 1) * params.limit;
};
