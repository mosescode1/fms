import { Request } from 'express';

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Extract pagination parameters from request query
 * @param req - Express request object
 * @param defaultLimit - Default limit if not provided in query
 * @returns Pagination parameters
 */
export function getPaginationParams(req: Request, defaultLimit: number = 10): PaginationParams {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || defaultLimit;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
}

/**
 * Create a paginated response
 * @param data - Array of data items
 * @param total - Total number of items
 * @param params - Pagination parameters
 * @returns Paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    data,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1
    }
  };
}