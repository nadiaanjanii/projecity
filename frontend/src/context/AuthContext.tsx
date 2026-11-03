'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getCsrfCookie } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<any>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const response = await api.get('/user', {
                validateStatus: (status) => status < 500
            });
            if (response.status === 200) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            console.warn('Backend server unreachable or returning error:', error.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (credentials: any) => {
        try {
            await getCsrfCookie();
            const response = await api.post('/login', credentials);
            setUser(response.data.user);
            router.push('/dashboard');
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout request failed', error);
        } finally {
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
