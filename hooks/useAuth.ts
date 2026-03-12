'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    loginUser,
    registerUser,
    logoutUser,
    fetchCurrentUser,
} from '@/lib/auth';
import { tokenManager } from '@/lib/token';
import type { LoginCredentials, RegisterData } from '@/lib/api/types';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: isLoggingOut } = useQuery({
        queryKey: ['isLoggingOut'],
        queryFn: () => false,
        staleTime: Infinity,
    });
    const setIsLoggingOut = useCallback((val: boolean) => {
        queryClient.setQueryData(['isLoggingOut'], val);
    }, [queryClient]);

    // Use React Query for global synchronized auth state across all components
    const { data: user, isLoading: initializing } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const currentUser = await fetchCurrentUser();
                return currentUser || null;
            } catch {
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });

    const login = useCallback(
        async (credentials: LoginCredentials) => {
            setLoading(true);
            try {
                const data = await loginUser(credentials);
                // Instantly update the global auth state
                queryClient.setQueryData(['authUser'], data.user);

                toast.success('Login Successful 🎉', {
                    description: 'Welcome back to StayNest!',
                });
                router.push('/dashboard');
                router.refresh(); // Tells Next.js to re-evaluate server components
                return data;
            } catch (error: any) {
                toast.error('Login failed', {
                    description: error.message || 'Please check your credentials.',
                });
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [router, queryClient]
    );

    const register = useCallback(
        async (userData: RegisterData) => {
            setLoading(true);
            try {
                const data = await registerUser(userData);
                toast.success('Account created 🎉', {
                    description: 'Please check your email for the verification code.',
                });
                router.push(`/verify-email?email=${encodeURIComponent(userData.email)}`);
                return data;
            } catch (error: any) {
                toast.error('Registration failed', {
                    description: error.message || 'Please try again.',
                });
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [router]
    );

    const logout = useCallback(async () => {
        setLoading(true);
        setIsLoggingOut(true);
        try {
            await logoutUser();
            toast.success('Logged out successfully');
        } catch {
            // Force logout even if API call fails
            tokenManager.clearAccessToken();
            tokenManager.clearAuthFlag();
        } finally {
            // Instantly clear the global auth state across all components
            queryClient.setQueryData(['authUser'], null);
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }); // Purge dashboard data

            router.push('/login');
            router.refresh();

            // clear it after a short delay to allow page transition to complete without flashing
            setTimeout(() => {
                setIsLoggingOut(false);
                setLoading(false);
            }, 1000);
        }
    }, [router, queryClient, setIsLoggingOut]);

    const getUser = useCallback(async () => {
        try {
            const currentUser = await fetchCurrentUser();
            if (currentUser) {
                queryClient.setQueryData(['authUser'], currentUser);
            } else {
                queryClient.setQueryData(['authUser'], null);
            }
            return currentUser;
        } catch {
            queryClient.setQueryData(['authUser'], null);
            return null;
        }
    }, [queryClient]);

    return {
        user: user || null,
        loading,
        initializing,
        isAuthenticated: !!user,
        isLoggingOut: !!isLoggingOut,
        login,
        register,
        logout,
        getUser,
    };
};
