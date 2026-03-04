export const API_ENDPOINTS = {
    PUBLIC: {
        HOMEPAGE: '/api/publicpages/homepage/',
        ABOUT: '/api/publicpages/about/',
        CONTACT: '/api/publicpages/contact/',
        CONTACT_MESSAGE: '/api/publicpages/contact/message/',
        PRICING: '/api/publicpages/pricing/',
    },
    AUTH: {
        LOGIN: '/api/auth/login/',
        REGISTER: '/api/auth/register/',
        REFRESH: '/api/auth/refresh/',
        LOGOUT: '/api/auth/logout/',
        ME: '/api/auth/me/',
    },
    HOSTELS: {
        LIST: '/api/hostels/',
        DETAIL: (id: string | number) => `/api/hostels/${id}/`,
    },
    ADMIN: {
        HOMEPAGE: '/api/publicpages/admin/homepage/',
        WHY_US: '/api/publicpages/admin/whyus/',
        WHY_US_DETAIL: (id: string | number) => `/api/publicpages/admin/whyus/${id}/`,
    },
} as const;
