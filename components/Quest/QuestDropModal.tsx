import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CreditCard, ArrowRight } from 'lucide-react';
import { Sheet } from '../ui/Sheet';

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
    onAccept?: () => void;
}

const QuestDropModal: React.FC<QuestDropModalProps> = ({ drop, onClose, onAccept }) => {
    return (
        <Sheet
            open={!!drop}
            onClose={onClose}
            variant="dialog"
            size="sm"
            showClose={false}
            className="!p-0 overflow-hidden border-[#FF8C00]/20 shadow-[0_0_50px_rgba(255,140,0,0.15)]"
        >
            {drop && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="relative"
                >
                    {/* Dusk gradient accent strip */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#FF8C00] via-[#E34234] to-[#800020]" />

                    {/* Ambient warm glow */}
                    <motion.div
                        aria-hidden
                        className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#FF8C00]/20 blur-[100px] pointer-events-none"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <div className="relative p-8">
                        <div className="flex items-center gap-3 mb-7">
                            <div className="w-10 h-10 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/30 flex items-center justify-center text-[#FFB854]">
                                <Trophy size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB854]">
                                    System Drop
                                </span>
                                <span className="text-[8px] font-bold text-[#8B7E6D] uppercase tracking-widest">
                                    Priority Task
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={drop.brand_logo}
                                        className="w-4 h-4 rounded-full opacity-70"
                                        alt=""
                                    />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#8B7E6D]">
                                        {drop.brand} Verified
                                    </span>
                                </div>
                                <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-[#F5E6D3] leading-tight">
                                    {drop.title}
                                </h2>
                                <p className="text-[11px] text-[#F5E6D3]/70 font-medium leading-relaxed">
                                    {drop.description}
                                </p>
                            </div>

                            <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-[#FF8C00]/10 to-transparent border border-[#FF8C00]/20 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-[#FFB854]/70 mb-1">
                                        Guaranteed Reward
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-[#FF8C00]/20 flex items-center justify-center text-[#FFB854]">
                                            <CreditCard size={12} />
                                        </div>
                                        <span className="text-lg font-black tracking-tighter text-[#F5E6D3]">
                                            {drop.reward}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-[#8B7E6D] mb-1">
                                        Slots Left
                                    </span>
                                    <span className="text-xs font-black text-[#F5E6D3]">
                                        {drop.hunters_count} Hunters
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        onAccept?.();
                                        onClose();
                                    }}
                                    className="w-full h-14 rounded-full bg-white text-[#080707] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-2xl shadow-[#FF8C00]/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Accept Challenge <ArrowRight size={16} />
                                </button>
                                <p className="text-center mt-4 text-[7px] font-black text-[#8B7E6D] uppercase tracking-[0.3em]">
                                    Marketing & Influence Revolutionized
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </Sheet>
    );
};

export default QuestDropModal;
