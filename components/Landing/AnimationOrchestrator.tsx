import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { SplashScreen } from './SplashScreen';
import { PersistentLogo } from './PersistentLogo';

// Lazy Load LandingPage
const LandingPageContent = React.lazy(() => import('../LandingPage').then(module => ({ default: module.LandingPage })));

interface AnimationOrchestratorProps {
    children?: React.ReactNode;
}

export const AnimationOrchestrator: React.FC<AnimationOrchestratorProps> = () => {
    const [viewState, setViewState] = useState<'splash' | 'hero'>('splash');
    const [expanded, setExpanded] = useState(true); // Start fully expanded ("Be For Life")
    const [showContent, setShowContent] = useState(false);
    const { scrollY } = useScroll();

    // Fade out logo as we scroll past hero (0 to 600px)
    const logoOpacity = useTransform(scrollY, [0, 600], [1, 0]);
    const logoScale = useTransform(scrollY, [0, 600], [1, 0.8]);
    const moveTimerRef = React.useRef<any>();
    const shrinkTimerRef = React.useRef<any>();

    const reset = () => {
        if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
        if (shrinkTimerRef.current) clearTimeout(shrinkTimerRef.current);

        window.scrollTo({ top: 0, behavior: 'instant' });
        setViewState('splash');
        setExpanded(true);
        setShowContent(false);

        moveTimerRef.current = setTimeout(() => {
            setViewState('hero');
            setShowContent(true);
        }, 2500);

        shrinkTimerRef.current = setTimeout(() => {
            setExpanded(false);
        }, 4500);
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        moveTimerRef.current = setTimeout(() => {
            setViewState('hero');
            setShowContent(true);
        }, 2500);

        shrinkTimerRef.current = setTimeout(() => {
            setExpanded(false);
        }, 4500);

        return () => {
            if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
            if (shrinkTimerRef.current) clearTimeout(shrinkTimerRef.current);
        };
    }, []);

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Shared Background Glow (Match & Move) */}
            <motion.div
                layoutId="shared-world-glow"
                className="fixed inset-0 pointer-events-none z-0"
                initial={false}
                animate={{
                    background: viewState === 'splash'
                        ? 'radial-gradient(circle at 50% 50%, rgba(45, 212, 191, 0.12) 0%, transparent 70%)'
                        : 'radial-gradient(circle at 50% 40%, rgba(45, 212, 191, 0.08) 0%, transparent 60%)',
                    scale: viewState === 'splash' ? 1 : 1.5,
                    opacity: viewState === 'splash' ? 1 : 0.6
                }}
                transition={{
                    duration: 2.5,
                    ease: [0.22, 1, 0.36, 1]
                }}
            />

            {/* The Single Persistent Logo */}
            <motion.div
                style={{
                    opacity: viewState === 'hero' ? logoOpacity : 1,
                    scale: viewState === 'hero' ? logoScale : 1
                }}
                className="relative z-50 pointer-events-none"
            >
                <PersistentLogo viewState={viewState} expanded={expanded} />
            </motion.div>
            {/* Splash Overlay Content */}
            <AnimatePresence mode="wait">
                {viewState === 'splash' && (
                    <motion.div
                        key="splash-overlay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[40]" // Below logo (z-50), above content (z-10)
                    >
                        <SplashScreen onComplete={() => { }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content (Hero, Vision, etc) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="relative"
            >
                <React.Suspense fallback={null}>
                    <LandingPageContent bypassSplash={true} onReset={reset} />
                </React.Suspense>
            </motion.div>
        </div>
    );
};
