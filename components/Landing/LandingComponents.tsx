import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface UserCTAProps {
    onJoinClick: () => void;
}

export const UserCTA: React.FC<UserCTAProps> = ({ onJoinClick }) => {
    return (
        <section className="py-32 px-6 relative text-white overflow-hidden select-none">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center relative z-10"
            >
                <h3 className="text-4xl md:text-8xl font-black mb-8 tracking-tighter font-display uppercase leading-none">
                    Urge to experience <br className="hidden md:block" />
                    <span className="animate-liquid-text">everything?</span>
                </h3>
                <p className="text-lg md:text-xl text-cool-grey mb-10 max-w-2xl mx-auto font-medium font-sans">
                    Sports, adventures, socials, random 3AM ideas.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12 max-w-3xl mx-auto">
                    {['Pickleball', 'Hiking', 'Concerts', 'Workshops', 'House Parties', 'Road Trips', 'Tournaments', 'Cafe Runs', 'Midnight Drives', 'Arcade', 'Bowling'].map(cat => (
                        <div key={cat} className="px-6 py-2.5 rounded-2xl glass-panel text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:border-electric-teal/50 hover:bg-electric-teal/5 transition-all cursor-default font-display bg-white/[0.01]">
                            {cat}
                        </div>
                    ))}
                </div>
                <div className="space-y-6">
                    <p className="text-base text-cool-grey font-medium font-sans">
                        Live life to the fullest. Because why not?
                    </p>
                    <button
                        onClick={onJoinClick}
                        className="px-16 py-6 bg-white text-deep-void font-black rounded-3xl hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(45,212,191,0.5)] transition-all uppercase tracking-widest text-lg font-display group overflow-hidden"
                    >
                        <span className="animate-liquid-text">Join the chat</span>
                    </button>
                </div>
            </motion.div>
        </section>
    );
};

export const PartnerPitch: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center relative z-10"
            >
                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 font-display uppercase tracking-tighter animate-liquid-text">Are you an Operator?</h3>
                <p className="text-base md:text-lg text-cool-grey mb-8 max-w-xl mx-auto font-sans font-medium">
                    Manage venues, organize events, or offer services. Create your world in Dibs and connect with the community.
                </p>
                <button
                    onClick={() => navigate('/partner')}
                    className="px-8 py-3 glass-panel text-white font-bold rounded-full hover:border-electric-teal transition-all text-xs tracking-widest font-display"
                >
                    <span className="animate-text-gradient">Partner with Be4L</span>
                </button>
            </motion.div>
        </section>
    );
};

export const TeamRecruitment: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 px-6 relative overflow-hidden bg-white/[0.01]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-electric-teal animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">We are Hiring</span>
                </div>
                <h3 className="text-3xl md:text-6xl font-black text-white mb-6 font-display uppercase tracking-tighter animate-liquid-text">Are you up for a side quest?</h3>
                <p className="text-base md:text-lg text-cool-grey mb-10 max-w-xl mx-auto font-sans font-medium">
                    We're looking for dreamers, action-driven people, and anyone who chooses to live life to the fullest. Join our quest!
                </p>
                <button
                    onClick={() => navigate('/team')}
                    className="px-10 py-4 bg-white text-deep-void font-black rounded-2xl hover:scale-105 transition-all text-xs tracking-widest font-display shadow-xl"
                >
                    Join our team
                </button>
            </motion.div>
        </section>
    );
};

export const PoweredBy: React.FC = () => {
    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 text-center">
                <h4 className="text-sm md:text-base font-black uppercase tracking-[0.6em] font-display animate-liquid-text bg-clip-text text-transparent bg-gradient-to-r from-electric-teal via-cyan-400 to-indigo-400">In Partnership With</h4>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="group"
                >
                    <img
                        src="/assets/landing/partnership_v2.jpg"
                        alt="Partnership Logos"
                        className="h-24 md:h-36 w-auto object-contain rounded-2xl md:rounded-[2rem] transition-all duration-500 hover:scale-105 shadow-[0_0_30px_rgba(30,64,175,0.2)] hover:shadow-[0_0_50px_rgba(30,64,175,0.4)]"
                    />
                </motion.div>
            </div>
        </section>
    );
};

