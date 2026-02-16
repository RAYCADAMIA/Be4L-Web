import React from 'react';
import { motion } from 'framer-motion';

// Custom 4-Point Star SVG Path
// Designed to match the "soft but geometric" look of the reference
const StarIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* A 4-point star with slightly curved inner radiuses for that "sparkle" look */}
        <path
            d="M12 2C12 8 16 12 22 12C16 12 12 16 12 22C12 16 8 12 2 12C8 12 12 8 12 2Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const FilledStarIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 2C12 8 16 12 22 12C16 12 12 16 12 22C12 16 8 12 2 12C8 12 12 8 12 2Z"
        />
    </svg>
);

export const StarLogoConcepts = () => {
    return (
        <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center gap-24 p-8 overflow-hidden font-display relative">

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#2DD4BF] opacity-[0.05] blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#A855F7] opacity-[0.05] blur-[150px] rounded-full" />
            </div>

            {/* Concept 1: The App Icon (Minimalist) */}
            <div className="flex flex-col items-center gap-6 z-10 w-full max-w-md">
                <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-mono">Concept 01 · The Spark Icon</span>

                <div className="relative group cursor-pointer">
                    {/* Glass Container */}
                    <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl transition-all duration-500 group-hover:border-[#2DD4BF]/30 group-hover:shadow-[0_0_50px_-10px_rgba(45,212,191,0.3)]">

                        {/* The Star */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                        >
                            <StarIcon className="w-16 h-16 text-[#2DD4BF] drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />

                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-[#2DD4BF] opacity-20 blur-xl" />
                        </motion.div>

                    </div>

                    {/* Label */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white font-bold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                        Be4L
                    </div>
                </div>
            </div>


            {/* Concept 2: Typography Integration (The "Be-Star-Life") */}
            <div className="flex flex-col items-center gap-6 z-10 w-full">
                <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-mono">Concept 02 · Integrated Mark</span>

                <div className="flex items-center text-7xl md:text-9xl font-black tracking-tighter text-white italic relative">
                    <span>Be</span>

                    {/* The Star replacing the '4' */}
                    <div className="relative mx-2 md:mx-4 flex items-center justify-center h-[0.8em] w-[0.8em]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <FilledStarIcon className="w-full h-full text-[#2DD4BF]" />
                        </motion.div>

                        {/* Static center punch-out effect or overlay */}
                        <div className="absolute inset-0 bg-[#2DD4BF] blur-[40px] opacity-20" />
                    </div>

                    <span>L</span>
                </div>
            </div>


            {/* Concept 3: Dynamic Accent (Brand Header Style) */}
            <div className="flex flex-col items-center gap-6 z-10 w-full">
                <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-mono">Concept 03 · Dynamic Accent</span>

                <div className="relative">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 italic">
                        Be4L
                    </h1>

                    {/* Floating Star Accent */}
                    <motion.div
                        className="absolute -top-8 -right-8 text-[#2DD4BF]"
                        animate={{
                            y: [-10, 10, -10],
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FilledStarIcon className="w-12 h-12" />
                    </motion.div>
                </div>
            </div>

        </div>
    );
};
