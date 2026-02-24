import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Logo is now managed by AnimationOrchestrator

interface HeroSectionProps {
    onJoinClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onJoinClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);


    return (
        <section ref={containerRef} className="relative min-h-[75vh] w-full flex flex-col items-center justify-start overflow-hidden perspective-1000">


            {/* Content */}
            <motion.div
                style={{ y, opacity }}
                className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full pt-[25vh] md:pt-[22vh]"
            >
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    <div className="relative z-20 overflow-visible p-0 mb-8 md:mb-12">
                        {/* Invisible Placeholder to reserve layout space for PersistentLogo */}
                        <h1 className="text-6xl md:text-[8rem] lg:text-[12rem] font-black tracking-tighter leading-[0.9] font-display flex items-center justify-center select-none opacity-0">
                            Be4L
                        </h1>
                    </div>

                    {/* Updated Text per User Request */}
                    <p className="max-w-xl mx-auto text-xs md:text-base text-cool-grey font-medium leading-relaxed mb-6 font-sans tracking-wide px-4">
                        Life is too short for just the main plot. <br className="hidden md:block" />
                        Conquer <span className="brand-text-dusk font-black uppercase tracking-tighter">side quests</span>, collect lores to tell, and meet new people.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                        {/* Magnetic CTA - Optimized */}
                        <div className="relative group w-full md:w-auto px-4 md:px-0">
                            <button
                                onClick={onJoinClick}
                                className="relative w-full md:w-auto px-12 md:px-16 py-4 md:py-5 bg-white text-deep-void font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-transform font-display group overflow-hidden text-xs md:text-base shadow-2xl shadow-primary/20"
                            >
                                <span className="relative z-10 group-hover:animate-liquid-text transition-all">Start Your Quest</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-electric-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>



            {/* Scroll Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
                <motion.div
                    className="flex flex-col items-center cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    onClick={() => {
                        const nextSection = document.getElementById('vibe-check-section');
                        nextSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <div className="h-12 w-[1px] bg-white/10 overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-electric-teal"
                            animate={{ y: ["-100%", "200%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            </div>

            <style>{`
                .perspective-1000 { perspective: 1000px; transform-style: preserve-3d; }
            `}</style>
        </section>
    );
};
