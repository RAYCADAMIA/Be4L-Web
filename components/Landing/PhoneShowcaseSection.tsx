import React, { useState, useEffect } from 'react';
import { HeroPhoneShowcase } from './HeroPhoneShowcase'; // Updated import
import { motion, AnimatePresence } from 'framer-motion';
import { WaitlistModal } from './WaitlistModal';

export const PhoneShowcaseSection: React.FC = () => {
    const [showFullText, setShowFullText] = useState(false);
    const [showWaitlist, setShowWaitlist] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowFullText(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full py-12 md:py-20 bg-gradient-to-b from-deep-black via-deep-black/95 to-deep-black overflow-hidden flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full flex flex-col items-center gap-12 relative z-10">

                {/* Hero Phone Showcase (Centered) */}
                <div className="w-full flex justify-center">
                    <HeroPhoneShowcase />
                </div>

                {/* Text Content (Moved Below or Adjusted) - User asked to "overwrite existing Hero component" but kept constraints ambiguous regarding text. 
                    Given the visual goal is "Horizontal layout... floating over background", keeping text below or integrated feels right if this section is standalone.
                    However, usually Hero has text. Steps below preserve the text but adapt layout to be less 'split grid' if phones are horizontal row.
                    The 'StudyGenie' reference typically has phones as the main visual.
                    I will stack them: Phones then Text or Text then Phones.
                    Usually Text -> Phones for Hero.
                    But user said "Rebuild Hero Phone Showcase component".
                    I'll keep the text but layouts column-wise since phones are wide.
                */}

                <div className="flex flex-col items-center text-center max-w-2xl px-6">
                    <div className="h-16 md:h-20 relative flex items-center justify-center mb-6">
                        <AnimatePresence mode="wait">
                            <motion.h2
                                key={showFullText ? "full" : "short"}
                                initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="text-4xl md:text-6xl font-black tracking-tighter font-display animate-liquid-text leading-[0.9]"
                            >
                                <span className="flex items-center gap-3">
                                    {showFullText ? "Be for Life" : "Be4L"}
                                    <span className="text-xs md:text-lg font-black bg-white/5 px-2 py-0.5 rounded-md border border-white/10 animate-liquid-text opacity-70">BETA</span>
                                </span>
                            </motion.h2>
                        </AnimatePresence>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="space-y-2 mb-8"
                    >
                        <p className="text-cool-grey text-base md:text-xl font-medium leading-relaxed">
                            An OBX-inspired platform for the lore you’ve yet to live.
                        </p>
                    </motion.div>

                    {/* App Store Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => setShowWaitlist(true)}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                            </svg>
                            <span className="text-sm font-bold text-white font-display">App Store</span>
                        </button>
                        <button
                            onClick={() => setShowWaitlist(true)}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <svg viewBox="0 0 512 512" className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform">
                                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                            </svg>
                            <span className="text-sm font-bold text-white font-display">Google Play</span>
                        </button>
                    </div>
                </div>

            </div>
            <WaitlistModal isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} />
        </section>
    );
};
