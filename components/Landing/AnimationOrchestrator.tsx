import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { SplashScreen } from './SplashScreen';
import { PersistentLogo } from './PersistentLogo';
import { LandingPage } from '../LandingPage'; // We need to refactor LandingPage to be a child or handle content

// IMPORTANT: We need to restructure how LandingPage works. 
// Currently LandingPage contains HeroSection etc.
// The AnimationOrchestrator will essentially WRAP the transition.

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
        <div className="relative w-full min-h-screen overflow-x-hidden">
            {/* The Single Persistent Logo */}
            <motion.div
                style={{
                    opacity: viewState === 'hero' ? logoOpacity : 1,
                    scale: viewState === 'hero' ? logoScale : 1
                }}
                className="pointer-events-none"
            >
                <PersistentLogo viewState={viewState} expanded={expanded} />
            </motion.div>
            {/* Splash Background & Debris (Unmounts when viewState changes to hero? Or just fades out?)
                Actually, the user request says: "The SplashScreen component now only contains the black background overlay and the heartbeat pulse."
                We should probably fade it out as the logo moves.
            */}
            <AnimatePresence>
                {viewState === 'splash' && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[90]" // Below logo (z-100), above content
                    >
                        <SplashScreen onComplete={() => { }} />
                        {/* onComplete is effectively handled by our internal timers now, 
                            but we keep the prop to satisfy interface or for internal phases if needed */}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content (Hero, Vision, etc) */}
            {/* We render it behind the logo. It should fade in as logo moves. */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="relative"
            >
                {/* We render LandingPage content directly here or import it. 
                    Since LandingPage currently handles its own splash state, we need to bypass that.
                    We will modify LandingPage to accept a "skipSplash" prop or just render its children.
                */}
                <LandingPageContent bypassSplash={true} onReset={reset} />
            </motion.div>
        </div>
    );
};

import { LandingPage as LandingPageContent } from '../LandingPage';
