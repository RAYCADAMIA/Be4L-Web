import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { User as UserType } from '../types';
import { MOCK_USER } from '../constants';

interface AuthContextType {
    user: UserType | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (user: UserType) => void;
    logout: () => void;
    updateUser: (updates: Partial<UserType>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            // Check for persistent session first
            const savedUser = localStorage.getItem('be4l_session');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
                setLoading(false);
                return;
            }

            const fetchedUser = await supabaseService.auth.getCurrentUser();
            if (fetchedUser && fetchedUser.username) {
                setUser(fetchedUser);
                localStorage.setItem('be4l_session', JSON.stringify(fetchedUser));
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth Check Failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = (userData: UserType) => {
        setUser(userData);
        localStorage.setItem('be4l_session', JSON.stringify(userData));
    };

    const logout = async () => {
        await supabaseService.auth.signOut();
        localStorage.removeItem('be4l_session');
        setUser(null);
    };

    const updateUser = (updates: Partial<UserType>) => {
        setUser(prev => {
            const newUser = prev ? { ...prev, ...updates } : null;
            if (newUser) {
                localStorage.setItem('be4l_session', JSON.stringify(newUser));
            }
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            login,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
