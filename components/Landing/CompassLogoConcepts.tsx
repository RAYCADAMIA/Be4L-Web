import React from 'react';
import { motion } from 'framer-motion';

// Variation 1: The Classic Needle
// A sharp, vertically elongated diamond shape, exactly like the reference but isolated.
const CompassNeedleClassic = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Top Point */}
        <path d="M12 2L14 12H10L12 2Z" fill="currentColor" />
        {/* Bottom Point - Slightly longer for that 'compass' weighting */}
        <path d="M12 22L14 12H10L12 22Z" fill="currentColor" fillOpacity="0.7" />
        {/* Center Pivot */}
        <circle cx="12" cy="12" r="1.5" className="text-black" fill="currentColor" />
    </svg>
);

// Variation 2: The North Star Hybrid
// Blends the needle with a subtle horizontal cross-guard, giving it a "star" feel without being a full star.
const CompassNeedleHybrid = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Vertical Needle */}
        <path d="M12 1L13.5 10H10.5L12 1Z" />
        <path d="M12 23L13.5 14H10.5L12 23Z" fillOpacity="0.7" />

        {/* Horizontal Guards (Subtle) */}
        <path d="M23 12L14 13.5V10.5L23 12Z" fillOpacity="0.5" />
        <path d="M1 12L10 13.5V10.5L1 12Z" fillOpacity="0.5" />

        {/* Center Diamond */}
        <rect x="11" y="11" width="2" height="2" transform="rotate(45 12 12)" fill="white" />
    </svg>
);

// Variation 3: The Modern Stencil
// A split, tech-forward look where the needle is segmented, implying precision and "future".
const CompassNeedleStencil = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Split Upper Needle */}
        <path d="M12 2L15 11H12.5L12 2Z" />
        <path d="M12 2L9 11H11.5L12 2Z" fillOpacity="0.5" />

        {/* Split Lower Needle */}
        <path d="M12 22L15 13H12.5L12 22Z" />
        <path d="M12 22L9 13H11.5L12 22Z" fillOpacity="0.5" />
    </svg>
);

export const CompassLogoConcepts = () => {
    return (
        <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center gap-24 p-8 overflow-hidden font-display relative">

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#2DD4BF] opacity-[0.03] blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-white opacity-[0.02] blur-[100px] rounded-full" />

                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
            </div>

            {/* Concept 1: The Classic Needle */}
            <div className="flex flex-col items-center gap-8 z-10 w-full max-w-md group">
                <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-mono group-hover:text-[#2DD4BF] transition-colors">Variation 01 · The Navigator</span>

                <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-[#2DD4BF] blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity duration-700" />

                    <motion.div
                        animate={{
                            rotate: [0, 5, -5, 0],
                            y: [0, -10, 0]
                        }}
                        transition={{
                            rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative z-10"
                    >
                        <CompassNeedleClassic className="w-48 h-48 text-[#2DD4BF] drop-shadow-[0_0_30px_rgba(45,212,191,0.4)]" />
                    </motion.div>
                </div>

                <div className="text-2xl font-bold tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">
                    Be<span className="text-[#2DD4BF]">4</span>L
                </div>
            </div>


            {/* Concept 2: The North Star Hybrid */}
            <div className="flex flex-col items-center gap-8 z-10 w-full max-w-md group">
                <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-mono group-hover:text-[#2DD4BF] transition-colors">Variation 02 · North Star</span>

                <div className="relative">
                    <motion.div
                        className="absolute inset-0 bg-[#2DD4BF] blur-[40px] opacity-5 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative z-10"
                    >
                        <CompassNeedleHybrid className="w-40 h-40 text-white group-hover:text-[#2DD4BF] transition-colors duration-500" />
                    </motion.div>
                </div>
            </div>


            {/* Concept 3: The Modern Stencil */}
            <div className="flex flex-col items-center gap-8 z-10 w-full max-w-md group">
                <span className="text-gray-500 text-xs uppercase tracking-[0.3em] font-mono group-hover:text-[#2DD4BF] transition-colors">Variation 03 · Future Stencil</span>

                <div className="relative">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror", repeatDelay: 4 }}
                        className="relative z-10"
                    >
                        <CompassNeedleStencil className="w-32 h-32 text-[#2DD4BF]" />
                    </motion.div>

                    {/* Glitch/Echo effect */}
                    <div className="absolute inset-0 text-[#2DD4BF] opacity-30 blur-sm translate-x-1" aria-hidden="true">
                        <CompassNeedleStencil className="w-32 h-32" />
                    </div>
                </div>
            </div>

        </div>
    );
};
