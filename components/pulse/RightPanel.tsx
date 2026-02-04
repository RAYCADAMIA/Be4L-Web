import React from 'react';

const MockWidget = ({ title, delay }: { title: string, delay: string }) => (
    <div className={`p-4 rounded-3xl bg-surface/30 border border-white/5 backdrop-blur-md animate-in fade-in slide-in-from-right-4 duration-700 ${delay}`}>
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{title}</h3>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(204,255,0,0.5)]" />
        </div>
        <div className="space-y-3">
            <div className="h-2 w-2/3 bg-white/5 rounded-full" />
            <div className="h-2 w-full bg-white/5 rounded-full" />
            <div className="h-2 w-1/2 bg-white/5 rounded-full" />
        </div>
    </div>
);

export const RightPanel: React.FC = () => {
    return (
        <div className="h-full border-l border-white/5 bg-deep-black/30 backdrop-blur-xl p-6 relative overflow-hidden flex flex-col gap-6">
            {/* Background Effect */}
            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-blue-500/5 blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black italic text-white tracking-widest uppercase">Pulse</h2>
                <span className="text-[9px] font-bold bg-white/10 px-2 py-1 rounded text-white/50">LIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                <MockWidget title="Active Quest" delay="delay-0" />
                <MockWidget title="Trending" delay="delay-100" />
                <MockWidget title="Near You" delay="delay-200" />

                {/* Visual Filler for "Cyber" look */}
                <div className="p-4 rounded-3xl bg-transparent border border-white/5 border-dashed flex items-center justify-center h-32 opacity-50">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-white/20">System Normal</span>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2 text-[9px] text-gray-600 uppercase font-bold tracking-wider">
                    <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                    <span>•</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                    <span>•</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Manifesto</span>
                </div>
                <p className="text-[9px] text-gray-700 mt-2 font-mono">v0.9.2-BETA // Be4L</p>
            </div>
        </div>
    );
};
