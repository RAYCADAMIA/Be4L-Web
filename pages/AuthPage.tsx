import React, { useState, useEffect } from 'react';
import { AuthBox } from '../components/Auth/AuthBox';
import { HeroPhoneShowcase } from '../components/Landing/HeroPhoneShowcase';
import { Starfield, LogoEvolution } from '../components/Landing/LandingComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const [showFullText, setShowFullText] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowFullText(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full bg-transparent flex items-center justify-center overflow-hidden p-4 md:p-6 lg:p-8">
            <div className="pointer-events-none">
                <Starfield />
            </div>


            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 w-full max-w-[1180px] h-[95vh] lg:h-[90vh] max-h-[750px] flex items-center justify-center"
            >
                {/* Visual Glass Modal */}
                <div className="w-full h-full bg-[#09090B]/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row items-stretch">

                    {/* 3. Left Visual Showcase / Mobile Top Header */}
                    <div className="flex-none lg:flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-transparent touch-none py-8 lg:py-0">
                        {/* Grid - Desktop Only */}
                        <div className="absolute inset-0 opacity-[0.003] pointer-events-none hidden lg:block"
                            style={{
                                backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}
                        />

                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full lg:pt-28 lg:pl-12">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center h-20 lg:h-24 flex flex-col justify-center items-center gap-2 mb-0"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.h1
                                        key={showFullText ? "full" : "short"}
                                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        className="text-4xl md:text-5xl font-black font-display tracking-[-0.05em] leading-[0.9] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] text-gradient-static pr-2"
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            {showFullText ? "Be for Life" : "Be4L"}
                                            <span className="text-[8px] md:text-[10px] font-black bg-white/5 px-2 py-0.5 rounded-md border border-white/10 opacity-70 text-gradient-static pr-1">BETA</span>
                                        </span>
                                    </motion.h1>
                                </AnimatePresence>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60 drop-shadow-sm mt-4">Chase the Lore</p>
                            </motion.div>

                            {/* Shrunk Phone Mockup Section */}
                            <div className="relative w-full hidden lg:flex items-center justify-center scale-[0.55] lg:scale-[0.65]">
                                <motion.div
                                    animate={{ x: -90, opacity: 0.1, rotate: -15, scale: 0.8 }}
                                    className="absolute z-0 blur-[8px]"
                                >
                                    <HeroPhoneShowcase />
                                </motion.div>

                                <motion.div
                                    animate={{ x: 90, opacity: 0.1, rotate: 15, scale: 0.8 }}
                                    className="absolute z-0 blur-[8px]"
                                >
                                    <HeroPhoneShowcase />
                                </motion.div>

                                <motion.div
                                    animate={{ y: 0, opacity: 1 }}
                                    className="relative z-10 scale-[0.8]"
                                >
                                    <HeroPhoneShowcase />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Right Auth Section - Focused and Compact */}
                    <div className="flex-1 flex flex-col relative items-center justify-start lg:justify-center p-4 md:p-10 lg:p-10 bg-transparent overflow-y-auto overflow-x-hidden no-scrollbar min-h-0">
                        <div className="w-full max-w-[420px] flex flex-col items-center">
                            {/* Compact Heading Removed */}

                            {/* AuthBox */}
                            {/* AuthBox Container - Ensures it fits and doesn't cut off */}
                            <div className="w-full h-auto flex flex-col items-center py-4">
                                <AuthBox hideHeader={false} />
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};
