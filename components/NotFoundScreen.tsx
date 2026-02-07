
import React from 'react';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { AestheticAppBackground, GradientButton, GlassCard } from './ui/AestheticComponents';

interface NotFoundScreenProps {
    onHome: () => void;
    onBack: () => void;
}

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ onHome, onBack }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="relative mb-12">
                {/* Floating/Glow Effect */}
                <div className="absolute inset-0 bg-primary/10 blur-[80px] animate-aurora-lore rounded-full" />

                <div className="relative flex flex-col items-center">
                    <div className="w-32 h-32 bg-black/40 backdrop-blur-3xl rounded-[40px] border border-white/5 flex items-center justify-center shadow-2xl mb-6">
                        <Ghost size={64} className="text-primary/50 animate-bounce" />
                    </div>

                    <h1 className="text-8xl font-black text-primary/10 absolute top-[-40px] select-none pointer-events-none">
                        404
                    </h1>
                </div>
            </div>

            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">
                Lost in the Void
            </h2>

            <p className="text-gray-400 mb-10 max-w-xs font-medium leading-relaxed uppercase tracking-widest text-[10px]">
                The page you're looking for has vanished into another dimension.
                Maybe it never existed at all.
            </p>

            <div className="flex flex-col w-full max-w-xs gap-4">
                <GradientButton
                    onClick={onHome}
                    className="flex items-center justify-center gap-2"
                >
                    <Home size={18} /> BACK TO REALITY
                </GradientButton>

                <button
                    onClick={onBack}
                    className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={16} /> GO BACK
                </button>
            </div>

            {/* Bottom Status Decoration */}
            <div className="absolute bottom-12 flex items-center gap-3">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800" />
                    ))}
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    You're not alone in the dark
                </span>
            </div>
        </div>
    );
};

export default NotFoundScreen;
