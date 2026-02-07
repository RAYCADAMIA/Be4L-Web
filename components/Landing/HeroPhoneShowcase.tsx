import React from 'react';
import { motion } from 'framer-motion';

// Asset Paths
const SCREENS = {
    QUEST: '/assets/screens/quest_screen.png',
    DIBS: '/assets/screens/dibs_screen.png',
    ECHO: '/assets/screens/echo_screen.png',
};

interface PhoneProps {
    src: string;
    alt: string;
    className?: string;
    isCenter?: boolean;
}

const PhoneFrame: React.FC<PhoneProps> = ({ src, alt, className = "", isCenter = false }) => {
    return (
        <motion.div
            style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitFontSmoothing: 'subpixel-antialiased'
            }}
            whileHover={!isCenter ? { scale: 0.95, y: -10 } : undefined}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`
                relative rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden bg-black
                border-[3px] md:border-[8px] border-zinc-900 shadow-[0_10px_20px_rgba(0,0,0,0.5)] md:shadow-[0_20px_40px_rgba(0,0,0,0.5)]
                flex-shrink-0
                ${isCenter
                    ? 'w-[110px] md:w-[220px] scale-110 shadow-[0_20px_40px_rgba(0,0,0,0.8)] md:shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-20'
                    : 'w-[90px] md:w-[190px] scale-90 opacity-90 hover:opacity-100 z-10'
                }
                ${className}
            `}
        >
            {/* Screen Content */}
            <div className="relative w-full h-full bg-zinc-900">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    loading="eager"
                />

                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
            </div>

            {/* Notch / Dynamic Island Placeholder */}
            {isCenter && (
                <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 w-12 md:w-24 h-3 md:h-7 bg-black rounded-full z-20 pointer-events-none border border-zinc-800/50" />
            )}
        </motion.div>
    );
};

export const HeroPhoneShowcase: React.FC = () => {
    return (
        <div className="w-full relative flex flex-row items-center justify-center gap-3 md:gap-12 py-10 md:py-20 isolate">
            {/* Left Phone (Dibs) */}
            <div className="relative hover:z-30 transition-all duration-300">
                <PhoneFrame src={SCREENS.DIBS} alt="Dibs Screen" />
            </div>

            {/* Center Phone (Quest - Main) */}
            <div className="relative z-20">
                <PhoneFrame src={SCREENS.QUEST} alt="Quest Screen" isCenter />
            </div>

            {/* Right Phone (Echo) */}
            <div className="relative hover:z-30 transition-all duration-300">
                <PhoneFrame src={SCREENS.ECHO} alt="Echo Screen" />
            </div>
        </div>
    );
};
