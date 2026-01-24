
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { AestheticAppBackground, GradientButton, GlassCard } from './ui/AestheticComponents';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <AestheticAppBackground className="flex flex-col items-center justify-center p-8 text-center bg-black">
                    <div className="relative z-10 flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
                        {/* Error Icon */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-red-500/20 blur-[60px] animate-aurora-lore rounded-full" />
                            <div className="relative w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                                <AlertTriangle size={48} className="text-red-500" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <h1 className="text-5xl font-black text-white italic tracking-tighter mb-4 uppercase leading-none">
                            Vibe Check <span className="text-red-500">Failed</span>
                        </h1>

                        <p className="text-gray-400 mb-10 font-medium leading-relaxed uppercase tracking-widest text-[10px]">
                            Something went wrong in the void.<br />Even the best side quests have bugs.
                        </p>

                        {/* Error Message Card */}
                        <GlassCard className="w-full p-6 mb-10 text-left border-red-500/20 bg-red-500/5 backdrop-blur-3xl shadow-2xl">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    Terminal Output
                                </p>
                                <span className="text-[10px] text-white/20 font-mono">ERROR_LOG_V1.0</span>
                            </div>
                            <div className="max-h-40 overflow-y-auto no-scrollbar">
                                <code className="text-[11px] text-red-200/80 font-mono break-all leading-relaxed">
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        </GlassCard>

                        {/* Action Buttons */}
                        <div className="flex flex-col w-full gap-4">
                            <GradientButton
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-3 py-6 h-auto"
                                icon={<RefreshCw size={20} className="animate-spin-slow" />}
                            >
                                REBOOT SYSTEM
                            </GradientButton>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2 py-5 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                            >
                                <Home size={16} /> GO HOME
                            </button>
                        </div>

                        {/* System Footer Overlay */}
                        <div className="mt-12 flex items-center gap-3 text-white/10 text-[9px] font-black uppercase tracking-[0.5em]">
                            <div className="h-[1px] w-8 bg-white/10" />
                            System Failure / Error Logic
                            <div className="h-[1px] w-8 bg-white/10" />
                        </div>
                    </div>
                </AestheticAppBackground>
            );
        }

        return (this as any).props.children;
    }
}


export default ErrorBoundary;