interface HUDMenuProps {
    onJoinClick: () => void;
    isScrolled?: boolean;
    onReset?: () => void;
}

export const HUDMenu: React.FC<HUDMenuProps> = ({ onJoinClick, isScrolled = true, onReset }) => {
    const navigate = useNavigate();

    return (
        <motion.nav
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{
                y: isScrolled ? 0 : -100,
                x: "-50%",
                opacity: isScrolled ? 1 : 0,
                scale: isScrolled ? 1 : 0.8
            }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className={`fixed top-4 md:top-6 left-1/2 z-50 px-4 md:px-6 py-2 md:py-3 rounded-full glass-panel flex items-center gap-4 md:gap-8 shadow-2xl transition-all ${!isScrolled ? 'pointer-events-none' : ''}`}
        >
            <motion.div
                layoutId="main-logo"
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => {
                    if (window.scrollY < 10) {
                        if (onReset) {
                            onReset();
                        } else {
                            window.location.reload();
                        }
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
            >
                <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center transition-transform group-hover:scale-110">
                    {/* Simplified Logo SVG - Electric Teal */}
                    <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">
                        <defs>
                            <linearGradient id="hudLogoGradient" x1="0%" y1="0%" x2="200%" y2="0%">
                                <stop offset="0%" stopColor="#2dd4bf">
                                    <animate attributeName="stop-color" values="#2dd4bf;#06b6d4;#a855f7;#06b6d4;#2dd4bf" dur="3s" repeatCount="indefinite" />
                                </stop>
                                <stop offset="50%" stopColor="#a855f7">
                                    <animate attributeName="stop-color" values="#a855f7;#06b6d4;#2dd4bf;#06b6d4;#a855f7" dur="3s" repeatCount="indefinite" />
                                </stop>
                                <stop offset="100%" stopColor="#2dd4bf">
                                    <animate attributeName="stop-color" values="#2dd4bf;#06b6d4;#a855f7;#06b6d4;#2dd4bf" dur="3s" repeatCount="indefinite" />
                                </stop>
                            </linearGradient>
                        </defs>
                        <path d="M100,30 C100,30 90,10 70,10 C50,10 40,30 40,50 C40,75 100,90 100,90 C100,90 160,75 160,50 C160,30 150,10 130,10 C110,10 100,30 100,30 Z" fill="url(#hudLogoGradient)" />
                    </svg>
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-sm md:text-base font-black tracking-tighter font-display animate-liquid-text">Be4L</span>
                    <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest animate-liquid-text opacity-50">Beta</span>
                </div>
            </motion.div>
            <div className="hidden md:flex items-center gap-6">
                <a href="#vision" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors font-display">Vision</a>
                <a href="#roadmap" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors font-display">Roadmap</a>
                <button
                    onClick={() => navigate('/partner')}
                    className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors font-display"
                >
                    Partner
                </button>
            </div>
            <button
                onClick={onJoinClick}
                className="px-5 py-2 bg-white text-deep-void text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all whitespace-nowrap font-display shadow-lg group"
            >
                <span className="animate-text-gradient">Join the chat</span>
            </button>
        </motion.nav>
    );
};

export const Starfield: React.FC = () => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Removed hardcoded dark background to let global vibrant background shine through */}

            {/* Aurora Passing Strikes - Replacing static blobs for better clarity */}
            <motion.div
                className="absolute top-0 left-[-50%] w-[200%] h-px bg-gradient-to-r from-transparent via-electric-teal/10 to-transparent filter blur-[1px] pointer-events-none"
                animate={{
                    y: ["-10vh", "110vh"],
                    opacity: [0, 0.4, 0]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 2
                }}
            />
            <motion.div
                className="absolute top-0 right-[-50%] w-[150%] h-[1px] bg-gradient-to-l from-transparent via-electric-teal/10 to-transparent filter blur-[1px] transform rotate-[-15deg] pointer-events-none"
                animate={{
                    y: ["-20vh", "120vh"],
                    opacity: [0, 0.3, 0]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 7
                }}
            />

            {/* Layer 1 - Tiny Dense Stars - Static Position */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 10% 20%, white, transparent), radial-gradient(1px 1px at 30% 50%, white, transparent), radial-gradient(1px 1px at 50% 80%, white, transparent), radial-gradient(1px 1px at 70% 30%, white, transparent), radial-gradient(1px 1px at 90% 60%, white, transparent), radial-gradient(1px 1px at 20% 80%, white, transparent), radial-gradient(1px 1px at 40% 10%, white, transparent), radial-gradient(1px 1px at 60% 40%, white, transparent), radial-gradient(1px 1px at 80% 90%, white, transparent)',
                    backgroundSize: '250px 250px',
                    opacity: 0.3,
                }}
                animate={{
                    x: mousePosition.x * 10,
                    y: mousePosition.y * 10
                }}
                transition={{ type: "spring", stiffness: 20, damping: 40 }}
            />

            {/* Layer 2 - Medium Twinkling Stars - Static Position */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(2px 2px at 15% 25%, white, transparent), radial-gradient(2px 2px at 35% 55%, white, transparent), radial-gradient(2px 2px at 55% 85%, white, transparent), radial-gradient(2px 2px at 75% 35%, white, transparent), radial-gradient(2px 2px at 95% 65%, white, transparent)',
                    backgroundSize: '350px 350px',
                }}
                animate={{
                    opacity: [0.2, 0.6, 0.2],
                    x: mousePosition.x * 20,
                    y: mousePosition.y * 20
                }}
                transition={{
                    opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    x: { type: "spring", stiffness: 15 },
                    y: { type: "spring", stiffness: 15 }
                }}
            />

            {/* Layer 3 - Bright Accents - Static Position */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(2px 2px at 25% 15%, #2DD4BF, transparent), radial-gradient(2px 2px at 45% 45%, #2DD4BF, transparent), radial-gradient(2px 2px at 65% 75%, #2DD4BF, transparent), radial-gradient(2px 2px at 85% 25%, #2DD4BF, transparent), radial-gradient(3px 3px at 50% 50%, white, transparent)',
                    backgroundSize: '400px 400px',
                }}
                animate={{
                    opacity: [0.3, 0.8, 0.3],
                    x: mousePosition.x * 30,
                    y: mousePosition.y * 30
                }}
                transition={{
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" },
                    x: { type: "spring", stiffness: 10 },
                    y: { type: "spring", stiffness: 10 }
                }}
            />
        </div>
    );
};
export const LogoEvolution: React.FC<{
    expanded?: boolean;
    sizeClass?: string;
}> = ({ expanded = false, sizeClass = "" }) => {
    return (
        <motion.div
            layout
            className={`flex items-center justify-center font-black tracking-tighter font-display select-none overflow-visible ${sizeClass}`}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <motion.span
                layoutId="logo-be"
                className="animate-text-gradient pr-1"
            >
                Be
            </motion.span>

            <div className="relative flex items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                    {!expanded ? (
                        <motion.span
                            key="token-4"
                            layoutId="logo-4"
                            initial={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, width: 0 }}
                            className="animate-text-gradient px-1 md:px-2"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            4
                        </motion.span>
                    ) : (
                        <motion.span
                            key="token-for"
                            initial={{ opacity: 0, scale: 0.8, width: 0 }}
                            animate={{ opacity: 1, scale: 1, width: "auto" }}
                            className="animate-text-gradient px-2 md:px-4 whitespace-nowrap overflow-hidden"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            For
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center">
                <motion.span
                    layoutId="logo-l"
                    className="animate-text-gradient"
                >
                    L
                </motion.span>
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={expanded ? { width: "auto", opacity: 1 } : { width: 0, opacity: 0 }}
                    className="overflow-hidden flex"
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    <span className="animate-text-gradient pr-4">ife</span>
                </motion.div>
            </div>
        </motion.div >
    );
};
