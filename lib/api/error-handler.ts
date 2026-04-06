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
    let message = errorData?.detail || errorData?.message;

    if (!message && errorData?.non_field_errors) {
        message = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
    }

    if (!message) {
        // Try to get first field error
        const firstKey = Object.keys(errorData)[0];
        if (firstKey && errorData[firstKey]) {
            const val = errorData[firstKey];
            message = Array.isArray(val) ? val[0] : String(val);
        }
    }

    message = message || 'An unexpected error occurred';
    const errors = typeof errorData === 'object' && !errorData.detail ? errorData : undefined;

    throw new APIError(message, response.status, errors);
};
