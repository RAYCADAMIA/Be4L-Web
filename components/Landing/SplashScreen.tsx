import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Camera, MessageCircle, Zap } from 'lucide-react';
import { Starfield } from './LandingComponents';

interface SplashScreenProps {
    onComplete: () => void;
}

const DEBRIS_COUNT = 16;
const DEBRIS_ICONS = [
    { icon: Compass, label: 'Quest' },
    { icon: Camera, label: 'Lore' },
    { icon: MessageCircle, label: 'Chat' },
    { icon: Zap, label: 'Dibs' }
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'logo' | 'brand' | 'warp'>('logo');

    const debris = useMemo(() => {
        return Array.from({ length: DEBRIS_COUNT }).map((_, i) => ({
            id: i,
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            scale: 0.3 + Math.random() * 0.7,
            delay: Math.random() * 2,
            icon: DEBRIS_ICONS[i % DEBRIS_ICONS.length].icon,
            color: i % 4 === 0 ? '#2DD4BF' : i % 4 === 1 ? '#06B6D4' : i % 4 === 2 ? '#10B981' : '#8B5CF6',
            rotate: Math.random() * 360
        }));
    }, []);

    useEffect(() => {
        // SplashScreen transition is now managed by AnimationOrchestrator
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent overflow-hidden">
            <Starfield />

            {/* Warp Debris Field */}
            <div className="absolute inset-0 z-0 pointer-events-none">
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
                            opacity: phase === 'logo' ? [0, 0.8, 0.5] : 0,
                            scale: phase === 'logo' ? [item.scale, item.scale * 1.5, item.scale] : item.scale,
                            x: phase === 'logo' ? `${item.x * 0.8}vw` : `${item.x}vw`,
                            y: phase === 'logo' ? `${item.y * 0.8}vh` : `${item.y}vh`,
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: item.delay,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 rounded-[1.5rem] bg-white/[0.05] border border-white/10 backdrop-blur-md"
                    >
                        <item.icon size={28} style={{ color: item.color }} className="opacity-80" />
                    </motion.div>
                ))}
            </div>

            <div className="relative flex flex-col items-center z-10 w-full animate-pulse-slow">
                {/* Logo Section - Keeping the Heartbeat/Logo Graphic but REMOVING text */}
                <div className="relative w-96 h-96 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {(phase === 'logo' || phase === 'brand' || phase === 'warp') && (
                            <motion.div
                                key="logo-main"
                                layoutId="main-logo-graphic"
                                className="w-48 h-48 relative flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <svg viewBox="0 0 24 24" className="w-full h-full text-electric-teal fill-current filter drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                                    <motion.path
                                        d="M12 2C12 8 16 12 22 12C16 12 12 16 12 22C12 16 8 12 2 12C8 12 12 8 12 2Z"
                                        stroke="currentColor"
                                        strokeWidth="0.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        initial={{ pathLength: 0, opacity: 0, fillOpacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1, fillOpacity: 1 }}
                                        transition={{
                                            pathLength: { duration: 1.5, ease: "easeInOut" },
                                            fillOpacity: { delay: 1, duration: 0.5 }
                                        }}
                                    />
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* NO TEXT HERE - Text is in AnimationOrchestrator/PersistentLogo */}
            </div>
        </div>
    );
};
