'use client';

import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
});

export const getCsrfCookie = () => api.get('/../sanctum/csrf-cookie');

// Auto-Healing Interceptor for CSRF (419) and Auth (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Gracefully resolve /user auth check when guest to prevent Next.js dev overlay popups
            if (originalRequest?.url?.includes('/user')) {
                return Promise.resolve({ status: 401, data: null, config: originalRequest, headers: {}, statusText: 'Unauthorized' });
            }

            // Redirect unauthenticated requests to login page if on protected route
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
                return new Promise(() => {}); // Return a pending promise to stop execution
            }
        }

        // If we get a 419 (CSRF mismatch) and we haven't retried yet
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Refresh the CSRF cookie
                await getCsrfCookie();
                
                // Retry the original request
                return api(originalRequest);
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
