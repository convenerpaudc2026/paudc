import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../lib/auth';

interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    last_login?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refetch: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async () => {
        try {
            await authApi.login();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed');
            throw err;
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const value: AuthContextType = {
        user,
        loading,
        error,
        login,
        logout,
        refetch: checkAuthStatus,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};