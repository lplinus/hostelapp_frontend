'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null); // Replace 'any' with typed User model

    const login = async (credentials: any) => {
        setLoading(true);
        try {
            const data = await authService.login(credentials);
            // Setup simple cookie storage (should match middleware expectations)
            if (typeof document !== 'undefined') {
                document.cookie = `access=${data.access}; path=/; max-age=86400`;
            }
            setUser(data.user);
            toast.success('Logged in successfully');
            return data;
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        if (typeof document !== 'undefined') {
            document.cookie = 'access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        setUser(null);
    };

    return { user, login, logout, loading };
};
