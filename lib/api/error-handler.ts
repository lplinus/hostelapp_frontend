import { ErrorResponse } from './types';

export class APIError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(message: string, status: number, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.errors = errors;
    }
}

export const handleApiError = async (response: Response): Promise<never> => {
    let errorData: any;
    try {
        errorData = await response.json();
    } catch {
        throw new APIError(response.statusText, response.status);
    }

    // Handle standard DRF error responses where details might be inside 'detail' or field errors
    const message = errorData?.detail || errorData?.message || 'An unexpected error occurred';
    const errors = typeof errorData === 'object' && !errorData.detail ? errorData : undefined;

    throw new APIError(message, response.status, errors);
};
