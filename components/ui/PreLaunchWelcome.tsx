import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, AlertCircle, Instagram, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

export const PreLaunchWelcome = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay adjusted to 6s to coincide with the "Be For Life -> Be4L" transition (4.5s + animation time)
        const timer = setTimeout(() => setIsVisible(true), 6000);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        window.dispatchEvent(new Event('disclaimerDismissed'));
    };

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-deep-black/60 backdrop-blur-xl pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-md rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 shadow-[0_0_80px_rgba(45,212,191,0.1)] overflow-hidden"
                    >
                        {/* Status Bar */}


                        <div className="relative p-6 md:p-8 flex flex-col items-center">
                            {/* Close Button */}
                            <button
                                onClick={handleDismiss}
                                aria-label="Dismiss disclaimer"
                                className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-electric-teal rounded-full outline-none"
                            >
                                <X size={20} aria-hidden="true" />
                            </button>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-teal/10 border border-electric-teal/20 text-electric-teal text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                                Pre-Launch disclaimer
                            </div>

                            <h2 className="text-3xl font-black font-fui uppercase tracking-tighter mb-3 text-center">
                                <span className="animate-liquid-text">Pre-Launch Access</span>
                            </h2>

                            <div className="space-y-3 w-full">
                                {/* Warning Box */}
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-3">
                                    <div className="flex items-center gap-3 text-electric-teal">
                                        <AlertCircle size={18} />
                                        <h3 className="text-[11px] font-black uppercase tracking-widest leading-none">Beta Testing</h3>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                        You are exploring a <span className="text-white">mock up version</span> of the platform. Core features like <span className="animate-liquid-text font-black">Dibs</span> and <span className="animate-liquid-text font-black">Quests</span> currently utilize mock data for demonstration purposes. <br />
                                        <span className="text-white/60">Some features may not work yet.</span>
                                    </p>
                                </div>

                                {/* Timer/Info Box */}
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-3">
                                    <div className="flex items-center gap-3 text-cyan-400">
                                        <Rocket size={18} />
                                        <h3 className="text-[11px] font-black uppercase tracking-widest leading-none">
                                            <span className="brand-text-dusk">MVP Launch: March 30, 2026</span>
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                        The full ecosystem with real-time functionality drops on March 30, 2026. <span className="text-white">Accounts created before launch will receive Aura Points.</span>
                                    </p>
                                </div>

                                {/* IG Integration */}
                                <a
                                    href="https://www.instagram.com/be4l.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Follow Be4L on Instagram"
                                    className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr from-[#f09433]/10 via-[#dc2743]/10 to-[#bc1888]/10 border border-white/5 group hover:border-white/20 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Instagram size={16} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                                            Follow <span className="normal-case">Be4L</span> on IG
                                        </span>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20" />
                                </a>

                                {/* Partnership Section */}
                                <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-4">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 shrink-0">
                                        In Partnership With
                                    </h3>
                                    <img
                                        src="/assets/partners_lockup.jpg"
                                        alt="Partners: AdDU and DDVentures"
                                        width={150}
                                        height={36}
                                        loading="lazy"
                                        className="h-9 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity rounded-lg"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="w-full py-4 mt-6 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-electric-teal hover:text-black hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] focus-visible:ring-2 focus-visible:ring-electric-teal outline-none cursor-pointer relative z-[100]"
                            >
                                <span className="font-black">Enter <span className="normal-case">Be4L</span></span>
                            </button>
                        </div>
                    </motion.div>
                </div >
            )}
        </AnimatePresence >,
        document.body
    );
};
