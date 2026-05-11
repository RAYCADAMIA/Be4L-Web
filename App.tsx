import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { NavigationProvider } from './contexts/NavigationContext';
import './index.css';
import { Starfield } from './components/Landing/LandingComponents';
import { ThemeProvider } from './contexts/ThemeContext';
import { PreLaunchWelcome } from './components/ui/PreLaunchWelcome';
// @ts-ignore - LaunchLanding will be created in Task 5
import { LaunchLanding } from './components/Landing/LaunchLanding';

const AppContent = () => {
    return (
        <ToastProvider>
            <div className="vibrant-glow">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>
            <Starfield />
            <PreLaunchWelcome />
            <RouterProvider router={router} />
        </ToastProvider>
    );
};

const App = () => {
    const showLanding = import.meta.env.VITE_SHOW_LANDING_PAGE === 'true';

    if (showLanding) {
        return <LaunchLanding />;
    }

    return (
        <AuthProvider>
            <NavigationProvider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </NavigationProvider>
        </AuthProvider>
    );
};

export default App;
