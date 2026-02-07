import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, Sparkles, CreditCard, Gift, ArrowRight, ShieldCheck } from 'lucide-react';
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

interface QuestDropModalProps {
    drop: QuestDrop | null;
    onClose: () => void;
}

const QuestDropModal: React.FC<QuestDropModalProps> = ({ drop, onClose }) => {
    if (!drop) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative z-10 w-full max-w-sm"
            >
                <GlassCard className="overflow-hidden border-primary/20 shadow-[0_0_50px_rgba(45,212,191,0.15)] bg-[#050505] p-0">
                    {/* Top Accent Strip */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-purple-600" />

                    <div className="p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <Trophy size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Drop</span>
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Priority Task</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <img src={drop.brand_logo} className="w-4 h-4 rounded-full opacity-60" alt="" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{drop.brand} Verified</span>
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">
                                    {drop.title}
                                </h2>
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed opacity-80">
                                    {drop.description}
                                </p>
                            </div>

                            {/* Reward Box */}
                            <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-primary/60 mb-1">Guaranteed Reward</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                            <CreditCard size={12} />
                                        </div>
                                        <span className="text-lg font-black tracking-tighter text-white">{drop.reward}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 mb-1">Slots Left</span>
                                    <span className="text-xs font-black text-white">{drop.hunters_count} Hunters</span>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="pt-2">
                                <GradientButton fullWidth className="h-14 font-black uppercase tracking-[0.2em] text-[10px] gap-3">
                                    Accept Challenge <ArrowRight size={16} />
                                </GradientButton>
                                <p className="text-center mt-4 text-[7px] font-black text-gray-600 uppercase tracking-[0.3em]">
                                    Marketing & Influence Revolutionized
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default QuestDropModal;
