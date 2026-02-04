import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Gift, Rocket, ShieldCheck } from 'lucide-react';

export const PreLaunchWelcome = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has seen this welcome message
        const hasSeen = localStorage.getItem('be4l_prelaunch_welcome_seen');
        if (!hasSeen) {
            // Small delay for dramatic effect
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('be4l_prelaunch_welcome_seen', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-deep-black/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm rounded-[2.5rem] bg-[#0A0A0A] border border-electric-teal/30 shadow-[0_0_50px_rgba(45,212,191,0.15)] overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-electric-teal/10 to-transparent pointer-events-none" />

                        <div className="relative p-8 flex flex-col items-center text-center">
                            {/* Icon Badge */}
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-electric-teal to-cyan-500 p-[1px] mb-6 shadow-xl animate-float">
                                <div className="w-full h-full rounded-[23px] bg-black flex items-center justify-center">
                                    <Rocket size={32} className="text-electric-teal drop-shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                                </div>
                            </div>

                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
                                <span className="animate-liquid-text">Be4L</span> <br />
                                <span className="text-xs font-black bg-white/10 text-white px-2 py-0.5 rounded-md border border-white/10 ml-1 vertical-middle inline-block not-italic animate-liquid-text">BETA</span>
                            </h2>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 border-b border-white/5 pb-6 w-full">
                                Campus Pre-Launch Access
                            </p>

                            <div className="space-y-4 mb-8 text-left w-full">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <ShieldCheck size={20} className="text-electric-teal shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">First 100 User</h4>
                                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                                            You are officially one of the first 100 members. Your early Aura reputation is being tracked.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-electric-teal/5 border border-electric-teal/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-electric-teal/5 animate-pulse" />
                                    <Gift size={20} className="text-electric-teal shrink-0 mt-0.5 relative z-10" />
                                    <div className="relative z-10">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">Launch Airdrop</h4>
                                        <p className="text-[10px] text-gray-300 leading-relaxed font-medium">
                                            Create your account now to be eligible for the <span className="text-electric-teal italic font-black">Aura Airdrop</span> on full launch.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[9px] text-gray-600 mb-6 italic leading-relaxed px-4">
                                "This is a preview build. Features are limited. Full ecosystem unlocks this Friday."
                            </p>

                            <button
                                onClick={handleDismiss}
                                className="w-full py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-electric-teal transition-all active:scale-95 shadow-xl hover:shadow-electric-teal/20"
                            >
                                Enter Be4L
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
