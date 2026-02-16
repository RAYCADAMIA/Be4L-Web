import React from 'react';
import { motion } from 'framer-motion';

// Custom Bolt SVG Path closely matching the "sharp, geometric" look
const BoltIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const FilledBoltIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        />
    </svg>
);

export const BoltLogoConcepts = () => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-24 p-8">

            {/* Concept 1: The "Power 4" Integration */}
            <div className="flex flex-col items-center gap-4">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-mono">Concept 1: Power Integration</span>
                <div className="flex items-center text-8xl font-black tracking-tighter text-white font-display italic">
                    <span>Be</span>
                    <div className="relative mx-1">
                        <motion.div
                            animate={{
                                filter: ["drop-shadow(0 0 10px rgba(45,212,191,0))", "drop-shadow(0 0 20px rgba(45,212,191,0.5))", "drop-shadow(0 0 10px rgba(45,212,191,0))"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[#2DD4BF]"
                        >
                            <FilledBoltIcon className="w-24 h-24 -rotate-12 transform scale-125" />
                        </motion.div>
                    </div>
                    <span>L</span>
                </div>
            </div>

            {/* Concept 2: The "Impulse" App Icon */}
            <div className="flex flex-col items-center gap-4">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-mono">Concept 2: The Impulse (App Icon)</span>
                <div className="relative w-32 h-32 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#2DD4BF]/20 to-transparent opacity-50" />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FilledBoltIcon className="w-20 h-20 text-[#2DD4BF] drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]" />
                    </motion.div>
                </div>
            </div>

            {/* Concept 3: The "Strike" Typography */}
            <div className="flex flex-col items-center gap-4">
                <span className="text-gray-500 text-xs uppercase tracking-widest font-mono">Concept 3: The Strike</span>
                <div className="relative text-7xl font-black tracking-tighter text-white font-display group">
                    <span className="relative z-10 mix-blend-difference">Be4L</span>
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2DD4BF] z-0"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <FilledBoltIcon className="w-32 h-32 opacity-20 rotate-45 scale-[2]" />
                    </motion.div>
                    <div className="absolute inset-0 blur-xl bg-[#2DD4BF]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
            </div>

        </div>
    );
};
