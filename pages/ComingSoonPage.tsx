import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Zap, Camera, Heart, MessageCircle, MapPin, Globe } from 'lucide-react';

const floatingPool = [
    Compass, Sparkles, Zap, Camera, Heart, MessageCircle, MapPin, Globe
];

const FloatingIcon = ({ index }: { index: number }) => {
    const Icon = floatingPool[index % floatingPool.length];
    const x = `${(index * 23.3) % 100}%`;
    const y = `${(index * 31.7) % 100}%`;
    const delay = (index % 12) * 0.8;
    const duration = 20 + (index % 10);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 0.1, 0.1, 0],
                scale: [0.8, 1, 1, 0.8],
                y: [0, -100, 0],
                rotate: [0, 45, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            className="absolute p-4 bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/5 pointer-events-none"
            style={{ left: x, top: y }}
        >
            <Icon size={20} className="text-orange-500/30" />
        </motion.div>
    );
};

export const ComingSoonPage: React.FC = () => {
    return (
        <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center text-white font-sans">
            {/* Background Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <FloatingIcon key={i} index={i} />
                ))}
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 text-center px-6 max-w-2xl"
            >
                {/* Status Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
                >
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Currently in Alpha</span>
                </motion.div>

                {/* Logo / Brand */}
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 animate-liquid-text">
                    Be4L
                </h1>
                <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-12">
                    Always For Life
                </p>

                {/* Mission / About */}
                <div className="space-y-6 mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Minimize screen time. <br />
                        Maximize life time.
                    </h2>
                    <p className="text-cool-grey text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                        Be4L is a social utility for the real world. Conquer side quests, 
                        capture authentic moments, and turn digital planning into tangible experiences.
                    </p>
                </div>

                {/* Under Construction Message */}
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                    <h3 className="text-xl font-bold mb-2">Our MVP is cooking.</h3>
                    <p className="text-white/40 text-sm mb-6">
                        We're currently migrating our prototype to a high-performance 
                        production infrastructure. See you on the other side.
                    </p>
                    
                    {/* Placeholder for Email / Socials */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <a 
                            href="https://instagram.com/be4l.app" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
                        >
                            Follow the Lore
                        </a>
                        <button 
                            className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                        >
                            Get Notified
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 w-full text-center">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    &copy; 2026 Be4L Labs. All Rights Reserved.
                </p>
            </div>
        </div>
    );
};

export default ComingSoonPage;
