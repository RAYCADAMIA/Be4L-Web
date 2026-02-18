// Deployment Trigger: Live V1
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { NavigationProvider } from './contexts/NavigationContext';
import './index.css'; // Ensure styles are loaded
import { Starfield } from './components/Landing/LandingComponents';
import { PreLaunchWelcome } from './components/ui/PreLaunchWelcome';

const App = () => {
    return (
        <>
            <div className="vibrant-glow">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>
            <Starfield />
            <PreLaunchWelcome />
            <RouterProvider router={router} />
        </>
    );
};

export default App;
