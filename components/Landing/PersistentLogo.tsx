import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersistentLogoProps {
    viewState: 'splash' | 'hero';
    expanded: boolean;
}

export const PersistentLogo: React.FC<PersistentLogoProps> = ({ viewState, expanded }) => {
    // We use a layoutId on the container to smoothly animate position changes
    // while keeping the element persistent in the component tree.
    return (
        <motion.div
            layout
            aria-hidden="true"
            className={`flex flex-col items-center justify-start font-black tracking-tighter font-display select-none pointer-events-none will-change-transform z-[1] leading-[0.9] ${viewState === 'splash'
                ? 'fixed inset-0 text-5xl md:text-8xl pt-[72vh] md:pt-[62vh]'
                : 'absolute top-0 left-0 right-0 pt-[25vh] md:pt-[22vh] text-6xl md:text-[8rem] lg:text-[12rem]'
                }`}
            initial={false}
            animate={{
                scale: 1,
                y: 0
            }}
            transition={{
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1]
            }}
        >
            {/* 
                We need a wrapper that acts as the "flex items-center" from the original code using layout 
                to handle the width changes of children smoothly.
             */}
            <motion.div
                layout
                animate={{ gap: expanded ? "0.04em" : "-0.05em" }}
                className="flex items-center justify-center h-min"
            >
                {/* 'Be' moves naturally */}
                <motion.span layout className="animate-liquid-text !pr-0 leading-none">Be</motion.span>

                {/* The Morph Container - This pushes neighbors smoothly */}
                <div className="relative flex items-center justify-center">
                    {/* The '4' fades out */}
                    <motion.span
                        layoutId="num-4"
                        animate={{
                            opacity: expanded ? 0 : 1,
                            scale: expanded ? 0.8 : 1,
                            position: expanded ? "absolute" : "relative"
                        }}
                        className="animate-liquid-text !pr-0 leading-none"
                    >4</motion.span>

                    {/* The 'For' expands from 0 width */}
                    <motion.span
                        layoutId="word-for"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: expanded ? "auto" : 0,
                            opacity: expanded ? 1 : 0,
                            marginInline: expanded ? "0.5rem" : "0px"
                        }}
                        className="overflow-hidden whitespace-nowrap animate-liquid-text !pr-0 leading-none"
                    >For</motion.span>
                </div>

                {/* 'Life' grows out of 'L' */}
                <div className="flex items-center relative gap-0">
                    <div className="flex items-center">
                        <motion.span layout className="animate-liquid-text !pr-0 leading-none">L</motion.span>
                        <motion.span
                            animate={{
                                width: expanded ? "auto" : 0,
                                opacity: expanded ? 1 : 0
                            }}
                            className="overflow-hidden animate-liquid-text flex leading-none !pr-0"
                        >
                            <span className="pr-4">ife</span>
                        </motion.span>
                    </div>

                    {/* Persistent BETA Tag */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: viewState === 'hero' ? 0.6 : 0,
                            scale: viewState === 'hero' ? 1 : 0.8
                        }}
                        className={`absolute left-full ml-4 md:ml-8 border border-white/10 bg-white/5 rounded-lg md:rounded-2xl px-2 md:px-4 py-1 md:py-2 text-[10px] md:text-xl font-black uppercase tracking-[0.2em] animate-liquid-text whitespace-nowrap`}
                    >
                        BETA
                    </motion.div>
                </div>
            </motion.div>

            {/* Background Halo persists through layout changes */}
            <motion.div
                layoutId="shared-logo-halo"
                className="absolute inset-0 bg-electric-teal/15 blur-[120px] rounded-full -z-10"
                initial={false}
                animate={{
                    scale: viewState === 'splash' ? [1, 1.2, 1] : 1.1,
                    opacity: viewState === 'splash' ? [0.2, 0.4, 0.2] : 0.3
                }}
                transition={{
                    scale: { duration: 3, repeat: Infinity },
                    opacity: { duration: 3, repeat: Infinity }
                }}
            />
        </motion.div>
    );
};
