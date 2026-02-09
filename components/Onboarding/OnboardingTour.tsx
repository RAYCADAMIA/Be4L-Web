import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseService } from '../../services/supabaseService';
import { AuraParticles } from '../Effects/AuraParticles';
import { Zap, Map, ShoppingBag, User, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Step {
    target: string;
    path: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const STEPS: Step[] = [
    {
        target: '#nav-quests',
        path: '/app/home',
        title: "Quests",
        description: "The Side Quests Engine. Join local adventures or create your own to farm Aura.",
        icon: <Map size={24} className="text-purple-400" />
    },
    {
        target: '#nav-dibs',
        path: '/app/home',
        title: "Dibs",
        description: "Access Exclusive Brands. Secure spots, tickets, and drops before they vanish..",
        icon: <ShoppingBag size={24} className="text-electric-teal" />
    },
    {
        target: '#nav-profile',
        path: '/app/home',
        title: "Profile",
        description: "Track Aura, relive your Lore, and manage your Quests & Dibs.",
        icon: <User size={24} className="text-blue-400" />
    }
];

export const OnboardingTour: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(-1); // -1 is the "Start" state
    const [isVisible, setIsVisible] = useState(false);
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const navigate = useNavigate();
    const location = useLocation();
    const [auraTrigger, setAuraTrigger] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Initial Launch Logic - Wait for Disclaimer Dismiss
    useEffect(() => {
        const handleStartTour = () => {
            if (user && !user.tour_completed) {
                // Ensure we are not already showing it
                setIsVisible(true);
            }
        };

        window.addEventListener('disclaimerDismissed', handleStartTour);

        // Safety: If disclaimer was already dismissed in this session but tour didn't start
        // (This handles cases where the tour component mounts AFTER the event)
        // For simplicity, we assume the disclaimer is shown on every refresh for now.

        return () => window.removeEventListener('disclaimerDismissed', handleStartTour);
    }, [user]);

    // Spotlight & Navigation Update
    useEffect(() => {
        if (!isVisible || currentStep < 0) return;

        const step = STEPS[currentStep];

        // Navigate if needed
        if (location.pathname !== step.path && step.path) {
            navigate(step.path);
        }

        // Calculate Spotlight Position
        const calculateSpotlight = () => {
            let element = document.querySelector(step.target);

            // Fallback for mobile if desktop nav isn't found
            if (!element) {
                element = document.querySelector(`${step.target}-mobile`);
            }

            if (element) {
                const rect = element.getBoundingClientRect();
                setSpotlightStyle({
                    top: rect.top + rect.height / 2,
                    left: rect.left + rect.width / 2,
                    width: rect.width + 16,
                    height: rect.height + 16,
                    borderRadius: getComputedStyle(element).borderRadius || '12px',
                    opacity: 1
                });
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setSpotlightStyle({
                    top: '50%',
                    left: '50%',
                    width: 0,
                    height: 0,
                    opacity: 0
                });
            }
        };

        const timeout = setTimeout(calculateSpotlight, 600);
        window.addEventListener('resize', calculateSpotlight);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', calculateSpotlight);
        };
    }, [currentStep, isVisible, location.pathname, navigate]);

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            await handleComplete();
        }
    };

    const handleSkip = async () => {
        if (!user) return;
        setIsVisible(false);
        try {
            // Still mark as completed but no bonus points? Or just hide it.
            // User requested persistence, so we mark as completed.
            await supabaseService.profiles.completeTour(user.id);
            refreshProfile();
        } catch (e) {
            console.error(e);
        }
    };

    const handleComplete = async () => {
        if (!user || isCompleting) return;
        setIsCompleting(true);

        // 1. Trigger Animations
        setAuraTrigger(prev => prev + 1);
        setShowLevelUp(true);

        try {
            // 2. Persist to DB (+100 Aura)
            await supabaseService.profiles.completeTour(user.id);

            // 3. Refresh State
            await refreshProfile();

            // 4. Delay and Close
            setTimeout(() => {
                setIsVisible(false);
                setIsCompleting(false);
                setShowLevelUp(false);
            }, 3000);
        } catch (error) {
            console.error("Tour completion failed", error);
            setIsVisible(false);
            setIsCompleting(false);
            setShowLevelUp(false);
        }
    };

    if (!isVisible) return null;

    const isStart = currentStep === -1;
    const step = isStart ? null : STEPS[currentStep];

    return (
        <>
            <AuraParticles trigger={auraTrigger} amount={150} />

            {/* Spotlight Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 pointer-events-auto transition-all duration-500"
                style={{
                    maskImage: (isStart || showLevelUp) ? 'none' : `radial-gradient(circle at ${spotlightStyle.left}px ${spotlightStyle.top}px, transparent ${parseInt(spotlightStyle.width as string) / 2}px, black ${parseInt(spotlightStyle.width as string) / 2 + 20}px)`,
                    WebkitMaskImage: (isStart || showLevelUp) ? 'none' : `radial-gradient(circle at ${spotlightStyle.left}px ${spotlightStyle.top}px, transparent ${parseInt(spotlightStyle.width as string) / 2}px, black ${parseInt(spotlightStyle.width as string) / 2 + 20}px)`
                }}
            />

            {/* Level Up Animation Overlay */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="bg-gradient-to-b from-yellow-400 to-orange-500 bg-clip-text text-transparent text-7xl font-black font-fui uppercase tracking-tighter filter drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] mb-4"
                        >
                            Level Up
                        </motion.div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20"
                        >
                            <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-2xl font-black text-white">+100 AURA FARMED</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Target Highlight Ring */}
            {!isStart && !showLevelUp && spotlightStyle.opacity === 1 && (
                <motion.div
                    className="fixed z-[101] border-2 border-electric-teal shadow-[0_0_20px_rgba(45,212,191,0.5)] bg-transparent pointer-events-none"
                    initial={false}
                    animate={{
                        top: (spotlightStyle.top as number) - (spotlightStyle.height as number) / 2,
                        left: (spotlightStyle.left as number) - (spotlightStyle.width as number) / 2,
                        width: spotlightStyle.width,
                        height: spotlightStyle.height,
                        borderRadius: spotlightStyle.borderRadius
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            {/* Tour Card */}
            <div className={`fixed z-[102] pointer-events-none flex items-center justify-center w-full inset-0`}>
                <AnimatePresence mode="wait">
                    {showLevelUp ? null : isStart ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="pointer-events-auto w-[90%] max-w-sm bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-center"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-electric-teal to-transparent" />

                            <div className="w-20 h-20 rounded-[2.5rem] bg-electric-teal/10 flex items-center justify-center border border-electric-teal/20 mx-auto mb-8 shadow-2xl">
                                <Zap size={32} className="text-electric-teal fill-electric-teal/20" />
                            </div>

                            <h2 className="text-3xl font-black font-fui uppercase tracking-tighter text-white mb-2">
                                Farm Aura
                            </h2>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
                                Complete the 30-second tour to receive <span className="text-electric-teal font-black">+100 Bonus Aura</span> points.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setCurrentStep(0)}
                                    className="w-full py-4 bg-white text-black font-black font-fui uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-electric-teal transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2"
                                >
                                    Start Tour <ArrowRight size={14} />
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="w-full py-4 bg-white/5 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Skip & Forfeit Bonus
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="pointer-events-auto w-[90%] max-w-sm bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                            style={{
                                marginTop: spotlightStyle.top ? (spotlightStyle.top as number > window.innerHeight / 2 ? '-40vh' : '40vh') : '0'
                            }}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                                    {step!.icon}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-black font-fui uppercase tracking-tighter text-white">
                                        {step!.title}
                                    </h2>
                                    <div className="flex items-center gap-1 mt-1">
                                        {STEPS.map((_, i) => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-electric-teal' : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                                {step!.description}
                            </p>

                            <button
                                onClick={handleNext}
                                disabled={isCompleting}
                                className="w-full py-3.5 bg-white text-black font-black font-fui uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-electric-teal hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {currentStep === STEPS.length - 1 ? (
                                    <>
                                        {isCompleting ? "Processing..." : "Finish Tour"}
                                        <CheckCircle size={16} />
                                    </>
                                ) : (
                                    "Next"
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};
