import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface StrictPublicRouteProps {
    children?: React.ReactNode;
    redirectPath?: string; // Optional specific redirect, defaults to matching /app path
}

export const StrictPublicRoute: React.FC<StrictPublicRouteProps> = ({ children, redirectPath }) => {
    let auth;
    try {
        auth = useAuth();
    } catch (e) {
        console.warn('StrictPublicRoute used without AuthProvider');
        return children ? <>{children}</> : <Outlet />;
    }

    const { user, loading } = auth;

    if (loading) {
        return null; // Or a consistent loader
    }

    if (user && user.onboarding_completed) {
        // If user is logged in, redirect to Dashboard or specific app path
        // For example: / -> /app/home, /quests -> /app/quests
        const currentPath = window.location.pathname;
        let targetPath = '/app/home';

        if (redirectPath) {
            targetPath = redirectPath;
        } else if (currentPath === '/') {
            targetPath = '/app/home';
        } else if (currentPath === '/quests') {
            targetPath = '/app/quests';
        } else if (currentPath === '/dibs') {
            targetPath = '/app/dibs';
        } else if (currentPath === '/lore') {
            targetPath = '/app/lore';
        } else if (currentPath === '/auth') {
            targetPath = '/app/home';
        }

        return <Navigate to={targetPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
