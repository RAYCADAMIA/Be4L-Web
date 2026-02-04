import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Zap, MapPin, Camera } from 'lucide-react';

interface SplashScreenProps {
    onComplete: () => void;
}

const DEBRIS_COUNT = 12;

const DEBRIS_ICONS = [Compass, Zap, MapPin, Camera];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'heartbeat' | 'logo' | 'brand' | 'warp'>('heartbeat');

    const debris = useMemo(() => {
        return Array.from({ length: DEBRIS_COUNT }).map((_, i) => ({
            id: i,
            x: Math.random() * 200 - 100, // wider field
            y: Math.random() * 200 - 100,
            scale: 0.3 + Math.random() * 0.7,
            delay: Math.random() * 2,
            icon: DEBRIS_ICONS[i % DEBRIS_ICONS.length],
            color: i % 3 === 0 ? '#2DD4BF' : i % 3 === 1 ? '#10B981' : '#06B6D4',
            rotate: Math.random() * 360
        }));
    }, []);

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase('logo'), 600);
        // We only care about background phases now
        // The text is managed externally by AnimationOrchestrator

        return () => {
            clearTimeout(timer1);
        };
    }, []);

    const warpTransition = {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1]
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05050A] overflow-hidden">
            {/* Warp Debris Field */}
            <div className="absolute inset-0 z-0">
                {debris.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{
                            x: `${item.x}vw`,
                            y: `${item.y}vh`,
                            scale: item.scale,
                            opacity: 0,
                            rotate: item.rotate
                        }}
                        animate={{
                            opacity: phase === 'logo' ? 0.4 : 0, // Fade in with logo
                            scale: item.scale,
                            x: `${item.x}vw`,
                            y: `${item.y}vh`,
                        }}
                        transition={{ duration: 1.2 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-md"
                    >
                        <item.icon size={32} style={{ color: item.color }} className="opacity-80" />
                    </motion.div>
                ))}
            </div>

            <div className="relative flex flex-col items-center z-10 w-full animate-pulse-slow">
                {/* Logo Section - Keeping the Heartbeat/Logo Graphic but REMOVING text */}
                <div className="relative w-96 h-96 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {(phase === 'heartbeat') && (
                            <motion.svg
                                key="heartbeat-line"
                                viewBox="0 0 200 100"
                                className="w-full h-auto max-w-sm"
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <motion.path
                                    d="M0,50 L40,50 L50,20 L70,80 L80,50 L120,50 L130,20 L150,80 L160,50 L200,50"
                                    fill="transparent"
                                    stroke="url(#pulse-gradient)"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.2, ease: "linear" }}
                                />
                                <defs>
                                    <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#2DD4BF" />
                                        <stop offset="50%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#06B6D4" />
                                    </linearGradient>
                                </defs>
                            </motion.svg>
                        )}

                        {(phase === 'logo' || phase === 'brand' || phase === 'warp') && (
                            <motion.div
                                key="logo-main"
                                layoutId="main-logo-graphic"
                                // Renamed layoutId to avoid conflict if we ever want to move this too
                                // But honestly, the brief says ONLY text persists. Graphic stays on splash?
                                // "The SplashScreen component now only contains the black background overlay and the heartbeat pulse."
                                // So we keep the graphic here.
                                className="w-48 h-48 relative flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <svg viewBox="0 0 200 100" className="w-full h-full text-electric-teal fill-current filter drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                                    <motion.path
                                        d="M100,30 C100,30 90,10 70,10 C50,10 40,30 40,50 C40,75 100,90 100,90 C100,90 160,75 160,50 C160,30 150,10 130,10 C110,10 100,30 100,30 Z"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 1.5 }}
                                    />
                                </svg>
                                {/* Glowing halo */}
                                <motion.div
                                    className="absolute inset-x-0 inset-y-10 bg-electric-teal/20 blur-[80px] rounded-full -z-10"
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* NO TEXT HERE - Text is in AnimationOrchestrator/PersistentLogo */}
            </div>
        </div>
    );
};
