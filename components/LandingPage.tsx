import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from './Landing/SplashScreen';
import { HeroSection } from './Landing/HeroSection';
import { VisionSection } from './Landing/VisionSection';
import { PhoneShowcaseSection } from './Landing/PhoneShowcaseSection';
import { RoadmapSection } from './Landing/RoadmapSection';
import { FeatureShowcase } from './Landing/FeatureShowcase';
import { PartnerPitch, UserCTA, HUDMenu, Starfield, TeamRecruitment, PoweredBy } from './Landing/LandingComponents';
import { AuthScreen } from './AuthScreen';

export const LandingPage: React.FC<{ bypassSplash?: boolean; onReset?: () => void }> = ({ bypassSplash = false, onReset }) => {
    const [showSplash, setShowSplash] = useState(!bypassSplash);
    const [showAuth, setShowAuth] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {showSplash ? (
                <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
            ) : (
                <motion.div
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative w-full flex flex-col min-h-screen text-white selection:bg-electric-teal/30"
                >
                    <Starfield />
                    <HUDMenu onJoinClick={() => setShowAuth(true)} isScrolled={scrolled} onReset={onReset} />

                    <main className="relative">
                        <HeroSection onJoinClick={() => setShowAuth(true)} />

                        <UserCTA onJoinClick={() => setShowAuth(true)} />

                        {/* 3D Phone Showcase Section */}
                        <div id="phone-showcase">
                            <PhoneShowcaseSection />
                        </div>

                        <div id="vision">
                            <VisionSection />
                        </div>

                        <div id="features">
                            <FeatureShowcase />
                        </div>

                        <div id="roadmap">
                            <RoadmapSection />
                        </div>

                        <PartnerPitch />
                        <TeamRecruitment />
                        <PoweredBy />
                    </main>

                    {/* Footer - Precise Horizontal Layout (Matching Image 5) */}
                    <footer className="relative py-24 px-6 border-t border-white/5 bg-black/40">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-row flex-wrap md:flex-nowrap items-start justify-between gap-12 md:gap-24">
                                {/* 1. Brand Section */}
                                <div className="space-y-8 min-w-[280px]">
                                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-electric-teal/40 transition-all shadow-lg shadow-black/20">
                                            <svg viewBox="0 0 200 100" className="w-7 h-7">
                                                <defs>
                                                    <linearGradient id="footerLogoGradientV2" x1="0%" y1="0%" x2="200%" y2="0%">
                                                        <stop offset="0%" stopColor="#2dd4bf" />
                                                        <stop offset="50%" stopColor="#a855f7" />
                                                        <stop offset="100%" stopColor="#2dd4bf" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M100,30 C100,30 90,10 70,10 C50,10 40,30 40,50 C40,75 100,90 100,90 C100,90 160,75 160,50 C160,30 150,10 130,10 C110,10 100,30 100,30 Z" fill="url(#footerLogoGradientV2)" />
                                            </svg>
                                        </div>
                                        <span className="text-3xl font-black tracking-tighter font-display text-white transition-all group-hover:text-electric-teal flex items-center gap-2">
                                            Be4L
                                            <span className="text-[10px] font-black uppercase tracking-widest text-electric-teal/50">Beta</span>
                                        </span>
                                    </div>
                                    <p className="text-cool-grey text-base font-medium leading-[1.8] max-w-xs opacity-70 italic font-sans">
                                        The OS for life, love, lore, and lark. Join the giant friend group.
                                    </p>
                                    <div className="flex gap-4">
                                        {['IG', 'TW', 'TK'].map(social => (
                                            <a key={social} href="#" className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-cool-grey hover:text-white hover:border-white/20 transition-all hover:-translate-y-1">
                                                <div className="w-5 h-5 rounded-full bg-current opacity-20" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Link Columns Group - Fixed Horizontal side-by-side */}
                                <div className="flex gap-16 md:gap-32">
                                    {/* 2. Platform Column */}
                                    <div className="space-y-8">
                                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/50 font-display">Platform</h4>
                                        <ul className="space-y-4">
                                            <li><a href="/about" className="text-sm font-bold text-cool-grey hover:text-white transition-colors block">About</a></li>
                                            <li><a href="/partner" className="text-sm font-bold text-cool-grey hover:text-white transition-colors block">Partner</a></li>
                                            <li><a href="#vision" className="text-sm font-bold text-cool-grey hover:text-white transition-colors block">Vision</a></li>
                                        </ul>
                                    </div>

                                    {/* 3. Legal Column */}
                                    <div className="space-y-8">
                                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/50 font-display">Legal</h4>
                                        <ul className="space-y-4">
                                            <li><a href="/privacy" className="text-sm font-bold text-cool-grey hover:text-white transition-colors block">Privacy Policy</a></li>
                                            <li><a href="/terms" className="text-sm font-bold text-cool-grey hover:text-white transition-colors block">Terms of Service</a></li>
                                            <li><a href="#" className="text-sm font-bold text-cool-grey hover:text-white transition-colors block">Cookie Policy</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] font-fui">
                                    BE4L | PLATFORM | LEGAL
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-widest font-fui">
                                    © 2026 BE4L MISSION CONTROL. ALL SYSTEMS GO.
                                </p>
                            </div>
                        </div>
                    </footer>

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
                                    <AuthScreen onClose={() => setShowAuth(false)} />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <style>{`
                        html {
                            scroll-behavior: smooth;
                        }
                        body {
                            background-color: #05050A;
                        }
                    `}</style>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
};

export default LandingPage;
