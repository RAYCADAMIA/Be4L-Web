import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from './Landing/SplashScreen';
import { HeroSection } from './Landing/HeroSection';
import { VisionSection } from './Landing/VisionSection';
import { PhoneShowcaseSection } from './Landing/PhoneShowcaseSection';
import { RoadmapSection } from './Landing/RoadmapSection';
import { FeatureShowcase } from './Landing/FeatureShowcase';
import { PartnerPitch, CreatorPitch, UserCTA, HUDMenu, Starfield, TeamRecruitment, PoweredBy, HowItWorks } from './Landing/LandingComponents';
import { Footer } from './Shared/Footer';
// Lazy Load AuthScreen
const AuthScreen = React.lazy(() => import('./AuthScreen').then(module => ({ default: module.AuthScreen })));
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const LandingPage: React.FC<{ bypassSplash?: boolean; onReset?: () => void }> = ({ bypassSplash = false, onReset }) => {
    useDocumentTitle('Are you up for a side quest?');
    const [showSplash, setShowSplash] = useState(!bypassSplash && !(window as any).__hasSplashShown);
    const [showAuth, setShowAuth] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            if (y > 100) {
                setScrolled(true);
            } else if (y < 30) {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {showSplash ? (
                <SplashScreen key="splash" onComplete={() => {
                    setShowSplash(false);
                    (window as any).__hasSplashShown = true;
                }} />
            ) : (
                <motion.div
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative w-full flex flex-col min-h-screen text-white selection:bg-electric-teal/30"
                >
                    <HUDMenu onJoinClick={() => setShowAuth(true)} isScrolled={scrolled} onReset={onReset} />

                    <main className="relative">
                        <HeroSection onJoinClick={() => setShowAuth(true)} />

                        <div id="vibe-check-section" className="scroll-mt-32">
                            <UserCTA onJoinClick={() => setShowAuth(true)} />
                        </div>

                        {/* 3D Phone Showcase Section */}
                        <div id="phone-showcase">
                            <PhoneShowcaseSection />
                        </div>

                        <HowItWorks />

                        <div id="vision" className="scroll-mt-32">
                            <VisionSection />
                        </div>


                        <div id="features" className="scroll-mt-32">
                            <FeatureShowcase />
                        </div>

                        <div id="powered-by">
                            <PoweredBy />
                        </div>

{/* <div id="roadmap" className="scroll-mt-32">
                            <RoadmapSection />
                        </div> */}

                        <CreatorPitch />

                        <PartnerPitch />

                        <TeamRecruitment />
                    </main>

                    {/* Footer - Precise Horizontal Layout (Matching Image 5) */}
                    {/* Footer - Shared Component */}
                    <Footer />

                    {/* Auth Modal Overlay */}
                    <AnimatePresence>
                        {showAuth && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60"
                                onClick={() => setShowAuth(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="w-full max-w-5xl mx-4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <React.Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                                        <AuthScreen onClose={() => setShowAuth(false)} />
                                    </React.Suspense>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <style>{`
                        html {
                            scroll-behavior: smooth;
                        }
                        body {
                            background-color: transparent;
                        }
                        /* Added global scroll-margin-top for anchors */
                        [id] {
                            scroll-margin-top: 100px;
                        }
                    `}</style>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
};

export default LandingPage;
