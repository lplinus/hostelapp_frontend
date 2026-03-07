/**
 * In-memory token manager for access tokens.
 * Access tokens are NEVER stored in localStorage or cookies for security.
 * Refresh tokens are stored as HttpOnly cookies by the backend.
 */

let accessToken: string | null = null;

export const tokenManager = {
    getAccessToken: (): string | null => {
        return accessToken;
    },

    setAccessToken: (token: string): void => {
        accessToken = token;
    },

    clearAccessToken: (): void => {
        accessToken = null;
    },

    /**
     * Also set a lightweight, non-sensitive cookie flag so middleware
     * (which runs on the edge and can't access JS memory) knows the
     * user is authenticated. This cookie contains NO secret data.
     */
    setAuthFlag: (): void => {
        if (typeof document !== 'undefined') {
            document.cookie = `auth_status=authenticated; path=/; max-age=${10 * 60}; SameSite=Lax`;
        }
    },

    clearAuthFlag: (): void => {
        if (typeof document !== 'undefined') {
            document.cookie = 'auth_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
        }
    },
};
