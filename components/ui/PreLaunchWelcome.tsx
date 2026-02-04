import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, AlertCircle, Instagram, ChevronRight } from 'lucide-react';

export const PreLaunchWelcome = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay adjusted to 6s to coincide with the "Be For Life -> Be4L" transition (4.5s + animation time)
        const timer = setTimeout(() => setIsVisible(true), 6000);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-deep-black/60 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-md rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 shadow-[0_0_80px_rgba(45,212,191,0.1)] overflow-hidden"
                    >
                        {/* Status Bar */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-electric-teal via-cyan-500 to-electric-teal animate-liquid-text" />

                        <div className="relative p-8 md:p-10 flex flex-col items-center">
                            {/* Close Button */}
                            <button
                                onClick={handleDismiss}
                                className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-teal/10 border border-electric-teal/20 text-electric-teal text-[9px] font-black uppercase tracking-[0.2em] mb-6">
                                Pre-Launch disclaimer
                            </div>

                            <h2 className="text-3xl font-black font-fui uppercase tracking-tighter mb-4 text-center">
                                <span className="animate-liquid-text">Campus <br /> Pre-Launch Access</span>
                            </h2>

                            <div className="space-y-4 w-full">
                                {/* Warning Box */}
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                                    <div className="flex items-center gap-3 text-electric-teal">
                                        <AlertCircle size={18} />
                                        <h4 className="text-[11px] font-black uppercase tracking-widest leading-none">Beta Testing</h4>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                        You are exploring a <span className="text-white">mock up version</span> of the platform. Core features like <span className="animate-liquid-text font-black italic">Dibs</span> and <span className="animate-liquid-text font-black italic">Quests</span> currently utilize mock data for demonstration purposes.
                                    </p>
                                </div>

                                {/* Timer/Info Box */}
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                                    <div className="flex items-center gap-3 text-cyan-400">
                                        <Rocket size={18} />
                                        <h4 className="text-[11px] font-black uppercase tracking-widest leading-none">
                                            <span className="animate-liquid-text">MVP Launch: Feb 6, 2026</span>
                                        </h4>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                        The full ecosystem with real-time functionality drops this Friday, Feb 6, 2026. <span className="text-white italic">Accounts created before launch will receive Aura Points.</span>
                                    </p>
                                </div>

                                {/* IG Integration */}
                                <div className="pt-2">
                                    <a
                                        href="https://www.instagram.com/be4l.app/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#f09433]/10 via-[#dc2743]/10 to-[#bc1888]/10 border border-white/5 group hover:border-white/20 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Instagram size={16} className="text-white" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                                                Follow our IG Page
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className="text-white/20" />
                                    </a>

                                    {/* Partnership Section */}
                                    <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4">
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] font-display animate-liquid-text bg-clip-text text-transparent bg-gradient-to-r from-electric-teal via-cyan-400 to-indigo-400 shrink-0">
                                            In Partnership With
                                        </h3>
                                        <img
                                            src="/assets/partners_lockup.jpg"
                                            alt="Partners: AdDU and DDVentures"
                                            className="h-9 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="w-full py-4 mt-8 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-electric-teal transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                            >
                                <span className="animate-liquid-text text-black">Enter Be4L</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
