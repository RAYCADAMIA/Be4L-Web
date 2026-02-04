import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { GlassCard, GradientButton } from '../ui/AestheticComponents';

interface QuestDrop {
    id: string;
    brand: string;
    brand_logo: string;
    title: string;
    description: string;
    reward: string;
    hunters_count: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE';
}

interface QuestDropCardProps {
    drop: QuestDrop;
    onAccept: (drop: QuestDrop) => void;
}

const QuestDropCard: React.FC<QuestDropCardProps> = ({ drop, onAccept }) => {
    if (!drop) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-sm mx-auto p-4"
            >
                <GlassCard className="p-8 border-white/5 relative overflow-hidden bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 min-h-[420px] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-700">
                                <Trophy size={20} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Quest Drop</span>
                                <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest leading-none">Idle Mode</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                            <span className="text-[7px] font-bold text-primary/60 uppercase tracking-widest">Coming Soon</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
                        <div className="relative mb-6">
                            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-gray-700">
                                <Trophy size={18} className="opacity-20" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-t border-primary/20 animate-spin" />
                        </div>

                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Core Objective</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em] px-4 leading-relaxed mb-6">
                            Let&apos;s heal our inner childhood.<br />
                            <span className="text-primary/60">Earn real rewards if you complete the dropped quest.</span>
                        </p>

                        <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5 w-full">
                            <p className="text-[8px] text-gray-600 font-medium italic leading-relaxed">
                                "Would you walk around the planet for $1B?"
                            </p>
                            <div className="h-[1px] w-4 bg-white/10 mx-auto" />
                            <p className="text-[8px] text-gray-600 font-medium italic leading-relaxed">
                                "Swim across the school pool with your uniform on for ₱500!"
                            </p>
                        </div>

                        {/* System Stats Section */}
                        <div className="w-full mt-8 grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-start">
                                <span className="text-[7px] font-black uppercase tracking-widest text-gray-800 mb-1">Last Signal</span>
                                <span className="text-[9px] font-bold text-gray-600 tabular-nums uppercase">2h 42m ago</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[7px] font-black uppercase tracking-widest text-gray-800 mb-1">Frequency</span>
                                <span className="text-[9px] font-bold text-gray-600 uppercase">Proximity High</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Progress */}
                    <div className="mt-auto pt-4">
                        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gray-800"
                                animate={{ width: ['0%', '100%'] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-sm mx-auto p-4"
        >
            <GlassCard className="p-8 border-white/10 relative overflow-hidden bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/5 min-h-[420px] flex flex-col">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16" />

                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Trophy size={20} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Quest Drop</span>
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">High Priority</span>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Verified</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-tight">
                            {drop.title}
                        </h2>
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed opacity-80 mb-6">
                            {drop.description}
                        </p>
                    </div>

                    {/* Reward Section */}
                    <div className="py-5 border-y border-white/5 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 mb-1">Grant Pool</span>
                            <div className="flex items-center gap-2">
                                <CreditCard size={12} className="text-primary" />
                                <span className="text-lg font-black italic tracking-tighter text-white">{drop.reward}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Slots</span>
                            <span className="text-xs font-black text-white">{drop.hunters_count} Hunters</span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-6">
                        <GradientButton
                            onClick={() => onAccept(drop)}
                            fullWidth
                            className="h-14 font-black italic uppercase tracking-[0.2em] text-[10px] gap-3"
                        >
                            Secure Drop <ArrowRight size={16} />
                        </GradientButton>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default QuestDropCard;
