'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useApi = <T = any>() => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async (promise: Promise<T>, options?: { successMsg?: string }) => {
        try {
            setLoading(true);
            setError(null);
            const result = await promise;
            setData(result);
            if (options?.successMsg) {
                toast.success(options.successMsg);
            }
            return result;
        } catch (err: any) {
            setError(err);
            toast.error(err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute };
};
