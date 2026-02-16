import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Zap, Shield, Sparkles } from 'lucide-react';

export const ChatGuestTeaser: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto w-full h-full relative overflow-hidden">
            {/* Background Ambient Glows */}
            {/* Background Ambient Glows - Toned Down */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-teal/[0.02] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

            {/* Main Visual: Encrypted Signal Transmission */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 mb-12"
            >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-white/[0.03] border border-white/10 flex items-center justify-center relative group">
                    {/* Static Background Ring */}
                    <div className="absolute inset-0 border border-white/5 rounded-[3rem]" />

                    <MessageCircle size={48} className="text-electric-teal relative z-10" />
                </div>
            </motion.div>

            {/* Value Proposition */}
            <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                        Enter the <span className="text-electric-teal">Chat</span>
                    </h2>
                    <p className="text-sm md:text-base font-medium text-gray-400 max-w-lg mx-auto uppercase tracking-wide">
                        Coordinate quests and connect with those who share your intent. Join squads or go global. Let's all be friends!
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
                    {[
                        { icon: <Zap size={18} />, title: "Real-time", desc: "Connect instantly" },
                        { icon: <Users size={18} />, title: "Squads", desc: "Chat with friends" },
                        { icon: <Shield size={18} />, title: "Private", desc: "Safe and secure" }
                    ].map((f, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            key={i}
                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2"
                        >
                            <div className="text-electric-teal mb-1">{f.icon}</div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{f.title}</h3>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="pt-4 flex flex-col items-center gap-4">
                    <button
                        onClick={() => window.dispatchEvent(new Event('trigger-auth-modal'))}
                        className="group relative px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Join the Chat <Sparkles size={14} />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-electric-teal to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]" />
                </div>
            </div>

            {/* Preview Mock (Blurred Background) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
                <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full p-8 rotate-12 scale-150">
                    {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className={`rounded-xl border border-white/10 ${i % 7 === 0 ? 'bg-electric-teal/20 animate-pulse' : 'bg-white/5'}`} />
                    ))}
                </div>
            </div>


            {/* Floating Aesthetic Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, 20, 0],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 5 + i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 1.5
                        }}
                        className="absolute w-24 h-24 bg-electric-teal/10 rounded-full blur-3xl"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
