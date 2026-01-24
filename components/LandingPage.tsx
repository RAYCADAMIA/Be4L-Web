import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MessageSquare, Ticket, ArrowRight, Zap } from 'lucide-react';
import { GradientButton, GlowText, GlassCard } from './ui/AestheticComponents';

interface LandingPageProps {
    onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    return (
        <div className="relative flex-1 h-full w-full flex flex-col overflow-hidden bg-deep-black">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[60%] rounded-full bg-primary/20 blur-[150px] animate-pulse opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] mix-blend-overlay" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-8 pb-16 overflow-y-auto no-scrollbar">

                {/* Hero Section */}
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Web Portal Live
                            </span>
                        </div>
                        <GlowText size="xl" className="tracking-tighter leading-[0.9] mb-4">
                            REAL LIFE.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-lime-300">GAMIFIED.</span>
                        </GlowText>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                            The void is waiting. Complete quests, connect with your squad, and claim your dibs on the real world.
                        </p>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="w-full max-w-sm grid grid-cols-1 gap-4 my-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Compass size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Quests</h3>
                                <p className="text-xs text-gray-500">Find real-world side missions.</p>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default group">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <MessageSquare size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Echo</h3>
                                <p className="text-xs text-gray-500">Encrypted squad comms.</p>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <GlassCard className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default group">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Ticket size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Dibs</h3>
                                <p className="text-xs text-gray-500">Book venues and events.</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full max-w-sm"
                >
                    <GradientButton onClick={onEnter} fullWidth className="py-5 text-sm">
                        ENTER WORLD <ArrowRight size={18} strokeWidth={3} />
                    </GradientButton>
                    <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-[0.2em] font-bold">
                        Be4L v0.6 Web
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
