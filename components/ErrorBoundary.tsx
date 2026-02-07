import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

/**
 * Functional component for React Router's errorElement.
 * Uses hooks only available within Route context.
 */
export const RouteErrorBoundary: React.FC = () => {
    let error: any;
    let navigate: any;

    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        error = useRouteError();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        navigate = useNavigate();
    } catch (e) {
        // Hook called outside RouterProvider
    }

    const handleHome = () => {
        if (navigate) navigate('/');
        else window.location.href = '/';
    };

    return (
        <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Background Chaos Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-md text-center">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <AlertCircle size={40} className="text-red-500 animate-pulse" />
                </div>

                <h1 className="text-4xl font-black tracking-tighter mb-4 text-white">
                    SYSTEM <span className="text-red-500">GLITCH</span>
                </h1>

                <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                    A critical exception occurred in the void. {error?.message || (error?.statusText ? `${error.status} ${error.statusText}` : "Internal core failure detected.")}
                </p>

                <div className="flex flex-col w-full gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all group"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        Reboot Session
                    </button>

                    <button
                        onClick={handleHome}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Home size={18} />
                        Return to Nucleus
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 w-full">
                    <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">
                        Error ID: {Math.random().toString(36).substring(7).toUpperCase()} // be4l_recovery_mode
                    </p>
                </div>
            </div>
        </div>
    );
};

// Also supporting named ErrorBoundary for router
export const ErrorBoundary = RouteErrorBoundary;

/**
 * Class-based Error Boundary for the global index.tsx wrapper.
 * Catches raw React rendering errors.
 */
export default class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Global Error Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Can't use RouteErrorBoundary here because it uses hooks
            // Providing a simplified functional fallback
            return (
                <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-white text-center">
                    <AlertCircle size={40} className="text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">SYSTEM CRASH</h1>
                    <p className="text-gray-400 mb-6">{this.state.error?.message || "Internal failure"}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-black font-bold rounded-xl">Reload Application</button>
                </div>
            );
        }

        return this.props.children;
    }
}
